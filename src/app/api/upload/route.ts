/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import {
  extractPassportDetails,
  uploadToCloudinary,
  extractFormData,
  validatePassportData,
  saveToGoogleSheets,
} from "@/utils/passport/helpers";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // 1. Extract form data
    const formData = await req.formData();
    const { fullName, dateOfBirth, passportNumber, frontImage, backImage } =
      extractFormData(formData);

    if (!frontImage || !backImage) {
      return NextResponse.json(
        { error: "Both images are required" },
        { status: 400 }
      );
    }

    // 2. Process images
    const frontBuffer = Buffer.from(await frontImage.arrayBuffer());
    const backBuffer = Buffer.from(await backImage.arrayBuffer());
    const frontBase64 = frontBuffer.toString("base64");
    const backBase64 = backBuffer.toString("base64");

    // 3. Extract passport details using OpenAI
    let extractedData;
    try {
      extractedData = await extractPassportDetails(frontBase64, backBase64);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // 4. Validate passport data
    const validationResult = validatePassportData({
      inputName: fullName,
      inputDOB: dateOfBirth,
      inputPassportNumber: passportNumber,
      extractedData,
      mrz: extractedData.mrz,
    });

    // 5. Upload images to Cloudinary
    const [frontUpload, backUpload] = await Promise.all([
      uploadToCloudinary(frontBuffer),
      uploadToCloudinary(backBuffer),
    ]);

    const frontImageUrl = (frontUpload as any).secure_url;
    const backImageUrl = (backUpload as any).secure_url;

    // 6. Save to Google Sheets
    await saveToGoogleSheets({
      name: fullName,
      dob: dateOfBirth,
      passportNumber: extractedData.passport_number?.trim() || "",
      expiry: extractedData.expiry_date,
      city: extractedData.city,
      state: extractedData.state,
      country: extractedData.country,
      pincode: extractedData.postalCode,
      address1: extractedData.address1,
      address2: extractedData.address2,
      isValid: validationResult.isValid,
      frontImageUrl,
      backImageUrl,
    });

    if (validationResult.isValid) {
      // Redirect to contact details page with verified status
      return NextResponse.json({
        success: true,
        isValid: true,
        passportDetails: {
          name: fullName,
          dateOfBirth,
          passportNumber,
          isVerified: true,
        },
        contactDetails: {
          city: extractedData.city || "",
          state: extractedData.state || "",
          country: extractedData.country || "",
          postalCode: extractedData.postalCode || "",
          address1: extractedData.address1 || "",
          address2: extractedData.address2 || "",
        },
        nextStep: "/personal-details",
      });
    }

    return NextResponse.json({
      success: false,
      isValid: false,
      validationDetails: validationResult.details,
      nextStep: "/verification-failed",
    });
  } catch (error) {
    console.error("Processing Error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
