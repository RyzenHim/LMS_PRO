import { useEffect, useMemo, useState } from "react";
import { Users, GraduationCap, CalendarDays, Clock } from "lucide-react";
import axiosInstance from "../../api/axios";

const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const minutesToTime = (m) => {
  const h = Math.floor(Number(m || 0) / 60);
  const min = Number(m || 0) % 60;
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
      .filter((s) => s?.day === todayKey)
      .sort((a, b) => Number(a?.startMinutes || 0) - Number(b?.startMinutes || 0));
  }, [data, todayKey]);

  if (loading) {
    return (
      <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          Tutor Dashboard
        </h1>
        <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
          Welcome {data?.tutor?.employee?.name || data?.tutor?.name || "Tutor"}
        </p>
        {error && (
          <div className="mt-3 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a]">
              <GraduationCap className="text-[#3F72AF]" size={18} />
            </div>
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">Assigned Batches</p>
              <p className="text-xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {data?.summary?.totalBatches || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a]">
              <Users className="text-[#3F72AF]" size={18} />
            </div>
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">Active Students</p>
              <p className="text-xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {data?.summary?.totalStudents || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a]">
              <CalendarDays className="text-[#3F72AF]" size={18} />
            </div>
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">Weekly Slots</p>
              <p className="text-xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {data?.summary?.totalSlots || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6">
          <h2 className="text-base font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Assigned Batches
          </h2>
          <div className="mt-4 space-y-3">
            {(data?.batches || []).length === 0 && (
              <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">No batch assigned.</p>
            )}
            {(data?.batches || []).map((b) => (
              <div key={b?._id} className="p-3 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF]">
                <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                  {b?.name || "-"}
                </p>
                <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                  {b?.course?.title || "-"} • {b?.status || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Today's Timetable
            </h2>
            <div className="text-xs text-[#3F72AF] dark:text-[#DBE2EF] flex items-center gap-1">
              <Clock size={12} />
              {todaySlots.length} slot(s)
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {todaySlots.length === 0 && (
              <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">No slots today.</p>
            )}
            {todaySlots.map((slot) => (
              <div key={slot?._id} className="p-3 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF]">
                <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                  {minutesToTime(slot?.startMinutes)} - {minutesToTime(slot?.endMinutes)}
                </p>
                <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                  {slot?.batch?.name || "-"} • {slot?.course?.title || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
