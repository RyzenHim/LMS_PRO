import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axios";
import { timetableService } from "../../services/timetableService";
import {
  CalendarDays,
  BookOpen,
  Users,
  Clock,
  GraduationCap,
} from "lucide-react";

const dayKeyMap = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

const dayLabelMap = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const minutesToTime = (m) => {
  const h = Math.floor(m / 60);
  const min = m % 60;

  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? "PM" : "AM";

  return `${hour12}:${String(min).padStart(2, "0")} ${ampm}`;
};

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");

  const [student, setStudent] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [batchId, setBatchId] = useState("");

  const [slots, setSlots] = useState([]);

  // =========================
  // 1) Load student profile
  // =========================
  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosInstance.get("/students/me");

        const studentDoc = res.data?.student;
        const maps = res.data?.mappings || [];

        setStudent(studentDoc);
        setMappings(maps);

        const activeMap = maps?.[0];
        const bId = activeMap?.batch?._id || "";

        setBatchId(bId);
      } catch (err) {
        console.error("Dashboard fetchMe error:", err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  // =========================
  // 2) Load timetable slots
  // =========================
  useEffect(() => {
    const fetchSlots = async () => {
      if (!batchId) {
        setSlots([]);
        return;
      }

      try {
        setTableLoading(true);
        const res = await timetableService.getBatchTimetable(batchId);
        setSlots(res.data?.slots || []);
      } catch (err) {
        console.error("Dashboard timetable error:", err);
      } finally {
        setTableLoading(false);
      }
    };

    fetchSlots();
  }, [batchId]);

  // =========================
  // Derived Data
  // =========================
  const activeMap = mappings?.[0];

  const studentName = student?.visitor?.name || "Student";
  const studentEmail = student?.visitor?.email || "—";
  const studentPhone = student?.visitor?.phone || "—";

  const courseTitle = student?.visitor?.course?.title || "—";
  const courseCategory = student?.visitor?.course?.category || "";
  const courseLevel = student?.visitor?.course?.level || "";
  const coursePrice = student?.visitor?.course?.price ?? null;

  const batchName = activeMap?.batch?.name || "Not Assigned";
  const tutorName =
    activeMap?.tutor?.employee?.name || activeMap?.tutor?.name || "—";

  const todayKey = dayKeyMap[new Date().getDay()];

  const todaySlots = useMemo(() => {
    return (slots || [])
      .filter((s) => s.day === todayKey)
      .sort((a, b) => a.startMinutes - b.startMinutes);
  }, [slots, todayKey]);

  const weeklyClassCount = useMemo(() => {
    return (slots || []).length;
  }, [slots]);

  const upcomingToday = todaySlots?.[0];

  if (loading) {
    return (
      <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          Student Dashboard
        </h1>

        <p className="mt-2 text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
          Welcome, <span className="font-medium">{studentName}</span>
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a]">
              <GraduationCap className="text-[#3F72AF]" size={20} />
            </div>
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Batch
              </p>
              <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {batchName}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a]">
              <BookOpen className="text-[#3F72AF]" size={20} />
            </div>
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Course
              </p>
              <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {courseTitle}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a]">
              <Users className="text-[#3F72AF]" size={20} />
            </div>
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Tutor
              </p>
              <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {tutorName}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a]">
              <CalendarDays className="text-[#3F72AF]" size={20} />
            </div>
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Weekly Classes
              </p>
              <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {tableLoading ? "Loading..." : weeklyClassCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE + TODAY */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Profile */}
        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            My Profile
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[#3F72AF] dark:text-[#DBE2EF]">Name</span>
              <span className="font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                {studentName}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-[#3F72AF] dark:text-[#DBE2EF]">Email</span>
              <span className="font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                {studentEmail}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-[#3F72AF] dark:text-[#DBE2EF]">Phone</span>
              <span className="font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                {studentPhone}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-[#3F72AF] dark:text-[#DBE2EF]">Course</span>
              <span className="font-medium text-[#112D4E] dark:text-[#DBE2EF] text-right">
                {courseTitle}
              </span>
            </div>

            {(courseCategory || courseLevel) && (
              <div className="flex justify-between gap-4">
                <span className="text-[#3F72AF] dark:text-[#DBE2EF]">
                  Category / Level
                </span>
                <span className="font-medium text-[#112D4E] dark:text-[#DBE2EF] text-right">
                  {courseCategory} {courseLevel ? `• ${courseLevel}` : ""}
                </span>
              </div>
            )}

            {typeof coursePrice === "number" && (
              <div className="flex justify-between gap-4">
                <span className="text-[#3F72AF] dark:text-[#DBE2EF]">
                  Course Fees
                </span>
                <span className="font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  ₹{coursePrice}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Today's classes */}
        <div className="xl:col-span-2 bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Today’s Classes ({dayLabelMap[todayKey]})
            </h2>

            <div className="flex items-center gap-2 text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
              <Clock size={14} />
              {tableLoading ? "Loading..." : `${todaySlots.length} class(es)`}
            </div>
          </div>

          <div className="mt-4">
            {tableLoading ? (
              <div className="p-6 text-center text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
                Loading timetable...
              </div>
            ) : todaySlots.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
                No classes scheduled for today 🎉
              </div>
            ) : (
              <div className="space-y-3">
                {todaySlots.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                        {minutesToTime(s.startMinutes)} -{" "}
                        {minutesToTime(s.endMinutes)}
                      </p>

                      <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
                        {s.course?.title || courseTitle}
                      </p>

                      <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                        Tutor:{" "}
                        {s.tutor?.employee?.name || s.tutor?.name || tutorName}
                      </p>
                    </div>

                    {s.room ? (
                      <div className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                        Room: <span className="font-medium">{s.room}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                        —
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NEXT CLASS QUICK VIEW */}
          {!tableLoading && upcomingToday && (
            <div className="mt-5 p-4 rounded-xl border border-[#3F72AF] bg-[#DBE2EF] dark:bg-[#0a1f3a]">
              <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                Next Class Today
              </p>

              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
                {minutesToTime(upcomingToday.startMinutes)} -{" "}
                {minutesToTime(upcomingToday.endMinutes)} •{" "}
                {upcomingToday.course?.title || courseTitle}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
