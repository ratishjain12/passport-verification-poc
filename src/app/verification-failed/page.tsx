"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export default function VerificationFailed() {
  const router = useRouter();
  const validationDetails = useSelector(
    (state: RootState) => state.user.validationDetails
  );

  const getFailureReasons = () => {
    const reasons = [];
    if (!validationDetails?.isValidName) {
      reasons.push("Name doesn't match with passport");
    }
    if (!validationDetails?.isValidDOB) {
      reasons.push("Date of birth doesn't match with passport");
    }
    if (!validationDetails?.isValidPassport) {
      reasons.push("Passport number doesn't match with passport");
    }
    if (!validationDetails?.isValidExpiry) {
      reasons.push("Passport is expired");
    }
    if (!validationDetails?.isValidCountry) {
      reasons.push("Passport is not from India");
    }
    return reasons.length ? reasons : ["Could not verify passport details"];
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Verification Failed
        </h1>

        <div className="text-left mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">Failure Reasons:</h2>
          <ul className="space-y-2 text-red-600">
            {getFailureReasons().map((reason, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-gray-600 mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">
            To ensure successful verification:
          </h2>
          <ul className="text-left space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Upload clear, well-lit passport images</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Ensure all details are clearly visible</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Double-check the information you entered matches exactly with
                your passport
              </span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
