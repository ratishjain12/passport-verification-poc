/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { OpenAI } from "openai";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Google Apps Script URL
const GOOGLE_SHEET_WEB_APP_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

// Initialize OpenAI (Server-side for security)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function checkValidName(providedName: string, extractedName: string): boolean {
  // Normalize case and remove extra spaces
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z]/g, "");

  const normalizedProvided = normalize(providedName);
  const normalizedExtracted = normalize(extractedName);

  // Ensure extracted name is not empty
  if (!normalizedExtracted) return false;

  // Build regex to check how many characters match
  const matchCount = (
    normalizedExtracted.match(new RegExp(`[${normalizedProvided}]`, "g")) || []
  ).length;

  // Calculate match percentage
  const matchPercentage = (matchCount / normalizedProvided.length) * 100;

  console.log(
    `Match %: ${matchPercentage} | Provided: ${normalizedProvided}, Extracted: ${normalizedExtracted}`
  );

  // Return true if 80% of the characters match
  return matchPercentage >= 80;
}

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

    // Convert front image to base64 for OpenAI processing
    const frontBuffer = Buffer.from(await frontFile.arrayBuffer());
    const frontBase64 = frontBuffer.toString("base64");

    // 🟢 Step 1: Use OpenAI Vision to Extract Passport Details
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            'Extract passport details (Full Name, Date of Birth, Passport Number) from the image. Respond **only** in JSON format with no extra text. Example: { "name": "John Doe", "date_of_birth": "1990-01-01", "passport_number": "A1234567" }',
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
    console.log("AI Response Content:", aiResponseText); // Debugging log

    let extractedData: any;
    try {
      // Extract JSON safely (handles cases with triple backticks)
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]); // Parse only the extracted JSON
      } else {
        throw new Error("AI response did not contain valid JSON.");
      }
    } catch (error) {
      console.error(
        "JSON Parsing Error:",
        error,
        "Raw Response:",
        aiResponseText
      );
      return NextResponse.json(
        {
          error:
            "Failed to parse AI response. OpenAI response may be malformed.",
          rawResponse: aiResponseText,
        },
        { status: 500 }
      );
    }

    const extractedName = extractedData.name?.trim() || "";
    const extractedDOB = extractedData.date_of_birth?.trim() || "";
    const extractedPassportNumber = extractedData.passport_number?.trim() || "";

    // 🟢 Step 3: Validate Extracted Data
    const isValidName = checkValidName(name, extractedName);

    const isValidDOB = extractedDOB === dob;
    const isValidPassport = extractedPassportNumber === passportNumber;
    const isValid = isValidName && isValidDOB && isValidPassport;

    console.log({ isValidName, isValidDOB, isValidPassport });

    // 🟢 Step 4: Upload to Cloudinary
    const frontUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({}, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(frontBuffer);
    });

    const backBuffer = Buffer.from(await backFile.arrayBuffer());
    const backUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({}, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(backBuffer);
    });

    // 🟢 Step 5: Save to Google Sheets
    const sheetResponse = await fetch(GOOGLE_SHEET_WEB_APP_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        inputDOB: dob,
        passportNumber: extractedData.passport_number?.trim() || "",
        isValid,
        frontImage: (frontUpload as any).secure_url,
        backImage: (backUpload as any).secure_url,
      }),
    });

    const sheetData = await sheetResponse.text();
    if (!sheetData) throw new Error("Failed to update Google Sheets");

    return NextResponse.json({
      success: true,
      isValid,
      extractedData,
      frontImage: (frontUpload as any).secure_url,
      backImage: (backUpload as any).secure_url,
    });
  } catch (error) {
    console.error("Processing Error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
