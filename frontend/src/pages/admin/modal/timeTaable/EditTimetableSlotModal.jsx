import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import axiosInstance from "../../../../api/axios";
import { timetableService } from "../../../../services/timetableService";
import { roomService } from "../../../../services/roomService";
import ModalShell from "../../../../components/ui/ModalShell";

const timeToMinutes = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTimeInput = (m) => {
  const h = String(Math.floor(m / 60)).padStart(2, "0");
  const min = String(m % 60).padStart(2, "0");
  return `${h}:${min}`;
};

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const getTutorName = (t) => t?.employee?.name || t?.name || "Tutor";
const getRoomId = (r) => r?.value || r?._id || "";
const getRoomLabel = (r) =>
  r?.roomName ||
  r?.name ||
  r?.roomNumber ||
  (r?.buildingName && r?.floorNumber
    ? `${r.buildingName} - Floor ${r.floorNumber}`
    : "") ||
  "Room";

const fieldClass =
  "neu-input mt-2 w-full rounded-[20px] px-4 py-3 text-sm text-[var(--lms-text)]";

const EditTimetableSlotModal = ({
  open,
  onClose,
  slot,
  batchId,
  selectedCourseId,
  onSuccess,
}) => {
  const [tutors, setTutors] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [form, setForm] = useState({
    tutor: "",
    subject: "",
    day: "mon",
    startTime: "10:00",
    endTime: "11:00",
    location: "",
    buildingName: "",
    floorNumber: "",
    room: "",
  });
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const fetchDropdowns = async () => {
      try {
        setDropdownLoading(true);
        const [tRes, rRes] = await Promise.all([
          axiosInstance.get("/tutors/all"),
          roomService.getOptions(),
        ]);
        setTutors(Array.isArray(tRes.data?.tutors) ? tRes.data.tutors : []);
        setRoomOptions(Array.isArray(rRes.data?.options) ? rRes.data.options : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load tutors and rooms.");
      } finally {
        setDropdownLoading(false);
      }
    };
    fetchDropdowns();
  }, [open]);

  useEffect(() => {
    if (!open || !slot) return;
    const roomIdFromSlot =
      typeof slot?.room === "string"
        ? slot.room
        : slot?.room?._id || slot?.room?.value || "";
    const roomObj = roomOptions.find((r) => getRoomId(r) === roomIdFromSlot);

    setForm({
      tutor: slot?.tutor?._id || slot?.tutor || "",
      subject: slot?.subject || "",
      day: slot?.day || "mon",
      startTime: minutesToTimeInput(slot?.startMinutes || 0),
      endTime: minutesToTimeInput(slot?.endMinutes || 0),
      location: roomObj?.location || "",
      buildingName: roomObj?.buildingName || "",
      floorNumber:
        roomObj?.floorNumber !== undefined && roomObj?.floorNumber !== null
          ? String(roomObj.floorNumber)
          : "",
      room: roomIdFromSlot || "",
    });
    setError("");
  }, [open, slot, roomOptions]);

  const isValidTime = useMemo(() => {
    const start = timeToMinutes(form.startTime);
    const end = timeToMinutes(form.endTime);
    return end > start;
  }, [form.startTime, form.endTime]);

  const locations = useMemo(
    () => Array.from(new Set(roomOptions.map((r) => r.location).filter(Boolean))),
    [roomOptions],
  );
  const buildings = useMemo(() => {
    if (!form.location) return [];
    return Array.from(
      new Set(
        roomOptions
          .filter((r) => r.location === form.location)
          .map((r) => r.buildingName)
          .filter(Boolean),
      ),
    );
  }, [roomOptions, form.location]);
  const floors = useMemo(() => {
    if (!form.location || !form.buildingName) return [];
    return Array.from(
      new Set(
        roomOptions
          .filter(
            (r) =>
              r.location === form.location &&
              r.buildingName === form.buildingName,
          )
          .map((r) => String(r.floorNumber))
          .filter(Boolean),
      ),
    );
  }, [roomOptions, form.location, form.buildingName]);
  const rooms = useMemo(() => {
    if (!form.location || !form.buildingName || !form.floorNumber) return [];
    return roomOptions.filter(
      (r) =>
        r.location === form.location &&
        r.buildingName === form.buildingName &&
        String(r.floorNumber) === String(form.floorNumber),
    );
  }, [roomOptions, form.location, form.buildingName, form.floorNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slot?._id || !batchId || !selectedCourseId) return;
    if (!form.tutor) {
      setError("Please select a tutor.");
      return;
    }
    if (!isValidTime) {
      setError("End time must be greater than start time.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await timetableService.updateSlot(slot._id, {
        batch: batchId,
        course: selectedCourseId,
        tutor: form.tutor,
        subject: form.subject?.trim() || "",
        day: form.day,
        startMinutes: timeToMinutes(form.startTime),
        endMinutes: timeToMinutes(form.endTime),
        room: form.room || null,
      });
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Edit Timetable Slot"
      subtitle="Refine timing, tutor assignment, and room placement."
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="lms-status-error flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {dropdownLoading ? (
          <div className="neu-inset flex items-center gap-2 rounded-[20px] px-4 py-3 text-sm text-[var(--lms-text-soft)]">
            <Loader2 size={16} className="animate-spin" />
            Loading tutors and rooms...
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">
              Tutor
            </label>
            <select
              value={form.tutor}
              onChange={(e) => setForm((p) => ({ ...p, tutor: e.target.value }))}
              disabled={dropdownLoading || loading}
              className={fieldClass}
              required
            >
              <option value="">Select Tutor</option>
              {tutors.map((t) => (
                <option key={t._id} value={t._id}>
                  {getTutorName(t)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">
              Subject
            </label>
            <input
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              disabled={loading}
              className={fieldClass}
              placeholder="React Basics"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">
              Day
            </label>
            <select
              value={form.day}
              onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))}
              disabled={loading}
              className={fieldClass}
            >
              {DAYS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">
              Start
            </label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) =>
                setForm((p) => ({ ...p, startTime: e.target.value }))
              }
              disabled={loading}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">
              End
            </label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
              disabled={loading}
              className={`${fieldClass} ${isValidTime ? "" : "border-red-300 bg-red-50/70"}`}
            />
            {!isValidTime ? (
              <p className="mt-1 text-xs text-rose-600">
                End time must be greater than start time.
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">
              Location
            </label>
            <select
              value={form.location}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  location: e.target.value,
                  buildingName: "",
                  floorNumber: "",
                  room: "",
                }))
              }
              className={fieldClass}
            >
              <option value="">Select</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">
              Building
            </label>
            <select
              value={form.buildingName}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  buildingName: e.target.value,
                  floorNumber: "",
                  room: "",
                }))
              }
              disabled={!form.location}
              className={fieldClass}
            >
              <option value="">Select</option>
              {buildings.map((building) => (
                <option key={building} value={building}>
                  {building}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">
              Floor
            </label>
            <select
              value={form.floorNumber}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  floorNumber: e.target.value,
                  room: "",
                }))
              }
              disabled={!form.buildingName}
              className={fieldClass}
            >
              <option value="">Select</option>
              {floors.map((f) => (
                <option key={f} value={f}>
                  Floor {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">
              Room
            </label>
            <select
              value={form.room}
              onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))}
              disabled={!form.floorNumber}
              className={fieldClass}
            >
              <option value="">Select</option>
              {rooms.map((r) => {
                const id = getRoomId(r);
                return (
                  <option key={id} value={id}>
                    {getRoomLabel(r)}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="neu-button rounded-[20px] px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || dropdownLoading || !isValidTime}
            className="neu-button neu-button-primary rounded-[20px] px-5 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              "Update Slot"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default EditTimetableSlotModal;
