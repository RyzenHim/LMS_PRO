import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarDays, User, X } from "lucide-react";

const links = [
  { label: "Dashboard", to: "/student", icon: LayoutDashboard },
  { label: "Timetable", to: "/student/timetable", icon: CalendarDays },
  { label: "Profile", to: "/student/profile", icon: User },
];

const StudentSidebar = ({ open, onClose }) => {
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
        className={`fixed left-0 top-0 z-50 h-full w-[280px] transition-transform duration-300 md:z-30 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="neu-panel flex h-full flex-col rounded-r-[34px] rounded-l-none px-4 py-4">
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-2">
            <div>
              <p className="text-lg font-semibold text-[var(--lms-text)]">
                Student Panel
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
                LMS Dashboard
              </p>
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
                      isActive
                        ? "neu-button neu-button-primary text-white"
                        : "neu-button text-[var(--lms-text-soft)] hover:text-[var(--lms-text)]"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 p-4">
            <p className="text-xs text-[var(--lms-text-soft)]">
              © {new Date().getFullYear()} LMS
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
