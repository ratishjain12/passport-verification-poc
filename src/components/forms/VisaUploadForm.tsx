/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setVisaDetails } from "@/store/userSlice";
import { usePDFJS } from "@/hooks/usePDFJS";

export default function VisaUploadForm() {
  const [visaPDF, setVisaPDF] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error messages
  const userDetails = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const dispatch = useDispatch();
  const passportDetails = userDetails.passportDetails;
  useEffect(() => {
    if (!passportDetails.isVerified || userDetails.visaDetails?.isVerified) {
      router.push("/");
    }
  }, [passportDetails.isVerified, router, userDetails.visaDetails?.isVerified]);

  usePDFJS(
    async (pdfjs) => {
      if (!visaPDF) return;
      try {
        // Validate file type and size
        if (!visaPDF.type.startsWith("application/pdf")) {
          setErrorMessage("Please upload a valid PDF file.");
          return;
        }
        if (visaPDF.size > 5 * 1024 * 1024) {
          setErrorMessage("File size exceeds the maximum limit of 5 MB.");
          return;
        }
        // Read the uploaded PDF file as an ArrayBuffer
        const fileArrayBuffer = await visaPDF.arrayBuffer();
        // Parse the PDF using pdfjs-dist
        const pdf = await pdfjs.getDocument(fileArrayBuffer).promise;
        // Extract text from all pages
        const numPages = pdf.numPages;
        let extractedText = "";
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          extractedText += pageText + " ";
        }
        extractedText = extractedText.toLowerCase();
        const requiredKeywords = [
          "e-visa number",
          "name",
          "date of birth",
          "nationality",
          "visa issue date",
          "visa valid till",
          "type of visa",
          "visa issuing authority",
          //"Travel Document Number"
        ];
        const isVisaPDF = requiredKeywords.every((keyword) =>
          extractedText.toLowerCase().includes(keyword)
        );
        if (!isVisaPDF) {
          setErrorMessage(
            "The uploaded file does not appear to be a valid visa document."
          );
          return;
        }
        // Validate extracted text against passport details
        const { name, dateOfBirth } = passportDetails;
        console.log(name, dateOfBirth);
        const extractDOBPattern = /(\d{2})\/(\d{2})\/(\d{4})/;
        const extractedDOBMatch = extractedText.match(extractDOBPattern);
        let extractedDOBFormatted = "";
        if (extractedDOBMatch) {
          const [_, day, month, year] = extractedDOBMatch;
          extractedDOBFormatted = `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
          console.log(
            "📌 Extracted Visa DOB (Converted):",
            extractedDOBFormatted
          );
        }
        const nameMatch = name
          .toLowerCase()
          .split(" ")
          .every((part) => extractedText.includes(part));
        const dobMatch = extractedDOBFormatted === dateOfBirth;
        // const passportMatch = extractedText.includes(passportNumber);
        if (!nameMatch || !dobMatch) {
          setErrorMessage("Visa details do not match passport details.");
          return;
        }
        // If validation passes, proceed to the next step
        dispatch(setVisaDetails({ isVerified: true }));
        router.push("/success");
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("Invalid PDF structure")) {
            setErrorMessage(
              "The uploaded file is not a valid PDF. Please upload a valid file."
            );
          } else if (error.message.includes("Password required")) {
            setErrorMessage(
              "The uploaded PDF is password-protected. Please upload an unprotected file."
            );
          } else {
            setErrorMessage(
              "An unexpected error occurred while processing the PDF. Please try again."
            );
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting] // Re-run the hook whenever `visaPDF` changes
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visaPDF) return;
    setIsSubmitting(true);
    setErrorMessage(null); // Clear any previous error message
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Card Container */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">Upload Visa</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display error message */}
          {errorMessage && (
            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
          )}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Upload Visa Pdf
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setVisaPDF(e.target.files?.[0] || null)}
              required
              className="file-input"
            />
          </div>
          <button
            type="submit"
            disabled={!visaPDF || isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
          >
            {isSubmitting ? "Processing..." : "Upload Visa"}
          </button>
        </form>
      </div>
    </div>
  );
}
