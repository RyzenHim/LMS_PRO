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
import PageLoader from "../../components/ui/PageLoader";

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

const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const min = minutes % 60;
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

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosInstance.get("/students/me");
        const studentDoc = res.data?.student;
        const maps = res.data?.mappings || [];
        const activeMap = maps?.[0];

        setStudent(studentDoc);
        setMappings(maps);
        setBatchId(activeMap?.batch?._id || "");
      } catch (err) {
        console.error("Dashboard fetchMe error:", err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

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
      .filter((slot) => slot.day === todayKey)
      .sort((a, b) => a.startMinutes - b.startMinutes);
  }, [slots, todayKey]);

  const weeklyClassCount = useMemo(() => (slots || []).length, [slots]);
  const upcomingToday = todaySlots?.[0];

  if (loading) {
    return (
      <PageLoader
        label="Loading"
        detail="Preparing your student dashboard"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="neu-panel rounded-[32px] p-6">
        <h1 className="text-2xl font-semibold text-[var(--lms-text)]">
          Student Dashboard
        </h1>
        <p className="mt-2 text-sm text-[var(--lms-text-soft)]">
          Welcome, <span className="font-medium text-[var(--lms-text)]">{studentName}</span>
        </p>
        {error ? <div className="lms-status-error mt-4">{error}</div> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Batch", value: batchName, icon: GraduationCap },
          { title: "Course", value: courseTitle, icon: BookOpen },
          { title: "Tutor", value: tutorName, icon: Users },
          {
            title: "Weekly Classes",
            value: tableLoading ? "Loading..." : weeklyClassCount,
            icon: CalendarDays,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="neu-panel-soft rounded-[28px] p-5">
              <div className="flex items-center gap-3">
                <div className="neu-inset rounded-2xl p-3">
                  <Icon className="text-[var(--lms-accent-strong)]" size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">
                    {item.title}
                  </p>
                  <p className="text-sm font-semibold text-[var(--lms-text)]">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="neu-panel rounded-[32px] p-6">
          <h2 className="text-base font-semibold text-[var(--lms-text)]">
            My Profile
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            {[
              ["Name", studentName],
              ["Email", studentEmail],
              ["Phone", studentPhone],
              ["Course", courseTitle],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-[var(--lms-text-soft)]">{label}</span>
                <span className="text-right font-medium text-[var(--lms-text)]">
                  {value}
                </span>
              </div>
            ))}

            {courseCategory || courseLevel ? (
              <div className="flex justify-between gap-4">
                <span className="text-[var(--lms-text-soft)]">
                  Category / Level
                </span>
                <span className="text-right font-medium text-[var(--lms-text)]">
                  {[courseCategory, courseLevel].filter(Boolean).join(" • ")}
                </span>
              </div>
            ) : null}

            {typeof coursePrice === "number" ? (
              <div className="flex justify-between gap-4">
                <span className="text-[var(--lms-text-soft)]">Course Fees</span>
                <span className="font-medium text-[var(--lms-text)]">
                  ₹{coursePrice}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="neu-panel rounded-[32px] p-6 xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-[var(--lms-text)]">
              Today&apos;s Classes ({dayLabelMap[todayKey]})
            </h2>

            <div className="flex items-center gap-2 text-xs text-[var(--lms-text-soft)]">
              <Clock size={14} />
              {tableLoading ? "Loading..." : `${todaySlots.length} class(es)`}
            </div>
          </div>

          <div className="mt-4">
            {tableLoading ? (
              <div className="neu-panel-soft rounded-[26px] px-5 py-4">
                <PageLoader
                  compact
                  label="Loading"
                  detail="Refreshing today's timetable"
                />
              </div>
            ) : todaySlots.length === 0 ? (
              <div className="neu-empty-state p-8 text-sm">
                No classes scheduled for today.
              </div>
            ) : (
              <div className="space-y-3">
                {todaySlots.map((slot) => (
                  <div
                    key={slot._id}
                    className="neu-inset flex items-start justify-between gap-4 rounded-[24px] p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--lms-text)]">
                        {minutesToTime(slot.startMinutes)} -{" "}
                        {minutesToTime(slot.endMinutes)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--lms-text-soft)]">
                        {slot.course?.title || courseTitle}
                      </p>
                      <p className="text-xs text-[var(--lms-text-soft)]">
                        Tutor:{" "}
                        {slot.tutor?.employee?.name || slot.tutor?.name || tutorName}
                      </p>
                    </div>

                    <div className="text-xs text-[var(--lms-text-soft)]">
                      {slot.room ? (
                        <>
                          Room: <span className="font-medium">{slot.room}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!tableLoading && upcomingToday ? (
            <div className="neu-panel-soft mt-5 rounded-[24px] p-4">
              <p className="text-sm font-semibold text-[var(--lms-text)]">
                Next Class Today
              </p>
              <p className="mt-1 text-xs text-[var(--lms-text-soft)]">
                {minutesToTime(upcomingToday.startMinutes)} -{" "}
                {minutesToTime(upcomingToday.endMinutes)} •{" "}
                {upcomingToday.course?.title || courseTitle}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
