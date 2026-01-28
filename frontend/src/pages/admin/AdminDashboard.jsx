import React from "react";
import {
  GraduationCap,
  Users,
  UserCog,
  BookOpen,
} from "lucide-react";

const stats = [
  {
    title: "Total Students",
    value: 1245,
    icon: GraduationCap,
  },
  {
    title: "Total Tutors",
    value: 48,
    icon: Users,
  },
  {
    title: "Employees",
    value: 12,
    icon: UserCog,
  },
  {
    title: "Courses",
    value: 32,
    icon: BookOpen,
  },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          LMS overview and system statistics
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl border p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-gray-500">
                  {item.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {item.value}
                </p>
              </div>

              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Icon className="text-indigo-600" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity
        </h2>

        <ul className="space-y-3 text-sm">
          <li className="flex justify-between">
            <span>New student registered</span>
            <span className="text-gray-400">5 min ago</span>
          </li>
          <li className="flex justify-between">
            <span>New tutor onboarded</span>
            <span className="text-gray-400">1 hour ago</span>
          </li>
          <li className="flex justify-between">
            <span>Course “React Basics” published</span>
            <span className="text-gray-400">Yesterday</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
