import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axios";
import { timetableService } from "../../services/timetableService";

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const START_HOUR = 9;
const END_HOUR = 21;
const SLOT_HEIGHT = 56;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const minutesToTime = (m) => {
  const h = Math.floor(m / 60);
  const min = m % 60;

  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? "PM" : "AM";

  return `${hour12}:${String(min).padStart(2, "0")} ${ampm}`;
};

const StudentTimetable = () => {
  const [student, setStudent] = useState(null);
  const [batchId, setBatchId] = useState("");

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  const [error, setError] = useState("");

  // 1) Fetch Student Profile
  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        setError("");

        // IMPORTANT: this must be /students/me
        const res = await axiosInstance.get("/students/me");

        const me = res.data?.student;
        setStudent(me);

        const bId = me?.batch?._id || me?.batch || "";
        setBatchId(bId);
      } catch (err) {
        console.error("Fetch student error:", err);
        setError("Failed to load student profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  // 2) Fetch Timetable by Batch
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!batchId) {
        setSlots([]);
        return;
      }

      try {
        setTableLoading(true);
        setError("");

        // timetableService must call batch timetable API
        const res = await timetableService.getBatchTimetable(batchId);

        // expected response: { slots: [...] }
        setSlots(res.data?.slots || []);
      } catch (err) {
        console.error("Fetch timetable error:", err);
        setError("Failed to load timetable.");
      } finally {
        setTableLoading(false);
      }
    };

    fetchTimetable();
  }, [batchId]);

  // Slots grouped by day
  const daySlots = useMemo(() => {
    const map = {};
    for (const d of DAYS) map[d.key] = [];

    for (const s of slots) {
      if (!map[s.day]) map[s.day] = [];
      map[s.day].push(s);
    }

    for (const d of DAYS) {
      map[d.key].sort((a, b) => a.startMinutes - b.startMinutes);
    }

    return map;
  }, [slots]);

  // Hours for left time column
  const hours = useMemo(() => {
    const arr = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) arr.push(h);
    return arr;
  }, []);

  // Slot style positioning
  const getSlotStyle = (slot) => {
    const dayStart = START_HOUR * 60;

    const start = clamp(slot.startMinutes, dayStart, END_HOUR * 60);
    const end = clamp(slot.endMinutes, dayStart, END_HOUR * 60);

    const top = ((start - dayStart) / 60) * SLOT_HEIGHT;
    const height = Math.max(((end - start) / 60) * SLOT_HEIGHT, 28);

    return { top, height };
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          My Timetable
        </h1>

        <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
          {student?.name ? `Welcome, ${student.name}` : "Student"}
        </p>

        {student?.batch?.name && (
          <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
            Batch: <span className="font-medium">{student.batch.name}</span>
          </p>
        )}

        {student?.course?.title && (
          <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
            Course: <span className="font-medium">{student.course.title}</span>
          </p>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* NO BATCH */}
      {!batchId ? (
        <div className="border border-[#DBE2EF] dark:border-[#3F72AF] rounded-xl p-10 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
          Your batch is not assigned yet. Please contact admin.
        </div>
      ) : (
        <div className="relative">
          {/* LOADING OVERLAY */}
          {tableLoading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-black/50 flex items-center justify-center z-10 rounded-xl">
              <div className="px-4 py-2 rounded-lg bg-white dark:bg-[#112D4E] border border-[#DBE2EF] dark:border-[#3F72AF] text-sm shadow-lg">
                Loading timetable...
              </div>
            </div>
          )}

          {/* WEEK GRID */}
          <div className="overflow-x-auto border border-[#DBE2EF] dark:border-[#3F72AF] rounded-xl bg-white dark:bg-[#112D4E] shadow-sm">
            <div className="min-w-[1100px]">
              {/* HEADER */}
              <div className="grid grid-cols-8 sticky top-0 bg-white dark:bg-[#112D4E] z-20 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
                <div className="p-3 text-xs font-semibold text-[#3F72AF] dark:text-[#DBE2EF]">
                  Time
                </div>

                {DAYS.map((d) => (
                  <div
                    key={d.key}
                    className="p-3 text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] border-l border-[#DBE2EF] dark:border-[#3F72AF]"
                  >
                    {d.label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-8">
                {/* TIME COLUMN */}
                <div className="border-r border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a]">
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="h-[56px] border-b border-[#DBE2EF] dark:border-[#3F72AF] px-3 py-2 text-[11px] text-[#3F72AF] dark:text-[#DBE2EF]"
                    >
                      {h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
                    </div>
                  ))}
                </div>

                {/* DAY COLUMNS */}
                {DAYS.map((d) => (
                  <div
                    key={d.key}
                    className="relative border-r border-[#DBE2EF] dark:border-[#3F72AF]"
                    style={{
                      height: `${(END_HOUR - START_HOUR + 1) * SLOT_HEIGHT}px`,
                    }}
                  >
                    {/* hour rows */}
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="h-[56px] border-b border-[#DBE2EF] dark:border-[#3F72AF]"
                      />
                    ))}

                    {/* slots */}
                    {daySlots[d.key]?.map((s) => {
                      const style = getSlotStyle(s);

                      return (
                        <div
                          key={s._id}
                          className="absolute left-2 right-2 rounded-lg p-2 text-[11px] shadow-md border border-[#3F72AF] bg-[#DBE2EF] dark:bg-[#0a1f3a]"
                          style={style}
                        >
                          <p className="font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                            {minutesToTime(s.startMinutes)} -{" "}
                            {minutesToTime(s.endMinutes)}
                          </p>

                          <p className="text-[#3F72AF] dark:text-[#DBE2EF] mt-1 truncate">
                            {s.tutor?.name || "Tutor"}
                          </p>

                          <p className="text-[#3F72AF] dark:text-[#DBE2EF] truncate">
                            {s.course?.title || "Course"}
                          </p>

                          {s.room ? (
                            <p className="text-[#3F72AF] dark:text-[#DBE2EF] truncate">
                              Room: {s.room}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTimetable;
