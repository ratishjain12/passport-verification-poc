"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isValid = searchParams.get("isValid") === "true";
  const googleSheetUrl =
    "https://docs.google.com/spreadsheets/d/1g80jDzBIa3k1KwFvbikMzhRcJUe9W50gaU0ua0oEEgk/edit?usp=sharing"; // Replace with your sheet URL

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold text-black mb-4 text-center">
          Validation Results
        </h2>

        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Field</th>
              <th className="border p-2">Provided</th>
              <th className="border p-2">Extracted</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Full Name</td>
              <td className="border p-2">{searchParams.get("name")}</td>
              <td className="border p-2">
                {searchParams.get("extractedName")}
              </td>
            </tr>
            <tr>
              <td className="border p-2">Date of Birth</td>
              <td className="border p-2">{searchParams.get("dob")}</td>
              <td className="border p-2">{searchParams.get("extractedDOB")}</td>
            </tr>
            <tr>
              <td className="border p-2">Passport Number</td>
              <td className="border p-2">
                {searchParams.get("passportNumber")}
              </td>
              <td className="border p-2">
                {searchParams.get("extractedPassport")}
              </td>
            </tr>
          </tbody>
        </table>

        <p
          className={`mt-4 text-center font-bold ${
            isValid ? "text-green-600" : "text-red-600"
          }`}
        >
          {isValid
            ? "✅ Passport Verified Successfully"
            : "❌ Verification Failed"}
        </p>

        <a
          href={googleSheetUrl}
          target="_blank"
          className="block mt-4 text-center bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          View Google Sheet
        </a>

        {!isValid && (
          <button
            className="block w-full mt-4 text-center bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            onClick={() => router.back()}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<p className="text-center mt-6">Loading results...</p>}>
      <ResultsContent />
    </Suspense>
  );
}
