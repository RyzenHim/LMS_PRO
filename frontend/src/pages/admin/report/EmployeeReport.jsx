import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axios";
import ExportCSVButton from "./components/ExportCSVButton";
import ReportPageHeader from "./components/ReportPageHeader";
import ReportTableWrapper from "./components/ReportTableWrapper";

const EmployeeReport = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosInstance.get("/employees/allEmp");

        console.log("EMPLOYEE REPORT API:", res.data);

        const arr = res.data?.employees || res.data || [];
        setEmployees(Array.isArray(arr) ? arr : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load employees.");
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

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
        subtitle="Export employee list report."
        right={
          <ExportCSVButton rows={exportRows} filename="employee-report.csv" />
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
