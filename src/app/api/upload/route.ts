/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { OpenAI } from "openai";
import { parseMRZ } from "@/utils/parseMRZ";
import { verifyMRZ } from "@/utils/verifyMRZ";
import { checkValidName } from "@/utils/verifyName";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const GOOGLE_SHEET_WEB_APP_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const dob = formData.get("dob") as string;
    const passportNumber = formData.get("passportNumber") as string;
    const frontFile = formData.get("frontImage") as File;
    const backFile = formData.get("backImage") as File;

    if (!frontFile || !backFile) {
      return NextResponse.json(
        { error: "Both images are required" },
        { status: 400 }
      );
    }

    const frontBuffer = Buffer.from(await frontFile.arrayBuffer());
    const backBuffer = Buffer.from(await backFile.arrayBuffer());
    const frontBase64 = frontBuffer.toString("base64");

    // 🟢 Step 2: Extract Passport Details and MRZ from Image using OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            'Extract passport details (Full Name, Date of Birth, Passport Number, Expiry Date) and the MRZ (Machine Readable Zone) string from the image. Ensure the MRZ as well as all other fields are correctly extracted with no characters missed. The MRZ must be formatted as two lines separated by an escaped newline character (`\\n`) as shown in the example below. The date of birth must be in the format YYYY-MM-DD. Respond **only** in JSON format with no extra text. Example: ```json { "name": "John Doe", "date_of_birth": "1990-01-01", "passport_number": "A1234567", "mrz": "P<INDRAMADUGLA<<SITA<MAHA<LAKSHMI<<<<<<<<<<<<<<\\nJ8369854<4IND5909234F2110101<<<<<<<<<<<<<<<<<8"}```',
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract details from this passport image and return as JSON.",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${frontBase64}` },
            },
          ],
        },
      ],
    });

    const aiResponseText = aiResponse.choices[0]?.message?.content || "";
    // Log the raw AI response for debugging
    console.log("Raw AI Response:", aiResponseText);

    let extractedData: any;
    try {
      // Strip Markdown formatting (e.g., ```json ... ```)
      let cleanedResponse = aiResponseText.replace(/```json|```/g, "").trim();

      // Remove any leading text like "json" or other prefixes
      cleanedResponse = cleanedResponse.replace(/^json\s*/, "").trim();

      // Validate and parse the cleaned JSON string
      if (!cleanedResponse.startsWith("{")) {
        throw new Error("Invalid JSON format: Expected JSON object.");
      }

      extractedData = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.error("Raw AI Response for Debugging:", aiResponseText);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    const {
      name: extractedName,
      date_of_birth,
      passport_number,
      mrz,
    } = extractedData;

    // 🟢 Step 3: Parse MRZ Fields
    const {
      passportNumber: mrzpassportNumber,
      passportCheckDigit,
      dob: mrzdob,
      dobCheckDigit,
      nationality,
      expiry: mrzexpiry,
      expiryCheckDigit,
    } = parseMRZ(mrz);

    // 🟢 Step 4: Validate Data
    const isValidName = checkValidName(name, extractedName);
    const isValidDOB = date_of_birth === dob;
    const isValidPassport = passport_number === passportNumber;

    // Validate MRZ
    const isValidMRZ = verifyMRZ(
      mrzpassportNumber,
      mrzdob,
      mrzexpiry,
      passportCheckDigit,
      dobCheckDigit,
      expiryCheckDigit
    );

    const isValid =
      isValidName &&
      isValidDOB &&
      isValidPassport &&
      isValidMRZ &&
      nationality === "IND";

    console.log({ isValidName, isValidDOB, isValidPassport, isValidMRZ });
    const frontUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({}, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(frontBuffer);
    });
    const backUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({}, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(backBuffer);
    });

    const frontImageUrl = (frontUpload as any).secure_url;
    const backImageUrl = (backUpload as any).secure_url;

    // 🟢 Step 5: Save Data to Google Sheets
    const sheetResponse = await fetch(GOOGLE_SHEET_WEB_APP_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        inputDOB: dob,
        passportNumber: extractedData.passport_number?.trim() || "",
        isValid,
        frontImage: frontImageUrl,
        backImage: backImageUrl,
      }),
    });

    const sheetData = await sheetResponse.text();
    if (!sheetData) throw new Error("Failed to update Google Sheets");

    return NextResponse.json({
      success: true,
      isValid,
      extractedData,
      frontImage: frontImageUrl,
      backImage: backImageUrl,
    });
  } catch (error) {
    console.error("Processing Error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
