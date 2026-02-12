import { useMemo, useState } from "react";
import ReportCard from "./components/ReportCard";

import {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  CalendarDays,
  UserCheck,
  Briefcase,
  Layers3,
  Search,
} from "lucide-react";

const AdminReports = () => {
  const [search, setSearch] = useState("");

  const reports = [
    {
      title: "Student Report",
      desc: "Filter students and export list.",
      to: "/admin/reports/students",
      icon: <GraduationCap size={20} />,
    },
    {
      title: "Batch Report",
      desc: "Course → Batch → Students list.",
      to: "/admin/reports/batch",
      icon: <Users size={20} />,
    },
    {
      title: "Course Report",
      desc: "Courses list + batch count export.",
      to: "/admin/reports/courses",
      icon: <BookOpen size={20} />,
    },
    {
      title: "Fees Report",
      desc: "Fees list report and export.",
      to: "/admin/reports/fees",
      icon: <Wallet size={20} />,
    },
    {
      title: "Tutor Report",
      desc: "All tutors list export.",
      to: "/admin/reports/tutors",
      icon: <UserCheck size={20} />,
    },
    {
      title: "Employee Report",
      desc: "Employee list export.",
      to: "/admin/reports/employees",
      icon: <Briefcase size={20} />,
    },
    {
      title: "Skill Report",
      desc: "Skill list export.",
      to: "/admin/reports/skills",
      icon: <Layers3 size={20} />,
    },
    {
      title: "Timetable Report",
      desc: "Course → Batch → Timetable slots export.",
      to: "/admin/reports/timetable",
      icon: <CalendarDays size={20} />,
    },
    {
      title: "Visitor Report",
      desc: "Visitors list + followups + converted export.",
      to: "/admin/reports/visitors",
      icon: <Users size={20} />,
    },
  ];

  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;

    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#112D4E] dark:text-[#DBE2EF]">
            Reports
          </h1>

          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
            Choose a report, apply filters, and export as CSV.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-[380px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3F72AF] dark:text-[#DBE2EF]"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="
              w-full pl-10 pr-3 py-2.5 rounded-2xl
              border border-[#DBE2EF] dark:border-[#3F72AF]
              bg-white dark:bg-[#112D4E]
              text-sm outline-none
              shadow-sm
              transition-all duration-300
              focus:ring-2 focus:ring-[#3F72AF]/50
              hover:shadow-md
            "
          />
        </div>
      </div>

      {/* Grid */}
      {filteredReports.length === 0 ? (
        <div className="p-10 rounded-2xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E] text-center shadow-sm">
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            No reports found for:{" "}
            <span className="font-semibold">{search}</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredReports.map((r) => (
            <ReportCard
              key={r.to}
              title={r.title}
              desc={r.desc}
              to={r.to}
              icon={r.icon}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
