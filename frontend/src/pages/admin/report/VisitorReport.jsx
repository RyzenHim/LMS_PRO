import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axios";
import ExportCSVButton from "./components/ExportCSVButton";

const VisitorReport = () => {
  const [type, setType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [visitors, setVisitors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      setError("");

      const statusMap = {
        all: "",
        followup: "follow-up",
        converted: "converted",
        notInterested: "not-interested",
      };

      const res = await axiosInstance.get("/reports/visitors", {
        params: {
          status: statusMap[type] || "",
          from,
          to,
        },
      });

      console.log("VISITOR REPORT API:", type, res.data);

      const arr = res.data?.visitors || res.data || [];
      setVisitors(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load visitors report.");
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [type]);

  const exportRows = useMemo(() => {
    return (visitors || []).map((v) => ({
      Name: v?.name || "",
      Email: v?.email || "",
      Phone: v?.phone || "",
      Status: v?.status || "",
      Interested: v?.isInterested ? "Yes" : "No",
    }));
  }, [visitors]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Visitor Report
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
            Select visitor list type and export.
          </p>
        </div>

        <ExportCSVButton rows={exportRows} filename="visitor-report.csv" />
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="p-4 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E] flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm"
          >
            <option value="all">All Visitors</option>
            <option value="followup">Follow Up</option>
            <option value="converted">Converted</option>
            <option value="notInterested">Not Interested</option>
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm"
          />
        </div>

        <button
          onClick={fetchVisitors}
          className="px-4 py-2 rounded-lg bg-[#3F72AF] text-white text-sm font-medium hover:opacity-90"
        >
          Refresh
        </button>
      </div>

      <div className="border border-[#DBE2EF] dark:border-[#3F72AF] rounded-xl bg-white dark:bg-[#112D4E] overflow-hidden">
        <div className="p-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
          <h2 className="font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Visitors ({visitors?.length || 0})
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
            Loading...
          </div>
        ) : (visitors || []).length === 0 ? (
          <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
            No visitors found.
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
                {(visitors || []).map((v) => (
                  <tr key={v?._id} className="border-t">
                    <td className="p-3">{v?.name || "-"}</td>
                    <td className="p-3">{v?.email || "-"}</td>
                    <td className="p-3">{v?.phone || "-"}</td>
                    <td className="p-3">{v?.status || "-"}</td>
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

export default VisitorReport;
