import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Users,
  Filter,
  X,
} from "lucide-react";

import { tutorService } from "../../services/tutorService";
import { employeeService } from "../../services/employeeService";
import EditTutorModal from "./modal/EditTutorModal";
import ViewTutorModal from "./modal/ViewTutorModal";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";
import Pagination from "../../components/Pagination";

const SortArrow = ({ field, sortBy, sortOrder }) => {
  if (sortBy !== field)
    return <span className="ml-1 opacity-30 text-xs">↕</span>;
  return (
    <span className="ml-1 text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
  );
};

const selectCls =
  "w-full text-sm px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition";
const inputCls =
  "w-full text-sm px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition";

const AdminTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTutors, setTotalTutors] = useState(0);
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterIsActive, setFilterIsActive] = useState("");
  const [filterExpertise, setFilterExpertise] = useState("");
  const [filterQualification, setFilterQualification] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search, sortBy, sortOrder };
      if (activeTab === "active") {
        if (filterIsActive) params.isActive = filterIsActive;
        if (filterExpertise) params.expertise = filterExpertise;
        if (filterQualification) params.qualification = filterQualification;
      } else {
        if (filterExpertise) params.expertise = filterExpertise;
        if (filterQualification) params.qualification = filterQualification;
      }
      const fn =
        activeTab === "active" ? tutorService.getAll : tutorService.getDeleted;
      const res = await fn(params);
      const data = res?.data ?? res;
      setTutors(data?.tutors ?? []);
      setTotalPages(data?.totalPages ?? 1);
      setTotalTutors(data?.totalTutors ?? 0);
    } catch (err) {
      console.error("Fetch tutors error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [
    activeTab,
    page,
    search,
    sortBy,
    sortOrder,
    filterIsActive,
    filterExpertise,
    filterQualification,
  ]);
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setFilterIsActive("");
    setFilterExpertise("");
    setFilterQualification("");
    setPage(1);
  };
  const activeFilterCount = [
    filterIsActive,
    filterExpertise,
    filterQualification,
  ].filter(Boolean).length;

  // receives { tutorUpdate, employeeUpdate }
  const handleUpdateTutor = async (payload) => {
    try {
      await tutorService.update(selectedTutor._id, payload.tutorUpdate);
      if (selectedTutor?.employee?._id && payload.employeeUpdate) {
        await employeeService.update(
          selectedTutor.employee._id,
          payload.employeeUpdate,
        );
      }
      setOpenEdit(false);
      setSelectedTutor(null);
      fetchTutors();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update tutor");
    }
  };

  const handleDelete = async () => {
    try {
      await tutorService.softDelete(selectedTutor._id);
      setOpenDelete(false);
      setSelectedTutor(null);
      fetchTutors();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete tutor");
    }
  };

  const handleRestore = async (id) => {
    try {
      await tutorService.restore(id);
      fetchTutors();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to restore");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await tutorService.toggleStatus(id);
      fetchTutors();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to toggle status");
    }
  };

  return (
    <div className="space-y-5 p-1">
      {/* Header card */}
      <div className="bg-white dark:bg-[#101010] rounded-2xl border border-[#DBE2EF] dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20">
            <Users size={20} className="text-[#3F72AF]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#112D4E] dark:text-slate-100">
              Tutors
            </h1>
            <p className="text-xs text-[#3F72AF] dark:text-slate-400 mt-0.5">
              Manage instructors & tutors
              {totalTutors > 0 && (
                <span className="ml-2 font-semibold">
                  · {totalTutors} total
                </span>
              )}
            </p>
          </div>
        </div>
        {/* Tabs */}
        <div className="mt-4 flex gap-2 border-b border-[#DBE2EF] dark:border-slate-800">
          {["active", "trash"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px capitalize ${
                activeTab === tab
                  ? tab === "trash"
                    ? "border-red-500 text-red-500 dark:text-red-400 dark:border-red-400"
                    : "border-[#3F72AF] text-[#3F72AF] dark:text-slate-100 dark:border-slate-100"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-[#3F72AF] dark:hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white dark:bg-[#101010] rounded-2xl border border-[#DBE2EF] dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-[#F9F7F7] dark:bg-[#1a1a1a] focus-within:ring-2 focus-within:ring-[#3F72AF]/30 transition">
            <Search
              size={15}
              className="text-[#3F72AF] dark:text-slate-500 shrink-0"
            />
            <input
              type="text"
              placeholder="Search by name, email, expertise..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent outline-none text-sm text-[#112D4E] dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                <X
                  size={14}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
              showFilters || activeFilterCount > 0
                ? "bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20 border-[#3F72AF]/30 text-[#3F72AF] dark:text-blue-400"
                : "bg-white dark:bg-[#1a1a1a] border-[#DBE2EF] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#F9F7F7] dark:hover:bg-[#252525]"
            }`}
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#3F72AF] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="border-t border-[#DBE2EF] dark:border-slate-800 pt-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeTab === "active" && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={filterIsActive}
                    onChange={(e) => {
                      setFilterIsActive(e.target.value);
                      setPage(1);
                    }}
                    className={selectCls}
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Expertise
                </label>
                <input
                  type="text"
                  value={filterExpertise}
                  onChange={(e) => {
                    setFilterExpertise(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. React, Python..."
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Qualification
                </label>
                <input
                  type="text"
                  value={filterQualification}
                  onChange={(e) => {
                    setFilterQualification(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. B.Tech, MCA..."
                  className={inputCls}
                />
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 dark:text-red-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#101010] rounded-2xl border border-[#DBE2EF] dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading tutors...
          </div>
        ) : tutors.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No tutors found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF]/50 dark:bg-[#1a1a1a] border-b border-[#DBE2EF] dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 text-left">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300"
                    >
                      Name{" "}
                      <SortArrow
                        field="name"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Contact
                  </th>
                  <th className="px-5 py-3.5 text-left">
                    <button
                      onClick={() => handleSort("expertise")}
                      className="flex items-center font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300"
                    >
                      Expertise{" "}
                      <SortArrow
                        field="expertise"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-left">
                    <button
                      onClick={() => handleSort("experience")}
                      className="flex items-center font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300"
                    >
                      Exp{" "}
                      <SortArrow
                        field="experience"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Qualification
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Salary
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Active
                  </th>
                  {activeTab === "trash" && (
                    <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                      Deleted On
                    </th>
                  )}
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DBE2EF] dark:divide-slate-800">
                {tutors.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-[#F9F7F7] dark:hover:bg-[#1a1a1a] transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#3F72AF]/20 dark:bg-[#3F72AF]/30 flex items-center justify-center shrink-0 text-xs font-bold text-[#3F72AF] uppercase">
                          {(t.employee?.name || "T").charAt(0)}
                        </div>
                        <span className="font-semibold text-[#112D4E] dark:text-slate-100">
                          {t.employee?.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs space-y-0.5">
                        <div className="text-slate-600 dark:text-slate-300">
                          {t.employee?.email || "—"}
                        </div>
                        <div className="text-slate-400 dark:text-slate-500">
                          {t.employee?.phone || "—"}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {t.expertise || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {t.experience || 0} yrs
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {t.qualification || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap">
                      ₹{Number(t.employee?.salary || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${t.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"}`}
                      >
                        {t.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    {activeTab === "trash" && (
                      <td className="px-5 py-4 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {t.deletedAt
                          ? new Date(t.deletedAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    )}
                    <td className="px-5 py-4">
                      {activeTab === "trash" ? (
                        <button
                          onClick={() => handleRestore(t._id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
                        >
                          <RotateCcw size={14} /> Restore
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedTutor(t);
                              setOpenView(true);
                            }}
                            className="text-[#3F72AF] dark:text-slate-300 hover:text-[#112D4E] dark:hover:text-white transition"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTutor(t);
                              setOpenEdit(true);
                            }}
                            className="text-slate-500 dark:text-slate-400 hover:text-[#112D4E] dark:hover:text-white transition"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(t._id)}
                            className={`text-xs font-medium transition ${t.isActive ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}
                          >
                            {t.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTutor(t);
                              setOpenDelete(true);
                            }}
                            className="text-red-500 dark:text-red-400 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      <EditTutorModal
        open={openEdit}
        tutor={selectedTutor}
        onClose={() => {
          setOpenEdit(false);
          setSelectedTutor(null);
        }}
        onSubmit={handleUpdateTutor}
      />
      <ViewTutorModal
        open={openView}
        tutor={selectedTutor}
        onClose={() => {
          setOpenView(false);
          setSelectedTutor(null);
        }}
      />
      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedTutor(null);
        }}
        onConfirm={handleDelete}
        title={selectedTutor?.employee?.name || "Tutor"}
      />
    </div>
  );
};

export default AdminTutors;
