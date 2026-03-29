import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  User,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const links = [
  { label: "Dashboard", to: "/student", icon: LayoutDashboard },
  { label: "Timetable", to: "/student/timetable", icon: CalendarDays },
  { label: "Profile", to: "/student/profile", icon: User },
];

const StudentSidebar = ({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <>
      {open ? (
        <button
          type="button"
          onClick={onClose}
          className="lms-modal-backdrop fixed inset-0 z-40 md:hidden"
          aria-label="Close sidebar"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 h-full transition-all duration-300 md:z-30 ${
          collapsed ? "md:w-24" : "md:w-[280px]"
        } w-[280px] ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="relative neu-panel flex h-full flex-col rounded-r-[34px] rounded-l-none px-4 py-4">
          <button
            onClick={onToggleCollapse}
            className="neu-button absolute -right-5 top-10 hidden h-10 w-10 rounded-full md:inline-flex md:items-center md:justify-center"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={18} className="text-[var(--lms-text)]" />
            ) : (
              <ChevronLeft size={18} className="text-[var(--lms-text)]" />
            )}
          </button>

          <div className="flex h-16 items-center justify-between border-b border-white/10 px-2">
            <div className="overflow-hidden">
              {!collapsed ? (
                <>
                  <p className="text-lg font-semibold text-[var(--lms-text)]">
                    Student Panel
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
                    LMS Dashboard
                  </p>
                </>
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--lms-accent-soft)] font-semibold text-[var(--lms-accent-strong)]">
                  ST
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="neu-button rounded-2xl p-3 md:hidden"
            >
              <X size={18} className="text-[var(--lms-text)]" />
            </button>
          </div>

          <nav className="space-y-2 p-2 pt-5">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/student"}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose?.();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-[24px] px-4 py-3 text-sm font-medium transition-all ${
                      collapsed ? "md:justify-center md:px-0" : ""
                    } ${
                      isActive
                        ? "neu-button neu-button-primary text-white"
                        : "neu-button text-[var(--lms-text-soft)] hover:text-[var(--lms-text)]"
                    }`
                  }
                >
                  <Icon size={18} className={collapsed ? "md:mx-auto" : ""} />
                  {!collapsed ? <span>{item.label}</span> : null}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 p-4">
            {!collapsed ? (
              <p className="text-xs text-[var(--lms-text-soft)]">
                Copyright {new Date().getFullYear()} LMS
              </p>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
