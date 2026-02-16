import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axios";
import ExportCSVButton from "./components/ExportCSVButton";
import BatchReportFilters from "./components/BatchReportFilters";

const BatchReport = () => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const [students, setStudents] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [error, setError] = useState("");

  // 1) Load courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await axiosInstance.get("/courses/all");

        console.log("COURSES API:", res.data);

        const arr = res.data?.courses || res.data || [];
        setCourses(Array.isArray(arr) ? arr : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load courses.");
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, []);

  // 2) Load batches when course changes
  useEffect(() => {
    const loadBatches = async () => {
      if (!selectedCourse) {
        setBatches([]);
        setSelectedBatch("");
        return;
      }

      try {
        setLoadingBatches(true);
        setError("");

        // YOU MUST ADD THIS BACKEND ENDPOINT
        const res = await axiosInstance.get(`/batch/by-course/${selectedCourse}`);

        console.log("BATCHES BY COURSE API:", res.data);

        const arr = res.data?.batches || res.data || [];
        setBatches(Array.isArray(arr) ? arr : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load batches for selected course.");
        setBatches([]);
      } finally {
        setLoadingBatches(false);
      }
    };

    loadBatches();
  }, [selectedCourse]);

  const loadStudents = async () => {
    if (!selectedBatch) {
      setStudents([]);
      return;
    }

    try {
      setLoadingStudents(true);
      setError("");

      const res = await axiosInstance.get("/reports/batch", {
        params: {
          course: selectedCourse || "",
          batch: selectedBatch || "",
          from: dateRange.from || "",
          to: dateRange.to || "",
        },
      });

      console.log("BATCH REPORT API:", res.data);

      const arr = Array.isArray(res.data?.mappings) ? res.data.mappings : [];
      const normalized = arr.map((m) => ({
        _id: m?._id || m?.student?._id,
        name: m?.student?.visitor?.name || "",
        email: m?.student?.visitor?.email || "",
        phone: m?.student?.visitor?.phone || "",
        status: m?.student?.status || "",
      }));
      setStudents(normalized);
    } catch (err) {
      console.error(err);
      setError("Failed to load students of this batch.");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // 3) Load students when batch changes
  useEffect(() => {
    loadStudents();
  }, [selectedBatch]);

  const exportRows = useMemo(() => {
    return (students || []).map((s) => ({
      Name: s?.name || "",
      Email: s?.email || "",
      Phone: s?.phone || "",
      Status: s?.status || "",
    }));
  }, [students]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Batch Report
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
            Select course → batch → export students list.
          </p>
        </div>

        <ExportCSVButton rows={exportRows} filename="batch-report.csv" />
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <BatchReportFilters
        courses={courses}
        batches={batches}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        selectedBatch={selectedBatch}
        setSelectedBatch={setSelectedBatch}
        loadingBatches={loadingBatches}
      />

      <div className="p-4 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E] flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm"
          />
        </div>
        <button
          onClick={loadStudents}
          className="px-4 py-2 rounded-lg bg-[#3F72AF] text-white text-sm font-medium hover:opacity-90"
        >
          Apply Date Filter
        </button>
      </div>

      <div className="border border-[#DBE2EF] dark:border-[#3F72AF] rounded-xl bg-white dark:bg-[#112D4E] overflow-hidden">
        <div className="p-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
          <h2 className="font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Students ({students?.length || 0})
          </h2>
        </div>

        {loadingCourses || loadingStudents ? (
          <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
            Loading...
          </div>
        ) : (students || []).length === 0 ? (
          <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
            No students found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F9F7F7] dark:bg-[#0a1f3a]">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {(students || []).map((s) => (
                  <tr key={s?._id} className="border-t">
                    <td className="p-3">{s?.name || "-"}</td>
                    <td className="p-3">{s?.email || "-"}</td>
                    <td className="p-3">{s?.phone || "-"}</td>
                    <td className="p-3 capitalize">{s?.status || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchReport;
