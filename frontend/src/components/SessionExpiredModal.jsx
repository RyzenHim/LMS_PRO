import React from "react";
import { useNavigate } from "react-router-dom";
import { resetSessionExpiredTrigger } from "../utils/authEvents";

const SessionExpiredModal = ({ open }) => {
  const navigate = useNavigate();

  if (!open) return null;

  const handleLoginAgain = () => {
    localStorage.removeItem("token");

    // reset the lock so it can trigger next time in future
    resetSessionExpiredTrigger();

    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Session Expired
        </h2>

        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Your session has expired. Please login again to continue.
        </p>

        <button
          onClick={handleLoginAgain}
          className="mt-6 w-full rounded-xl bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 transition"
        >
          Login Again
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
