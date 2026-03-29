import { Outlet } from "react-router-dom";
import InstructorTopbar from "../../components/tutor/InstructorTopbar";

const InstructorLayout = () => {
  return (
    <div className="lms-app-shell min-h-dvh">
      <InstructorTopbar />
      <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default InstructorLayout;
