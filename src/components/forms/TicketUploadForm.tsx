/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setTicketDetails } from "@/store/userSlice";
import { RootState } from "@/store/store";

export default function TicketUploadForm() {
  const [ticketImage, setTicketImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // ✅ Added error message state
  const userDetails = useSelector((state: RootState) => state.user);

  const passportDetails = userDetails.passportDetails;
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!passportDetails.isVerified || userDetails.ticketDetails?.isVerified) {
      router.push("/");
    }
  }, [passportDetails.isVerified, router, userDetails.ticketDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketImage) {
      setErrorMessage("Please select a flight ticket image."); // ✅ Set error message if no file selected
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null); // ✅ Reset error message on new submission
    try {
      const formData = new FormData();
      formData.append("ticketImage", ticketImage);
      formData.append("passportDetails", JSON.stringify(passportDetails));
      const response = await fetch("/api/upload-ticket", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.status !== 200) {
        throw new Error(data.message || "Invalid ticket image.");
      }

      if (data.success) {
        dispatch(setTicketDetails({ isVerified: true }));
        router.push("/success");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred."); // ✅ Display error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Card Container */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Upload Flight Ticket
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ✅ Display error message if exists */}
          {errorMessage && (
            <p className="text-red-500 text-sm font-medium text-center">
              {errorMessage}
            </p>
          )}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Flight Ticket Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setTicketImage(e.target.files?.[0] || null)}
              required
              className="file-input"
            />
          </div>
          <button
            type="submit"
            disabled={!ticketImage || isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
          >
            {isSubmitting ? "Uploading..." : "Upload Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}
