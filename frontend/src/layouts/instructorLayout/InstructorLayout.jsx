import React from "react";
import { Outlet } from "react-router-dom";
import InstructorTopbar from "../../components/tutor/InstructorTopbar";

const InstructorLayout = () => {
  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <InstructorTopbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default InstructorLayout;
