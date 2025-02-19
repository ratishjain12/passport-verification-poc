"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setVisaDetails } from "@/store/userSlice";

export default function VisaUploadForm() {
  const [visaImage, setVisaImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visaImage) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("visaImage", visaImage);

      const response = await fetch("/api/upload-visa", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        dispatch(setVisaDetails({ imageUrl: data.imageUrl }));
        router.push("/next-step");
      }
    } catch (error) {
      console.error("Error uploading visa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Visa</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium">Visa Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setVisaImage(e.target.files?.[0] || null)}
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <button
          type="submit"
          disabled={!visaImage || isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Uploading..." : "Upload Visa"}
        </button>
      </form>
    </div>
  );
}
