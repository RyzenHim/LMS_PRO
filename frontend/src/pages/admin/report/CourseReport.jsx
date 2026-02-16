import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axios";
import ExportCSVButton from "./components/ExportCSVButton";
import ReportPageHeader from "./components/ReportPageHeader";
import ReportTableWrapper from "./components/ReportTableWrapper";

const CourseReport = () => {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "" });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const courseRes = await axiosInstance.get("/reports/courses", {
        params: filters,
      });

      console.log("COURSES API:", courseRes.data);

      const courseArr = courseRes.data?.courses || courseRes.data || [];

      setCourses(Array.isArray(courseArr) ? courseArr : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load course report.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // map courseId => count
  const exportRows = useMemo(() => {
    return (courses || []).map((c) => ({
      Title: c?.title || "",
      Category: c?.category || "",
      Level: c?.level || "",
      Price: c?.price ?? "",
      Status: c?.isActive ? "active" : "inactive",
      BatchesCount: c?.batchCount || 0,
    }));
  }, [courses]);

  return (
    <div className="p-6 space-y-6">
      <ReportPageHeader
        title="Course Report"
        subtitle="Export courses and batch count by date range."
        right={
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm"
            />
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm"
            />
            <button
              onClick={loadData}
              className="px-3 py-2 rounded-xl bg-[#3F72AF] text-white text-sm font-medium hover:opacity-90"
            >
              Apply
            </button>
            <ExportCSVButton rows={exportRows} filename="course-report.csv" />
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm shadow-sm">
          {error}
        </div>
      )}

      <ReportTableWrapper title="Courses" count={courses?.length || 0}>
        {loading ? (
          <div className="p-10 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
            Loading...
          </div>
        ) : (courses || []).length === 0 ? (
          <div className="p-10 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
            No courses found.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-[#F9F7F7] dark:bg-[#0a1f3a] sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Level</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Batches</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {(courses || []).map((c) => (
                <tr
                  key={c?._id}
                  className="border-t hover:bg-[#F9F7F7] dark:hover:bg-[#0a1f3a] transition"
                >
                  <td className="p-3 font-medium">{c?.title || "-"}</td>
                  <td className="p-3">{c?.category || "-"}</td>
                  <td className="p-3">{c?.level || "-"}</td>
                  <td className="p-3">{c?.price ?? "-"}</td>
                  <td className="p-3">{c?.batchCount || 0}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        c?.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {c?.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ReportTableWrapper>
    </div>
  );
};

export default CourseReport;
