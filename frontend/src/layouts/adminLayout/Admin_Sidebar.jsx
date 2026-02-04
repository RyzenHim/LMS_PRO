import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  BookOpen,
  Tag,
  UserRound,
} from "lucide-react";

const AdminSidebar = () => {
  const menu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      name: "Students",
      icon: GraduationCap,
      path: "/admin/students",
    },
    {
      name: "Tutors",
      icon: Users,
      path: "/admin/tutors",
    },
    {
      name: "Employees",
      icon: UserCog,
      path: "/admin/employees",
    },
    {
      name: "Courses",
      icon: BookOpen,
      path: "/admin/courses",
    },
    {
      name: "Skills",
      icon: Tag,
      path: "/admin/skills",
    },
    {
      name: "Visitors",
      icon: UserRound,
      path: "/admin/visitor",
    },
  ];

  return (
    <aside className="w-64 bg-[#112D4E] dark:bg-[#0a1f3a] text-white fixed h-screen shadow-lg">
      <div className="p-6 text-xl font-semibold text-[#DBE2EF]">
        LMS Admin
      </div>

      <nav className="mt-6 space-y-1">
        {menu.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm transition-colors
                 ${
                   isActive
                     ? "bg-[#3F72AF] text-white border-l-4 border-[#DBE2EF]"
                     : "text-[#DBE2EF] hover:bg-[#3F72AF] hover:text-white"
                 }`
              }
            >
              <Icon size={18} />
              <span className="ml-3">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
