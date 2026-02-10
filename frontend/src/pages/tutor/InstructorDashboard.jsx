import React from "react";

const InstructorDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
        Instructor Dashboard
      </h2>

      <p className="mt-2 text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
        Welcome,{" "}
        <span className="font-medium">{user?.name || "Instructor"}</span>
      </p>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        This is a dummy dashboard for Instructor role.
      </p>
    </div>
  );
};

export default InstructorDashboard;
