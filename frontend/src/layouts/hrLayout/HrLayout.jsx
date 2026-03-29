import { Outlet } from "react-router-dom";
import HrTopbar from "../../components/hr/HrTopbar";

const HrLayout = () => {
  return (
    <div className="lms-app-shell min-h-dvh">
      <HrTopbar />
      <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default HrLayout;
