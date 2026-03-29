import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/instructor" },
  { name: "Students", icon: Users, path: "/instructor/students" },
  { name: "Assignments", icon: FileText, path: "/instructor/assignments" },
  { name: "Profile", icon: User, path: "/instructor/profile" },
];

const InstructorSidebar = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {mobileOpen ? (
        <button
          onClick={onCloseMobile}
          className="lms-modal-backdrop fixed inset-0 z-[60] lg:hidden"
          aria-label="Close sidebar overlay"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-[70] h-dvh transition-all duration-300 ease-in-out ${
          collapsed ? "lg:w-24" : "lg:w-[18rem]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} w-[18rem] lg:translate-x-0`}
      >
        <div className="relative neu-panel flex h-full flex-col rounded-r-[34px] rounded-l-none px-3 py-4">
          <button
            onClick={onToggleCollapse}
            className="neu-button absolute -right-5 top-10 hidden h-10 w-10 rounded-full lg:inline-flex lg:items-center lg:justify-center"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={18} className="text-[var(--lms-text)]" />
            ) : (
              <ChevronLeft size={18} className="text-[var(--lms-text)]" />
            )}
          </button>

          <div className="flex h-16 items-center justify-between border-b border-white/10 px-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--lms-accent-soft)] text-sm font-semibold text-[var(--lms-accent-strong)] shadow-[inset_1px_1px_0_rgba(255,255,255,0.28)]">
                INS
              </div>

              {!collapsed ? (
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-[var(--lms-text)]">
                    LMS Tutor
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
                    Teaching Desk
                  </p>
                </div>
              ) : null}
            </div>

            <button
              onClick={onCloseMobile}
              className="neu-button inline-flex h-10 w-10 items-center justify-center rounded-2xl lg:hidden"
              title="Close Sidebar"
            >
              <X size={18} className="text-[var(--lms-text)]" />
            </button>
          </div>

          <nav className="mt-4 flex-1 space-y-2 overflow-y-auto px-1 pb-4">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/instructor"}
                  title={collapsed ? item.name : ""}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-[24px] px-4 py-3 text-sm transition-all duration-200 ${
                      collapsed ? "lg:justify-center lg:px-0" : "justify-start"
                    } ${
                      isActive
                        ? "neu-button neu-button-primary text-white"
                        : "neu-button text-[var(--lms-text-soft)] hover:text-[var(--lms-text)]"
                    }`
                  }
                >
                  <Icon size={18} className={collapsed ? "lg:mx-auto" : ""} />
                  {!collapsed ? (
                    <span className="truncate font-medium">{item.name}</span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default InstructorSidebar;
