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
} from "lucide-react";
import { adminDashBoardService } from "../../services/adminDashBoardService";

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
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

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

  const stats = [
    {
      title: "Total Students",
      value: students.length,
      icon: GraduationCap,
    },
    {
      title: "Total Tutors",
      value: tutors.length,
      icon: Users,
    },
    {
      title: "Employees",
      value: employees.length,
      icon: UserCog,
    },
    {
      title: "Courses",
      value: courses.length,
      icon: BookOpen,
    },
    {
      title: "Batches",
      value: batches.length,
      icon: Layers,
    },
    {
      title: "Fees Collected",
      value: `₹${feesSummary.paid}`,
      icon: IndianRupee,
    },
    {
      title: "Fees Due",
      value: `₹${feesSummary.due}`,
      icon: AlertCircle,
    },
    {
      title: "Total Visitors",
      value: visitors.length,
      icon: ClipboardList,
    },
  ];

  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [students]);

  const upcomingDues = useMemo(() => {
    return fees
      .filter((f) => f.remainingAmount > 0 && f.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [fees]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-gradient-to-br from-[#EEF2FF] via-white to-[#DBEAFE] p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              LMS overview and live operational metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-lg bg-white border text-sm text-gray-600">
              Fees Paid:{" "}
              <span className="font-semibold text-gray-900">
                {feesPaidPercent}%
              </span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white border text-sm text-gray-600">
              Follow Ups:{" "}
              <span className="font-semibold text-gray-900">
                {followUps.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl border p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {item.value}
                </p>
              </div>

              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                <Icon className="text-indigo-600" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Students Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Active</span>
              <span className="text-gray-900 font-medium">
                {studentSummary.active}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Inactive</span>
              <span className="text-gray-900 font-medium">
                {studentSummary.inactive}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Suspended</span>
              <span className="text-gray-900 font-medium">
                {studentSummary.suspended}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Courses Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Published</span>
              <span className="text-gray-900 font-medium">
                {courseSummary.published}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Draft</span>
              <span className="text-gray-900 font-medium">
                {courseSummary.draft}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Archived</span>
              <span className="text-gray-900 font-medium">
                {courseSummary.archived}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Visitors Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="text-gray-900 font-medium">
                {visitors.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Follow Up</span>
              <span className="text-gray-900 font-medium">
                {followUps.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Not Interested</span>
              <span className="text-gray-900 font-medium">
                {notInterested.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Converted</span>
              <span className="text-gray-900 font-medium">
                {converted.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="text-green-600" size={18} />
            <h2 className="text-lg font-medium text-gray-900">
              Recent Students
            </h2>
          </div>
          {loading && <p className="text-sm text-gray-500">Loading...</p>}
          {!loading && recentStudents.length === 0 && (
            <p className="text-sm text-gray-500">No recent students</p>
          )}
          <div className="space-y-3 text-sm">
            {recentStudents.map((s) => (
              <div key={s._id} className="flex justify-between">
                <div>
                  <p className="text-gray-900 font-medium">{s.name}</p>
                  <p className="text-gray-500">{s.course?.title || "—"}</p>
                </div>
                <span className="text-gray-400">
                  {s.createdAt
                    ? new Date(s.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserX className="text-red-600" size={18} />
            <h2 className="text-lg font-medium text-gray-900">Upcoming Dues</h2>
          </div>
          {loading && <p className="text-sm text-gray-500">Loading...</p>}
          {!loading && upcomingDues.length === 0 && (
            <p className="text-sm text-gray-500">No upcoming dues</p>
          )}
          <div className="space-y-3 text-sm">
            {upcomingDues.map((f) => (
              <div key={f._id} className="flex justify-between">
                <div>
                  <p className="text-gray-900 font-medium">
                    {f.student?.name || "—"}
                  </p>
                  <p className="text-gray-500">Due ₹{f.remainingAmount}</p>
                </div>
                <span className="text-gray-400">
                  {new Date(f.dueDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-indigo-600" size={18} />
            <h2 className="text-lg font-medium text-gray-900">Fees Overview</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg border">
              <p className="text-gray-500">Total Fees</p>
              <p className="text-lg font-semibold text-gray-900">
                ₹{feesSummary.total}
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-gray-500">Paid (Count)</p>
              <p className="text-lg font-semibold text-gray-900">
                {feesSummary.paidCount}
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-gray-500">Partial / Unpaid</p>
              <p className="text-lg font-semibold text-gray-900">
                {feesSummary.partialCount} / {feesSummary.unpaidCount}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Paid Progress</span>
              <span>{feesPaidPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-green-400 to-emerald-500"
                style={{ width: `${feesPaidPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="text-indigo-600" size={18} />
            <h2 className="text-lg font-medium text-gray-900">
              Batches Overview
            </h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Running</span>
              <span className="text-gray-900 font-medium">
                {batchSummary.running}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Upcoming</span>
              <span className="text-gray-900 font-medium">
                {batchSummary.upcoming}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Completed</span>
              <span className="text-gray-900 font-medium">
                {batchSummary.completed}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-indigo-600" size={18} />
          <h2 className="text-lg font-medium text-gray-900">Top Courses</h2>
        </div>
        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {!loading && topCourses.length === 0 && (
          <p className="text-sm text-gray-500">No courses available</p>
        )}
        <div className="space-y-3 text-sm">
          {topCourses.map((c) => (
            <div key={c._id} className="flex justify-between">
              <div>
                <p className="text-gray-900 font-medium">{c.title}</p>
                <p className="text-gray-500 capitalize">
                  {c.level} • {c.category}
                </p>
              </div>
              <span className="text-gray-400">
                {c.studentsEnrolled || 0} students
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
