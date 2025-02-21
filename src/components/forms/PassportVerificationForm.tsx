"use client";
import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  setPassportDetails,
  setValidationDetails,
  setContactDetails,
} from "@/store/userSlice";

interface PassportFormData {
  fullName: string;
  dateOfBirth: string;
  passportNumber: string;
  frontImage: File | null;
  backImage: File | null;
}

export default function PassportVerificationForm() {
  const [formData, setFormData] = useState<PassportFormData>({
    fullName: "",
    dateOfBirth: "",
    passportNumber: "",
    frontImage: null,
    backImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const router = useRouter();
  const dispatch = useDispatch();

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

    // First, check if any required fields are missing
    if (!fullName || !passportNumber || !frontImage || !backImage) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    // Check if dateOfBirth is missing or invalid
    if (!dateOfBirth) {
      setErrorMessage("Please enter a valid date of birth.");
      return;
    }

    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      setErrorMessage("Invalid date. Please enter a valid date of birth.");
      return;
    }

    // Validate Leap Year for February 29
    const [year, month, day] = dateOfBirth.split("-").map(Number);
    if (month === 2 && day === 29) {
      if (!(year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0))) {
        setErrorMessage("Invalid date. This year does not have February 29.");
        return;
      }
    }

    const today = new Date();

    // Check if the date is in the future
    if (birthDate > today) {
      setErrorMessage("Date of birth cannot be in the future.");
      return;
    }

    // Reset error message and continue with form submission
    setIsSubmitting(true);
    setErrorMessage("");
    setShowModal(true); // Show modal when submission starts

    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formPayload.append(key, value);
      });

      const response = await fetch("/api/upload-passport", {
        method: "POST",
        body: formPayload,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (data.success && data.isValid) {
        dispatch(setPassportDetails(data.passportDetails));
        dispatch(setContactDetails(data.contactDetails));
        router.push(data.nextStep);
      } else {
        dispatch(setValidationDetails(data.validationDetails));
        router.push("/verification-failed");
      }
    } catch {
      setErrorMessage(
        "Failed!! Please make sure you are uploading correct passport images."
      );
    } finally {
      setIsSubmitting(false);
      setShowModal(false); // Hide modal after submission completes
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center space-y-4">
            <p className="text-lg font-medium">Processing Your Request</p>
            <p className="text-sm text-gray-600">
              This may take a few moments. Please do not close this page.
            </p>
            <div className="flex justify-center">
              <svg
                className="animate-spin h-6 w-6 text-blue-600"
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
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
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
        <label className="form-label">
          Front Side of Passport (Upload Image)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, "front")}
          className="file-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Back Side of Passport (Upload Image)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, "back")}
          className="file-input"
          required
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
          {errorMessage}
        </p>
      )}

      {/* Submit Button */}
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
  );
}
