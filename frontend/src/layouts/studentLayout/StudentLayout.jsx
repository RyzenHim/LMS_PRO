import React from "react";
import { Outlet } from "react-router-dom";
import StudentTopbar from "../../components/student/StudentTopbar";

const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <StudentTopbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
