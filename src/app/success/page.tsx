"use client";

import { motion } from "motion/react";
import { CheckCircle } from "lucide-react";

const SuccessPage = () => {
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
