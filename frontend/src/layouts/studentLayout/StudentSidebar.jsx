import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarDays, User, X } from "lucide-react";

const links = [
  {
    label: "Dashboard",
    to: "/student",
    icon: LayoutDashboard,
  },
  {
    label: "Timetable",
    to: "/student/timetable",
    icon: CalendarDays,
  },
  {
    label: "Profile",
    to: "/student/profile",
    icon: User,
    disabled: true,
  },
];

const StudentSidebar = ({ open, onClose }) => {
  return (
    <>
      {open && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[260px] z-50 md:z-30 
        bg-white dark:bg-[#112D4E] border-r border-[#DBE2EF] dark:border-[#3F72AF]
        shadow-xl md:shadow-none transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#DBE2EF] dark:border-[#3F72AF]">
          <div>
            <p className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Student Panel
            </p>
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
              LMS Dashboard
            </p>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]"
          >
            <X size={18} className="text-[#112D4E] dark:text-[#DBE2EF]" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((item) => {
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-[#DBE2EF] dark:border-[#3F72AF] opacity-60 cursor-not-allowed"
                >
                  <Icon
                    size={18}
                    className="text-[#3F72AF] dark:text-[#DBE2EF]"
                  />
                  <span className="text-sm text-[#112D4E] dark:text-[#DBE2EF]">
                    {item.label}
                  </span>
                  <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-[#DBE2EF] dark:bg-[#0a1f3a] text-[#112D4E] dark:text-[#DBE2EF]"></span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/student"}
                onClick={() => {
                  if (window.innerWidth < 768) onClose?.();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${
                    isActive
                      ? "bg-[#3F72AF] text-white shadow-md"
                      : "text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-white"
                          : "text-[#3F72AF] dark:text-[#DBE2EF]"
                      }
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-[#DBE2EF] dark:border-[#3F72AF]">
          <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
            © {new Date().getFullYear()} LMS
          </p>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
