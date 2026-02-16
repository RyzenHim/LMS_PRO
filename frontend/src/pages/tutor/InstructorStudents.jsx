import { useEffect, useState } from "react";
import { tutorService } from "../../services/tutorService";
import Pagination from "../../components/Pagination";
import SortHeader from "../../components/SortHeader";

const InstructorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await tutorService.getMeStudents({
        page,
        limit: 10,
        search,
        status,
        sortBy,
        sortOrder,
      });

      setStudents(res.data?.students || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search, status, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          My Students
        </h1>
        <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
          Students from batches assigned to you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search name, email, phone"
          className="px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E]"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg bg-white dark:bg-[#112D4E]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF]">
            <tr>
              <th className="p-3 text-left">
                <SortHeader
                  label="Name"
                  field="name"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </th>
              <th className="p-3 text-left">
                <SortHeader
                  label="Email"
                  field="email"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Batch</th>
              <th className="p-3 text-left">Course</th>
              <th className="p-3 text-left">
                <SortHeader
                  label="Status"
                  field="status"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s._id} className="border-t border-[#DBE2EF] dark:border-[#3F72AF]">
                  <td className="p-3">{s.name || "-"}</td>
                  <td className="p-3">{s.email || "-"}</td>
                  <td className="p-3">{s.phone || "-"}</td>
                  <td className="p-3">{s.batch?.name || "-"}</td>
                  <td className="p-3">{s.course?.title || "-"}</td>
                  <td className="p-3 capitalize">{s.status || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default InstructorStudents;
