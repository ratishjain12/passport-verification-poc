/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) => {
    const file = event.target.files?.[0] || null;
    if (type === "front") {
      setFrontImage(file);
    } else {
      setBackImage(file);
    }
  };

  const handleSubmit = async () => {
    if (!name || !dob || !passportNumber || !frontImage || !backImage) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("dob", dob);
      formData.append("passportNumber", passportNumber);
      formData.append("frontImage", frontImage);
      formData.append("backImage", backImage);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Redirect to the results page with extracted data
      router.push(
        `/result?name=${encodeURIComponent(name)}&dob=${encodeURIComponent(
          dob
        )}&passportNumber=${encodeURIComponent(
          passportNumber
        )}&extractedName=${encodeURIComponent(
          data.extractedData.name
        )}&extractedDOB=${encodeURIComponent(
          data.extractedData.date_of_birth
        )}&extractedPassport=${encodeURIComponent(
          data.extractedData.passport_number
        )}&isValid=${data.isValid}&frontImage=${encodeURIComponent(
          data.frontImage
        )}&backImage=${encodeURIComponent(data.backImage)}`
      );
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred during submission.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-black mb-4 text-center">
          Passport Verification
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700">
              Full Name (as per your passport)
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Date of Birth</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Passport Number</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">
              Front Side of Passport
            </label>
            <input
              type="file"
              className="w-full p-2 border rounded"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "front")}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Back Side of Passport</label>
            <input
              type="file"
              className="w-full p-2 border rounded"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "back")}
              required
            />
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
