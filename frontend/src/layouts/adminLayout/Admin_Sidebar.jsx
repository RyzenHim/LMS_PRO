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
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-[70] h-dvh text-white shadow-2xl
          transition-all duration-300 ease-in-out

          bg-[#141414] dark:bg-[#101010]
          border-r border-white/10

          ${collapsed ? "lg:w-20" : "lg:w-64"}

          w-64
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center font-bold tracking-wide text-white">
              L
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">LMS Admin</p>
                <p className="text-[11px] text-white/60">Control Center</p>
              </div>
            )}
          </div>

          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:inline-flex p-2 rounded-xl hover:bg-white/10 transition"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={18} className="text-white/80" />
            ) : (
              <ChevronLeft size={18} className="text-white/80" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition"
            title="Close Sidebar"
          >
            <X size={18} className="text-white/80" />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-3 space-y-1 px-2">
          {menu.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={index}
                to={item.path}
                title={collapsed ? item.name : ""}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `
                  group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm
                  transition-all duration-200
                  ${collapsed ? "lg:justify-center lg:px-0" : "justify-start"}

                  ${
                    isActive
                      ? "bg-white/10 text-white border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }
                `
                }
              >
                <Icon
                  size={18}
                  className={`
                    shrink-0 transition
                    ${collapsed ? "lg:mx-auto" : ""}
                  `}
                />

                {!collapsed && (
                  <span className="truncate font-medium">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
