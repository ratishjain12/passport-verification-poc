"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { setContactDetails } from "@/store/userSlice";
import type { RootState } from "@/store/store";

export default function ContactDetailsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const passportDetails = useSelector(
    (state: RootState) => state.user.passportDetails
  );

  const [formData, setFormData] = useState({
    name: passportDetails.name || "",
    dateOfBirth: passportDetails.dateOfBirth || "",
    passportNumber: passportDetails.passportNumber || "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    if (!passportDetails.isVerified) {
      router.push("/");
    }
  }, [passportDetails.isVerified, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(setContactDetails(formData));
    // Navigate to next step
    router.push("/next-step");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Contact Details</h1>

      <div className="bg-gray-50 p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Passport Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Date of Birth*</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Passport Number*</label>
            <input
              type="text"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Address Line 1*</label>
          <input
            type="text"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Address Line 2</label>
          <input
            type="text"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">City*</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">State/Province*</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Postal Code*</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Country*</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
