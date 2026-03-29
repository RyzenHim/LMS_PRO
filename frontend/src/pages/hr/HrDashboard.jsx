import { useEffect, useMemo, useState } from "react";
import { Users, Briefcase, UserCheck, UserX } from "lucide-react";
import axiosInstance from "../../api/axios";
import PageLoader from "../../components/ui/PageLoader";

const statCards = [
  { key: "totalEmployees", title: "Employees", icon: Briefcase },
  { key: "activeEmployees", title: "Active Employees", icon: UserCheck },
  { key: "inactiveEmployees", title: "Inactive Employees", icon: UserX },
  { key: "followUps", title: "Follow-Up Visitors", icon: Users },
];

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
    const activeEmployees = employees.filter((employee) => employee?.isActive).length;
    const inactiveEmployees = employees.filter((employee) => !employee?.isActive).length;
    const followUps = visitors.filter((visitor) => visitor?.status === "follow-up").length;

    return {
      totalEmployees: employees.length,
      activeEmployees,
      inactiveEmployees,
      totalVisitors: visitors.length,
      followUps,
    };
  }, [employees, visitors]);

  if (loading) {
    return (
      <PageLoader
        label="Loading"
        detail="Preparing people operations insights"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="neu-panel rounded-[32px] p-6">
        <h1 className="text-2xl font-semibold text-[var(--lms-text)]">
          HR Dashboard
        </h1>
        <p className="mt-2 text-sm text-[var(--lms-text-soft)]">
          Employee and visitor activity snapshot.
        </p>
        {error ? <div className="lms-status-error mt-4">{error}</div> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.key} className="neu-panel-soft rounded-[28px] p-5">
              <div className="flex items-center gap-3">
                <div className="neu-inset rounded-2xl p-3">
                  <Icon className="text-[var(--lms-accent-strong)]" size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">
                    {card.title}
                  </p>
                  <p className="text-xl font-semibold text-[var(--lms-text)]">
                    {summary[card.key]}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="neu-panel rounded-[32px] p-6">
        <h2 className="text-base font-semibold text-[var(--lms-text)]">
          Recent Employees
        </h2>
        <div className="mt-4 space-y-3">
          {employees.slice(0, 8).map((emp) => (
            <div
              key={emp?._id}
              className="neu-inset flex items-center justify-between rounded-[24px] p-4"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--lms-text)]">
                  {emp?.name || "-"}
                </p>
                <p className="text-xs text-[var(--lms-text-soft)]">
                  {[emp?.department || "-", emp?.designation || "-"].join(" • ")}
                </p>
              </div>
              <span className="neu-badge rounded-full px-3 py-1 text-xs font-medium">
                {emp?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))}

          {employees.length === 0 ? (
            <p className="neu-empty-state text-sm">No employees found.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;
