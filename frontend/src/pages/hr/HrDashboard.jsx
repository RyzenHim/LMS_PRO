import { useEffect, useMemo, useState } from "react";
import { Users, Briefcase, UserCheck, UserX } from "lucide-react";
import axiosInstance from "../../api/axios";

const HrDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const [empRes, visitorRes] = await Promise.all([
          axiosInstance.get("/emp/allEmp", { params: { limit: 100 } }),
          axiosInstance.get("/visitor/allvisitor", { params: { limit: 100 } }),
        ]);

        setEmployees(empRes.data?.allEmployes || []);
        setVisitors(visitorRes.data?.visitors || []);
      } catch (err) {
        console.error("HR dashboard error:", err);
        setError("Failed to load HR dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const summary = useMemo(() => {
    const activeEmployees = employees.filter((e) => e?.isActive).length;
    const inactiveEmployees = employees.filter((e) => !e?.isActive).length;
    const followUps = visitors.filter((v) => v?.status === "follow-up").length;
    return {
      totalEmployees: employees.length,
      activeEmployees,
      inactiveEmployees,
      totalVisitors: visitors.length,
      followUps,
    };
  }, [employees, visitors]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          HR Dashboard
        </h1>
        <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
          Employee and visitor activity snapshot.
        </p>
        {error && (
          <div className="mt-3 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-5">
          <div className="flex items-center gap-3">
            <Briefcase className="text-[#3F72AF]" size={18} />
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">Employees</p>
              <p className="text-xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {loading ? "..." : summary.totalEmployees}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-5">
          <div className="flex items-center gap-3">
            <UserCheck className="text-[#3F72AF]" size={18} />
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">Active Employees</p>
              <p className="text-xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {loading ? "..." : summary.activeEmployees}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-5">
          <div className="flex items-center gap-3">
            <UserX className="text-[#3F72AF]" size={18} />
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">Inactive Employees</p>
              <p className="text-xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {loading ? "..." : summary.inactiveEmployees}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-5">
          <div className="flex items-center gap-3">
            <Users className="text-[#3F72AF]" size={18} />
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">Follow-Up Visitors</p>
              <p className="text-xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {loading ? "..." : summary.followUps}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6">
        <h2 className="text-base font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          Recent Employees
        </h2>
        <div className="mt-4 space-y-3">
          {(employees || []).slice(0, 8).map((emp) => (
            <div key={emp?._id} className="p-3 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                  {emp?.name || "-"}
                </p>
                <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                  {emp?.department || "-"} • {emp?.designation || "-"}
                </p>
              </div>
              <span className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                {emp?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
          {!loading && employees.length === 0 && (
            <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">No employees found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;
