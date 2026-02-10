import React from "react";
import { Outlet } from "react-router-dom";
import HrTopbar from "../../components/hr/HrTopbar";

const HrLayout = () => {
  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <HrTopbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default HrLayout;
