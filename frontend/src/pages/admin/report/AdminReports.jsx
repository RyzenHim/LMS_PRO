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

const reports = [
  {
    title: "Student Report",
    desc: "Filter students and export their current enrollment picture.",
    to: "/admin/reports/students",
    icon: <GraduationCap size={20} />,
  },
  {
    title: "Batch Report",
    desc: "Course to batch to students, with cleaner operational visibility.",
    to: "/admin/reports/batch",
    icon: <Users size={20} />,
  },
  {
    title: "Course Report",
    desc: "Course listings, metadata, and batch coverage in one export flow.",
    to: "/admin/reports/courses",
    icon: <BookOpen size={20} />,
  },
  {
    title: "Fees Report",
    desc: "Track collections, dues, and payment health from one table.",
    to: "/admin/reports/fees",
    icon: <Wallet size={20} />,
  },
  {
    title: "Tutor Report",
    desc: "Review tutor coverage, contact details, and exportable records.",
    to: "/admin/reports/tutors",
    icon: <UserCheck size={20} />,
  },
  {
    title: "Employee Report",
    desc: "Summarize employee records in a calmer, more readable report view.",
    to: "/admin/reports/employees",
    icon: <Briefcase size={20} />,
  },
  {
    title: "Skill Report",
    desc: "Audit institution skill coverage and export the latest catalog.",
    to: "/admin/reports/skills",
    icon: <Layers3 size={20} />,
  },
  {
    title: "Timetable Report",
    desc: "Inspect course, batch, and slot allocations with cleaner structure.",
    to: "/admin/reports/timetable",
    icon: <CalendarDays size={20} />,
  },
  {
    title: "Visitor Report",
    desc: "Review lead quality, follow-ups, and conversion performance.",
    to: "/admin/reports/visitors",
    icon: <Users size={20} />,
  },
];

const AdminReports = () => {
  const [search, setSearch] = useState("");

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reports;

    return reports.filter(
      (report) =>
        report.title.toLowerCase().includes(query) ||
        report.desc.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <div className="lms-page-enter space-y-6 p-6">
      <div className="neu-panel lms-sheen relative overflow-hidden rounded-[36px] px-6 py-7">
        <div className="lms-glow-orb left-[-4rem] top-[-3rem] h-36 w-36 bg-white/40" />
        <div
          className="lms-glow-orb right-[-3rem] top-6 h-40 w-40 bg-[var(--lms-accent-soft)]"
          style={{ animationDelay: "-2.5s" }}
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lms-text-soft)]">
              Analytics Hub
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[var(--lms-text)]">
              Reports
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--lms-text-soft)]">
              Choose a report, refine the data, and export with a cleaner,
              more premium workflow.
            </p>
          </div>

          <div className="neu-panel-soft flex w-full items-center gap-3 rounded-[24px] px-4 py-3 lg:w-[400px]">
            <Search
              size={18}
              className="shrink-0 text-[var(--lms-accent-strong)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--lms-text-soft)]"
            />
          </div>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="neu-empty-state">
          <p className="text-sm">
            No reports found for <span className="font-semibold">{search}</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.to}
              title={report.title}
              desc={report.desc}
              to={report.to}
              icon={report.icon}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
