"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setTicketDetails } from "@/store/userSlice";

export default function TicketUploadForm() {
  const [ticketImage, setTicketImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketImage) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("ticketImage", ticketImage);

      const response = await fetch("/api/upload-ticket", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        dispatch(setTicketDetails({ imageUrl: data.imageUrl }));
        router.push("/next-step");
      }
    } catch (error) {
      console.error("Error uploading ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Flight Ticket</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium">
            Flight Ticket Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setTicketImage(e.target.files?.[0] || null)}
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <button
          type="submit"
          disabled={!ticketImage || isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Uploading..." : "Upload Ticket"}
        </button>
      </form>
    </div>
  );
}
