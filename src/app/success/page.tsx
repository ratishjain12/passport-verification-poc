"use client";

import { RootState } from "@/store/store";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const SuccessPage = () => {
  const router = useRouter();
  const [hasVisited, setHasVisited] = useState(false);

  // Get state from Redux store
  const { passportDetails, ticketDetails, visaDetails } = useSelector(
    (state: RootState) => state.user
  );

  // Determine if user is allowed to access this page
  const isAllowed =
    passportDetails?.isVerified &&
    (ticketDetails?.isVerified || visaDetails?.isVerified);

  useEffect(() => {
    const visited = localStorage.getItem("successPageVisited");
    if (visited) {
      setHasVisited(true);
    }
  }, []);

  useEffect(() => {
    if (isAllowed && !hasVisited) {
      localStorage.setItem("successPageVisited", "true"); // Mark as visited
    } else if (!isAllowed && hasVisited) {
      router.replace("/"); // Redirect if not allowed and user has visited before
    }
  }, [isAllowed, hasVisited, router]);

  if (!isAllowed && hasVisited) return null; // Prevent rendering if redirecting

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
