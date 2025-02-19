"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSelectedCountry } from "@/store/userSlice";

export default function CountrySelectionForm() {
  const [country, setCountry] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSelectedCountry(country));
    router.push(country === "thailand" ? "/upload-ticket" : "/upload-visa");
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Select Destination Country</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium">
            Choose your destination
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a country</option>
            <option value="thailand">Thailand</option>
            <option value="singapore">Singapore</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={!country}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
