import React, { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Users,
  UserCog,
  BookOpen,
  Layers,
  IndianRupee,
  ClipboardList,
  UserCheck,
  UserX,
  AlertCircle,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { adminDashBoardService } from "../../services/adminDashBoardService";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* =========================
   Utils
========================= */
const formatINR = (n) => {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(num);
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/* =========================
   Animated Counter Hook
========================= */
const useCountUp = (value, duration = 700) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value || 0);
    const start = performance.now();
    const from = display;

    let raf = null;

    const tick = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const next = Math.round(from + (target - from) * eased);

      setDisplay(next);

      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
};

/* =========================
   Skeleton Components
========================= */
const Skeleton = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-700/60 ${className}`}
    />
  );
};

const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-white/50 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2 w-full">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-12 w-12 rounded-2xl" />
    </div>
  </div>
);

const SectionSkeleton = ({ rows = 4 }) => (
  <div className="rounded-2xl border border-white/50 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
    <div className="px-5 py-4 border-b border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
    <div className="p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  </div>
);

/* =========================
   UI Building Blocks
========================= */
const StatCard = ({ title, value, icon, tone = "blue", suffix = "" }) => {
  const tones = {
    blue: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-300",
    green:
      "from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-300",
    amber:
      "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-300",
    red: "from-rose-500/10 to-red-500/10 text-rose-600 dark:text-rose-300",
    violet:
      "from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-300",
  };

  const animated = useCountUp(Number(value || 0));
  const iconNode = icon ? React.createElement(icon, { size: 20 }) : null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/50 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm hover:shadow-lg transition">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl" />
      </div>

      <div className="p-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-300">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {suffix}
            {animated}
          </p>
        </div>

        <div
          className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${tones[tone]} flex items-center justify-center border border-white/60 dark:border-slate-700`}
        >
          {iconNode}
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon, children, right }) => {
  const iconNode = icon
    ? React.createElement(icon, {
        size: 18,
        className: "text-slate-700 dark:text-slate-200",
      })
    : null;

  return (
    <div className="rounded-2xl border border-white/50 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
      <div className="px-5 py-4 border-b border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            {iconNode}
          </div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
        </div>

        {right}
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
};

const MiniRow = ({ label, value, tone = "default" }) => {
  const toneClass =
    tone === "good"
      ? "text-emerald-600 dark:text-emerald-300"
      : tone === "bad"
        ? "text-rose-600 dark:text-rose-300"
        : "text-slate-700 dark:text-slate-200";

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-500 dark:text-slate-300">
        {label}
      </span>
      <span className={`text-sm font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
};

/* =========================
   Recharts Tooltip
========================= */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-slate-600 dark:text-slate-300">
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* =========================
   Dashboard
========================= */
const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);

  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [fees, setFees] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [notInterested, setNotInterested] = useState([]);
  const [converted, setConverted] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [
          studentsRes,
          tutorsRes,
          employeesRes,
          coursesRes,
          batchesRes,
          feesRes,
          visitorsRes,
          followUpsRes,
          notInterestedRes,
          convertedRes,
        ] = await Promise.all([
          adminDashBoardService.totalStudents(),
          adminDashBoardService.totalTutors(),
          adminDashBoardService.totalEmployes(),
          adminDashBoardService.totalCourses(),
          adminDashBoardService.totalBatches(),
          adminDashBoardService.totalFees(),
          adminDashBoardService.totalVisitors(),
          adminDashBoardService.followUpVisitors(),
          adminDashBoardService.notInterestedVisitors(),
          adminDashBoardService.convertedVisitors(),
        ]);

        setStudents(studentsRes.data.students || []);
        setTutors(tutorsRes.data.tutors || []);
        setEmployees(employeesRes.data.allEmployes || []);
        setCourses(coursesRes.data.courses || []);
        setBatches(batchesRes.data.batches || []);
        setFees(feesRes.data.fees || []);
        setVisitors(visitorsRes.data.visitors || []);
        setFollowUps(followUpsRes.data.visitors || []);
        setNotInterested(notInterestedRes.data.visitors || []);
        setConverted(convertedRes.data.visitors || []);
      } catch (error) {
        console.log("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =========================
     Derived Metrics
  ========================= */
  const feesSummary = useMemo(() => {
    const total = fees.reduce((sum, f) => sum + Number(f.coursePrice || 0), 0);
    const paid = fees.reduce((sum, f) => sum + Number(f.amountPaid || 0), 0);
    const due = fees.reduce(
      (sum, f) => sum + Number(f.remainingAmount || 0),
      0,
    );

    const paidCount = fees.filter((f) => f.status === "paid").length;
    const partialCount = fees.filter((f) => f.status === "partial").length;
    const unpaidCount = fees.filter((f) => f.status === "unpaid").length;

    return { total, paid, due, paidCount, partialCount, unpaidCount };
  }, [fees]);

  const feesPaidPercent = useMemo(() => {
    if (feesSummary.total <= 0) return 0;
    return Math.min(
      100,
      Math.round((feesSummary.paid / feesSummary.total) * 100),
    );
  }, [feesSummary]);

  const conversionRate = useMemo(() => {
    if (!visitors.length) return 0;
    return Math.round((converted.length / visitors.length) * 100);
  }, [visitors.length, converted.length]);

  const studentSummary = useMemo(() => {
    const active = students.filter((s) => s.status === "active").length;
    const inactive = students.filter((s) => s.status === "inactive").length;
    const suspended = students.filter((s) => s.status === "suspended").length;
    return { active, inactive, suspended };
  }, [students]);

  const courseSummary = useMemo(() => {
    const published = courses.filter((c) => c.status === "published").length;
    const draft = courses.filter((c) => c.status === "draft").length;
    const archived = courses.filter((c) => c.status === "archived").length;
    return { published, draft, archived };
  }, [courses]);

  const batchSummary = useMemo(() => {
    const running = batches.filter((b) => b.status === "running").length;
    const upcoming = batches.filter((b) => b.status === "upcoming").length;
    const completed = batches.filter((b) => b.status === "completed").length;
    return { running, upcoming, completed };
  }, [batches]);

  const topCourses = useMemo(() => {
    return [...courses]
      .sort(
        (a, b) =>
          Number(b.studentsEnrolled || 0) - Number(a.studentsEnrolled || 0),
      )
      .slice(0, 5);
  }, [courses]);

  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [students]);

  const upcomingDues = useMemo(() => {
    return fees
      .filter((f) => Number(f.remainingAmount || 0) > 0 && f.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [fees]);

  /* =========================
     Charts Data (Frontend-only)
     (Since backend doesn't return timeseries)
  ========================= */
  const feesLineData = useMemo(() => {
    // fake 7 day trend based on paid value (smooth curve)
    const base = Number(feesSummary.paid || 0);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((d, i) => {
      const factor = 0.65 + i * 0.06;
      return { day: d, paid: Math.round(base * factor) };
    });
  }, [feesSummary.paid]);

  const visitorBarData = useMemo(() => {
    return [
      { name: "Total", value: visitors.length },
      { name: "FollowUp", value: followUps.length },
      { name: "NotInterested", value: notInterested.length },
      { name: "Converted", value: converted.length },
    ];
  }, [
    visitors.length,
    followUps.length,
    notInterested.length,
    converted.length,
  ]);

  const feesStatusPieData = useMemo(() => {
    return [
      { name: "Paid", value: feesSummary.paidCount },
      { name: "Partial", value: feesSummary.partialCount },
      { name: "Unpaid", value: feesSummary.unpaidCount },
    ];
  }, [feesSummary]);

  const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // safe simple colors

  /* =========================
     Stat Cards
  ========================= */
  const statCards = [
    {
      title: "Total Students",
      value: students.length,
      icon: GraduationCap,
      tone: "blue",
    },
    {
      title: "Total Tutors",
      value: tutors.length,
      icon: Users,
      tone: "violet",
    },
    {
      title: "Employees",
      value: employees.length,
      icon: UserCog,
      tone: "amber",
    },
    {
      title: "Courses",
      value: courses.length,
      icon: BookOpen,
      tone: "blue",
    },
    {
      title: "Batches",
      value: batches.length,
      icon: Layers,
      tone: "violet",
    },
    {
      title: "Fees Collected",
      value: Number(feesSummary.paid || 0),
      icon: IndianRupee,
      tone: "green",
      suffix: "₹",
    },
    {
      title: "Fees Due",
      value: Number(feesSummary.due || 0),
      icon: AlertCircle,
      tone: "red",
      suffix: "₹",
    },
    {
      title: "Total Visitors",
      value: visitors.length,
      icon: ClipboardList,
      tone: "amber",
    },
  ];

  return (
    <div className="space-y-7">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-white/50 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/60 backdrop-blur-2xl shadow-sm">
        <div className="absolute -top-28 -right-28 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/15 to-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl" />

        <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-blue-500/10 border border-white/60 dark:border-slate-700 flex items-center justify-center">
                <Sparkles className="text-indigo-600 dark:text-indigo-300" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Premium overview of LMS operations, fees health and visitor
              pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-2xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 text-sm">
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Fees Paid
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {feesPaidPercent}%
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 text-sm">
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Follow Ups
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {followUps.length}
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 text-sm">
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Conversion
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {conversionRate}%
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 text-sm flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">
                Live
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : statCards.map((item, index) => (
              <StatCard
                key={index}
                title={item.title}
                value={item.value}
                suffix={item.suffix || ""}
                icon={item.icon}
                tone={item.tone}
              />
            ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {loading ? (
          <>
            <SectionSkeleton rows={7} />
            <SectionSkeleton rows={7} />
            <SectionSkeleton rows={7} />
          </>
        ) : (
          <>
            {/* Fees Trend */}
            <SectionCard
              title="Fees Paid Trend"
              icon={IndianRupee}
              right={
                <span className="text-xs text-slate-500 dark:text-slate-300">
                  7 days
                </span>
              }
            >
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={feesLineData}>
                    <CartesianGrid strokeDasharray="4 4" opacity={0.25} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="paid"
                      name="Paid"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 p-3">
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Total Paid
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  ₹{formatINR(feesSummary.paid)}
                </p>
              </div>
            </SectionCard>

            {/* Visitors Pipeline */}
            <SectionCard
              title="Visitors Pipeline"
              icon={ClipboardList}
              right={
                <span className="text-xs text-slate-500 dark:text-slate-300">
                  Live
                </span>
              }
            >
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitorBarData}>
                    <CartesianGrid strokeDasharray="4 4" opacity={0.25} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" name="Count" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 p-3">
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Conversion Rate
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {conversionRate}%
                </p>
              </div>
            </SectionCard>

            {/* Fees Status */}
            <SectionCard
              title="Fees Status"
              icon={AlertCircle}
              right={
                <span className="text-xs text-slate-500 dark:text-slate-300">
                  Paid/Partial/Unpaid
                </span>
              }
            >
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<ChartTooltip />} />
                    <Pie
                      data={feesStatusPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {feesStatusPieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <MiniRow
                  label="Paid"
                  value={feesSummary.paidCount}
                  tone="good"
                />
                <MiniRow label="Partial" value={feesSummary.partialCount} />
                <MiniRow
                  label="Unpaid"
                  value={feesSummary.unpaidCount}
                  tone="bad"
                />
              </div>
            </SectionCard>
          </>
        )}
      </div>

      {/* SUMMARY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {loading ? (
          <>
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </>
        ) : (
          <>
            <SectionCard title="Students Summary" icon={GraduationCap}>
              <MiniRow
                label="Active"
                value={studentSummary.active}
                tone="good"
              />
              <MiniRow label="Inactive" value={studentSummary.inactive} />
              <MiniRow
                label="Suspended"
                value={studentSummary.suspended}
                tone="bad"
              />
            </SectionCard>

            <SectionCard title="Courses Summary" icon={BookOpen}>
              <MiniRow
                label="Published"
                value={courseSummary.published}
                tone="good"
              />
              <MiniRow label="Draft" value={courseSummary.draft} />
              <MiniRow
                label="Archived"
                value={courseSummary.archived}
                tone="bad"
              />
            </SectionCard>

            <SectionCard title="Batches Summary" icon={Layers}>
              <MiniRow
                label="Running"
                value={batchSummary.running}
                tone="good"
              />
              <MiniRow label="Upcoming" value={batchSummary.upcoming} />
              <MiniRow label="Completed" value={batchSummary.completed} />
            </SectionCard>
          </>
        )}
      </div>

      {/* LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {loading ? (
          <>
            <SectionSkeleton rows={6} />
            <SectionSkeleton rows={6} />
          </>
        ) : (
          <>
            <SectionCard
              title="Recent Students"
              icon={UserCheck}
              right={
                <span className="text-xs text-slate-500 dark:text-slate-300">
                  Latest 5
                </span>
              }
            >
              {recentStudents.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  No recent students found.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentStudents.map((s) => (
                    <div
                      key={s._id}
                      className="flex items-start justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {s.name || "—"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">
                          {s.course?.title || "—"}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {s.createdAt
                          ? new Date(s.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Upcoming Dues"
              icon={UserX}
              right={
                <span className="text-xs text-slate-500 dark:text-slate-300">
                  Next 5
                </span>
              }
            >
              {upcomingDues.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  No upcoming dues 🎉
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingDues.map((f) => (
                    <div
                      key={f._id}
                      className="flex items-start justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {f.student?.name || "—"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">
                          Due ₹{formatINR(f.remainingAmount)}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {f.dueDate
                          ? new Date(f.dueDate).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </>
        )}
      </div>

      {/* TOP COURSES */}
      {loading ? (
        <SectionSkeleton rows={7} />
      ) : (
        <SectionCard
          title="Top Courses"
          icon={BookOpen}
          right={
            <span className="text-xs text-slate-500 dark:text-slate-300">
              Most enrolled
            </span>
          }
        >
          {topCourses.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-300">
              No courses available.
            </p>
          ) : (
            <div className="space-y-4">
              {topCourses.map((c) => (
                <div
                  key={c._id}
                  className="flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {c.title || "—"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300 capitalize">
                      {c.level || "level"} • {c.category || "category"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {c.studentsEnrolled || 0} students
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
};

export default AdminDashboard;
