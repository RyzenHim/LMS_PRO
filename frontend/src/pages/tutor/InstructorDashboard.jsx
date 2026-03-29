import { useEffect, useMemo, useState } from "react";
import { Users, GraduationCap, CalendarDays, Clock } from "lucide-react";
import axiosInstance from "../../api/axios";
import PageLoader from "../../components/ui/PageLoader";

const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const minutesToTime = (minutes) => {
  const h = Math.floor(Number(minutes || 0) / 60);
  const min = Number(minutes || 0) % 60;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hour12}:${String(min).padStart(2, "0")} ${ampm}`;
};

const InstructorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosInstance.get("/tutors/me/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Tutor dashboard error:", err);
        setError("Failed to load tutor dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const todayKey = days[new Date().getDay()];

  const todaySlots = useMemo(() => {
    return (data?.timetable || [])
      .filter((slot) => slot?.day === todayKey)
      .sort(
        (a, b) => Number(a?.startMinutes || 0) - Number(b?.startMinutes || 0),
      );
  }, [data, todayKey]);

  if (loading) {
    return (
      <PageLoader
        label="Loading"
        detail="Preparing your tutor dashboard"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="neu-panel rounded-[32px] p-6">
        <h1 className="text-2xl font-semibold text-[var(--lms-text)]">
          Tutor Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--lms-text-soft)]">
          Welcome {data?.tutor?.employee?.name || data?.tutor?.name || "Tutor"}
        </p>
        {error ? <div className="lms-status-error mt-4">{error}</div> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            title: "Assigned Batches",
            value: data?.summary?.totalBatches || 0,
            icon: GraduationCap,
          },
          {
            title: "Active Students",
            value: data?.summary?.totalStudents || 0,
            icon: Users,
          },
          {
            title: "Weekly Slots",
            value: data?.summary?.totalSlots || 0,
            icon: CalendarDays,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="neu-panel-soft rounded-[28px] p-5">
              <div className="flex items-center gap-3">
                <div className="neu-inset rounded-2xl p-3">
                  <Icon className="text-[var(--lms-accent-strong)]" size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">
                    {item.title}
                  </p>
                  <p className="text-xl font-semibold text-[var(--lms-text)]">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="neu-panel rounded-[32px] p-6">
          <h2 className="text-base font-semibold text-[var(--lms-text)]">
            Assigned Batches
          </h2>
          <div className="mt-4 space-y-3">
            {(data?.batches || []).length === 0 ? (
              <div className="neu-empty-state p-8 text-sm">
                No batch assigned.
              </div>
            ) : (
              (data?.batches || []).map((batch) => (
                <div
                  key={batch?._id}
                  className="neu-inset rounded-[24px] p-4"
                >
                  <p className="text-sm font-semibold text-[var(--lms-text)]">
                    {batch?.name || "-"}
                  </p>
                  <p className="text-xs text-[var(--lms-text-soft)]">
                    {[batch?.course?.title || "-", batch?.status || "-"].join(
                      " • ",
                    )}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="neu-panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-[var(--lms-text)]">
              Today&apos;s Timetable
            </h2>
            <div className="flex items-center gap-1 text-xs text-[var(--lms-text-soft)]">
              <Clock size={12} />
              {todaySlots.length} slot(s)
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {todaySlots.length === 0 ? (
              <div className="neu-empty-state p-8 text-sm">No slots today.</div>
            ) : (
              todaySlots.map((slot) => (
                <div key={slot?._id} className="neu-inset rounded-[24px] p-4">
                  <p className="text-sm font-semibold text-[var(--lms-text)]">
                    {minutesToTime(slot?.startMinutes)} -{" "}
                    {minutesToTime(slot?.endMinutes)}
                  </p>
                  <p className="text-xs text-[var(--lms-text-soft)]">
                    {[slot?.batch?.name || "-", slot?.course?.title || "-"].join(
                      " • ",
                    )}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
