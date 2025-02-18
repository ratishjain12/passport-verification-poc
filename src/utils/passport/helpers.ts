import { v2 as cloudinary } from "cloudinary";
import { OpenAI } from "openai";
import { parseMRZ } from "../mrz/parseMRZ";
import { verifyMRZ } from "../mrz/verifyMRZ";
import { checkValidName } from "../validation/verifyName";
import type {
  ValidationParams,
  ValidationResult,
  GoogleSheetsData,
  ExtractedPassportData,
} from "../types/passport";

const GOOGLE_SHEET_WEB_APP_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractPassportDetails(
  frontBase64: string
): Promise<ExtractedPassportData> {
  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          'Extract passport details (Full Name, Date of Birth, Passport Number, Expiry Date) and the MRZ (Machine Readable Zone) string from the image. Ensure the MRZ as well as all other fields are correctly extracted with no characters missed. The MRZ must be formatted as two lines separated by an escaped newline character (`\\n`) as shown in the example below. The date of birth must be in the format YYYY-MM-DD. Respond **only** in JSON format with no extra text, double check mrz is correctly extracted. Example: ```json { "name": "John Doe", "date_of_birth": "1990-01-01", "passport_number": "A1234567", "mrz": "P<INDRAMADUGLA<<SITA<MAHA<LAKSHMI<<<<<<<<<<<<<<\\nJ8369854<4IND5909234F2110101<<<<<<<<<<<<<<<<<8"}```',
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
  console.log("Raw AI Response:", aiResponseText);

  let cleanedResponse = aiResponseText.replace(/```json|```/g, "").trim();
  cleanedResponse = cleanedResponse.replace(/^json\s*/, "").trim();

  if (!cleanedResponse.startsWith("{")) {
    throw new Error("Invalid JSON format: Expected JSON object.");
  }

  return JSON.parse(cleanedResponse);
}

export async function uploadToCloudinary(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({}, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
}

export function extractFormData(formData: FormData) {
  return {
    fullName: formData.get("fullName") as string,
    dateOfBirth: formData.get("dateOfBirth") as string,
    passportNumber: formData.get("passportNumber") as string,
    frontImage: formData.get("frontImage") as File,
    backImage: formData.get("backImage") as File,
  };
}

export function validatePassportData(
  params: ValidationParams
): ValidationResult {
  const { inputName, inputDOB, inputPassportNumber, extractedData, mrz } =
    params;

  console.log("inputName", inputName);
  console.log("inputDOB", inputDOB);
  console.log("inputPassportNumber", inputPassportNumber);
  console.log("extractedData", extractedData.name);
  console.log("mrz", mrz);

  const mrzData = parseMRZ(mrz);

  const isValidName = checkValidName(inputName, extractedData.name);
  const isValidDOB = extractedData.date_of_birth === inputDOB;
  const isValidPassport = extractedData.passport_number === inputPassportNumber;
  const isValidMRZ = verifyMRZ(
    mrzData.passportNumber,
    mrzData.dob,
    mrzData.expiry,
    mrzData.passportCheckDigit,
    mrzData.dobCheckDigit,
    mrzData.expiryCheckDigit
  );

  return {
    isValid:
      isValidName &&
      isValidDOB &&
      isValidPassport &&
      isValidMRZ &&
      mrzData.nationality === "IND",
    details: { isValidName, isValidDOB, isValidPassport, isValidMRZ },
  };
}

export async function saveToGoogleSheets(
  data: GoogleSheetsData
): Promise<string> {
  const response = await fetch(GOOGLE_SHEET_WEB_APP_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      inputDOB: data.dob,
      passportNumber: data.passportNumber,
      isValid: data.isValid,
      frontImage: data.frontImageUrl,
      backImage: data.backImageUrl,
    }),
  });

  const responseData = await response.text();
  if (!responseData) throw new Error("Failed to update Google Sheets");
  return responseData;
}
