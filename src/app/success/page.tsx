"use client";

import { RootState } from "@/store/store";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const SuccessPage = () => {
  const router = useRouter();

  // Get state from Redux store
  const { passportDetails, ticketDetails, visaDetails } = useSelector(
    (state: RootState) => state.user
  );

  // Check if user is allowed to access this page
  const isAllowed =
    passportDetails.isVerified &&
    (ticketDetails?.isVerified || visaDetails?.isVerified);

  useEffect(() => {
    if (!isAllowed) {
      router.replace("/"); // Redirect if conditions are not met
    }
  }, [isAllowed, router]);

  if (!isAllowed) return null; // Prevent rendering until redirect happens

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Animated Check Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <CheckCircle className="w-24 h-24 text-green-500" />
      </motion.div>

      {/* Success Text */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-4 text-3xl font-bold text-green-600"
      >
        Success
      </motion.h1>
    </div>
  );
};

export default SuccessPage;
