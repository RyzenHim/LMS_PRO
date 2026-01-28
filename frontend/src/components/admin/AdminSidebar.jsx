import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  icons,
  BookOpen 
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
    },{
        name:"courses",
        icon:BookOpen ,
        path:"/admin/courses"
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white fixed h-screen">
      <div className="p-6 text-xl font-semibold">
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
                `flex items-center px-6 py-3 text-sm
                 ${
                   isActive 
                     ? "bg-slate-800 text-white"
                     : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
