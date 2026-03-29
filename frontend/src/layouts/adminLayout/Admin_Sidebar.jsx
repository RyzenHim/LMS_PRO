import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  BookOpen,
  Tag,
  UserRound,
  Layers,
  IndianRupee,
  CalendarCheck,
  FileText,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarCheck2,
} from "lucide-react";

const AdminSidebar = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Students", icon: GraduationCap, path: "/admin/students" },
    { name: "Tutors", icon: Users, path: "/admin/tutors" },
    { name: "Employees", icon: UserCog, path: "/admin/employees" },
    { name: "Courses", icon: BookOpen, path: "/admin/courses" },
    { name: "Batches", icon: Layers, path: "/admin/batches" },
    { name: "Skills", icon: Tag, path: "/admin/skills" },
    { name: "Fees", icon: IndianRupee, path: "/admin/fees" },
    { name: "Time Table", icon: CalendarCheck, path: "/admin/timetable" },
    { name: "Rooms", icon: Building2, path: "/admin/rooms" },
    { name: "Visitors", icon: UserRound, path: "/admin/visitor" },
    { name: "Report", icon: FileText, path: "/admin/reports" },
    { name: "Attandance", icon: CalendarCheck2, path: "/admin/attandance" },
  ];

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
        className={`fixed left-0 top-0 z-[70] h-dvh border-r border-white/10 transition-all duration-300 ease-in-out ${
          collapsed ? "lg:w-24" : "lg:w-[18rem]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} w-[18rem] lg:translate-x-0`}
      >
        <div className="neu-panel flex h-full flex-col rounded-r-[34px] rounded-l-none px-3 py-4">
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--lms-accent-soft)] text-sm font-semibold text-[var(--lms-accent-strong)] shadow-[inset_1px_1px_0_rgba(255,255,255,0.28)]">
                LMS
              </div>

              {!collapsed ? (
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-[var(--lms-text)]">
                    LMS Admin
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
                    Control Center
                  </p>
                </div>
              ) : null}
            </div>

            <button
              onClick={onToggleCollapse}
              className="neu-button hidden h-10 w-10 rounded-2xl lg:inline-flex lg:items-center lg:justify-center"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? (
                <ChevronRight size={18} className="text-[var(--lms-text)]" />
              ) : (
                <ChevronLeft size={18} className="text-[var(--lms-text)]" />
              )}
            </button>

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

export default AdminSidebar;
