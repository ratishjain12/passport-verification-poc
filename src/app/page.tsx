/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

interface PassportFormData {
  fullName: string;
  dateOfBirth: string;
  passportNumber: string;
  frontImage: File | null;
  backImage: File | null;
}

export default function PassportVerificationPage() {
  const [formData, setFormData] = useState<PassportFormData>({
    fullName: "",
    dateOfBirth: "",
    passportNumber: "",
    frontImage: null,
    backImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (
    event: ChangeEvent<HTMLInputElement>,
    imageType: "front" | "back"
  ) => {
    const file = event.target.files?.[0] || null;
    const key = imageType === "front" ? "frontImage" : "backImage";
    setFormData((prev) => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async () => {
    const { fullName, dateOfBirth, passportNumber, frontImage, backImage } =
      formData;

    console.log(fullName, dateOfBirth);

    if (
      !fullName ||
      !dateOfBirth ||
      !passportNumber ||
      !frontImage ||
      !backImage
    ) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formPayload.append(key, value);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formPayload,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const queryParams = new URLSearchParams({
        name: fullName,
        dob: dateOfBirth,
        passportNumber,
        extractedName: data.extractedData.name,
        extractedDOB: data.extractedData.date_of_birth,
        extractedPassport: data.extractedData.passport_number,
        isValid: String(data.isValid),
        frontImage: data.frontImage,
        backImage: data.backImage,
      });

      router.push(`/result?${queryParams.toString()}`);
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage("Failed to process your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Passport Verification
          </h1>

          <div className="space-y-6">
            <div className="form-group">
              <label className="form-label">Full Name (as per passport)</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passport Number</label>
              <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="A1234567"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Front Side of Passport</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "front")}
                className="file-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Back Side of Passport</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "back")}
                className="file-input"
                required
              />
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                {errorMessage}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Verify Passport"
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
