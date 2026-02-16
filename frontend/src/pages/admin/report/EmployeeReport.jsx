import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axios";
import ExportCSVButton from "./components/ExportCSVButton";
import ReportPageHeader from "./components/ReportPageHeader";
import ReportTableWrapper from "./components/ReportTableWrapper";

const EmployeeReport = () => {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.get("/reports/employees", {
        params: filters,
      });

      console.log("EMPLOYEE REPORT API:", res.data);

      const arr = res.data?.employees || res.data?.allEmployes || res.data || [];
      setEmployees(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load employees.");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const exportRows = useMemo(() => {
    return (employees || []).map((e) => ({
      Name: e?.name || "",
      Email: e?.email || "",
      Phone: e?.phone || "",
      Department: e?.department || "",
      Designation: e?.designation || "",
      Salary: e?.salary ?? "",
      Status: e?.isActive ? "active" : "inactive",
    }));
  }, [employees]);

  return (
    <div className="p-6 space-y-6">
      <ReportPageHeader
        title="Employee Report"
        subtitle="Export employee list report by selected date range."
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
              onClick={loadEmployees}
              className="px-3 py-2 rounded-xl bg-[#3F72AF] text-white text-sm font-medium hover:opacity-90"
            >
              Apply
            </button>
            <ExportCSVButton rows={exportRows} filename="employee-report.csv" />
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm shadow-sm">
          {error}
        </div>
      )}

      <ReportTableWrapper title="Employees" count={employees?.length || 0}>
        {loading ? (
          <div className="p-10 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
            Loading...
          </div>
        ) : (employees || []).length === 0 ? (
          <div className="p-10 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
            No employees found.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-[#F9F7F7] dark:bg-[#0a1f3a] sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Designation</th>
                <th className="p-3 text-left">Salary</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {(employees || []).map((e) => (
                <tr
                  key={e?._id}
                  className="border-t hover:bg-[#F9F7F7] dark:hover:bg-[#0a1f3a] transition"
                >
                  <td className="p-3 font-medium">{e?.name || "-"}</td>
                  <td className="p-3">{e?.email || "-"}</td>
                  <td className="p-3">{e?.phone || "-"}</td>
                  <td className="p-3">{e?.department || "-"}</td>
                  <td className="p-3">{e?.designation || "-"}</td>
                  <td className="p-3">{e?.salary ?? "-"}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        e?.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {e?.isActive ? "Active" : "Inactive"}
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

export default EmployeeReport;
