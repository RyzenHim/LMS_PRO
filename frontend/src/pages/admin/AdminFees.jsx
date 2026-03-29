import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  IndianRupee,
  Filter,
  X,
} from "lucide-react";

import { feesService } from "../../services/feesService";
import AddFeesModal from "./modal/fees/AddFeesModal";
import EditFeesModal from "./modal/fees/EditFeesModal";
import ViewFeesModal from "./modal/fees/ViewFeesModal";
import ConfirmDeleteModal from "./modal/fees/ConfirmDeleteModal";
import Pagination from "../../components/Pagination";

// ── Status pill styles ─────────────────────────────────────
const STATUS_STYLES = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  partial:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  unpaid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

// ── Sort arrow helper ──────────────────────────────────────
const SortArrow = ({ field, sortBy, sortOrder }) => {
  if (sortBy !== field)
    return <span className="ml-1 opacity-30 text-xs">↕</span>;
  return (
    <span className="ml-1 text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
  );
};

// ── Shared input style ─────────────────────────────────────
const selectCls =
  "w-full text-sm px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition";

const AdminFees = () => {
  // ── Data states ───────────────────────────────────────────
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // ── Tab ───────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("active");

  // ── Search & Sort ─────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // ── Filters ───────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPaymentMode, setFilterPaymentMode] = useState("");
  const [filterIsActive, setFilterIsActive] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ── Pagination ────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ── Modals ────────────────────────────────────────────────
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  // ──────────────────────────────────────────────────────────
  // FETCH DATA
  // ──────────────────────────────────────────────────────────
  const fetchFees = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search,
        sortBy,
        sortOrder,
      };

      if (activeTab === "active") {
        if (filterStatus) params.status = filterStatus;
        if (filterPaymentMode) params.paymentMode = filterPaymentMode;
        if (filterIsActive) params.isActive = filterIsActive;
      }

      const serviceFn =
        activeTab === "active" ? feesService.getAll : feesService.getDeleted;

      const res = await serviceFn(params);

      setFees(res.data.fees || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalRecords(res.data.totalFees || 0);
    } catch (err) {
      console.error("Fetch fees error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [
    activeTab,
    page,
    search,
    sortBy,
    sortOrder,
    filterStatus,
    filterPaymentMode,
    filterIsActive,
  ]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // ──────────────────────────────────────────────────────────
  // SORT HANDLER
  // ──────────────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // ──────────────────────────────────────────────────────────
  // CLEAR FILTERS
  // ──────────────────────────────────────────────────────────
  const clearFilters = () => {
    setFilterStatus("");
    setFilterPaymentMode("");
    setFilterIsActive("");
    setPage(1);
  };

  const activeFilterCount = [
    filterStatus,
    filterPaymentMode,
    filterIsActive,
  ].filter(Boolean).length;

  // ──────────────────────────────────────────────────────────
  // CRUD ACTIONS
  // ──────────────────────────────────────────────────────────
  const handleAddFee = async (data) => {
    try {
      await feesService.create(data);
      setOpenAdd(false);
      fetchFees();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add fee record");
    }
  };

  const handleUpdateFee = async (data) => {
    try {
      await feesService.update(selectedFee._id, data);
      setOpenEdit(false);
      setSelectedFee(null);
      fetchFees();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update fee");
    }
  };

  const handleDelete = async () => {
    try {
      await feesService.softDelete(selectedFee._id);
      setOpenDelete(false);
      setSelectedFee(null);
      fetchFees();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete fee");
    }
  };

  const handleRestore = async (id) => {
    try {
      await feesService.restore(id);
      fetchFees();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to restore fee");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await feesService.toggleStatus(id);
      fetchFees();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to toggle status");
    }
  };

  return (
    <div className="space-y-5 p-1">
      {/* ── Header Card ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#101010] rounded-2xl border border-[#DBE2EF] dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20 shrink-0">
              <IndianRupee size={20} className="text-[#3F72AF]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#112D4E] dark:text-slate-100">
                Fees Records
              </h1>
              <p className="text-xs text-[#3F72AF] dark:text-slate-400 mt-0.5">
                Manage student fee payments & dues
                {totalRecords > 0 && (
                  <span className="ml-2 font-semibold">
                    · {totalRecords} total
                  </span>
                )}
              </p>
            </div>
          </div>

          {activeTab === "active" && (
            <button
              onClick={() => setOpenAdd(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-sm font-semibold transition shadow-sm shrink-0"
            >
              <Plus size={16} />
              Add Fee
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2 border-b border-[#DBE2EF] dark:border-slate-800 pb-0">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === "active"
                ? "border-[#3F72AF] text-[#3F72AF] dark:text-slate-100 dark:border-slate-100"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-[#3F72AF] dark:hover:text-slate-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("trash")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === "trash"
                ? "border-red-500 text-red-500 dark:text-red-400 dark:border-red-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
            }`}
          >
            Trash
          </button>
        </div>
      </div>

      {/* ── Search + Filters ─────────────────────────────────── */}
      <div className="bg-white dark:bg-[#101010] rounded-2xl border border-[#DBE2EF] dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex gap-3">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-[#F9F7F7] dark:bg-[#1a1a1a] focus-within:ring-2 focus-within:ring-[#3F72AF]/30 transition">
            <Search
              size={15}
              className="text-[#3F72AF] dark:text-slate-500 shrink-0"
            />
            <input
              type="text"
              placeholder="Search by student, course, status, mode..."
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
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters button */}
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

        {/* Filter panel */}
        {showFilters && (
          <div className="border-t border-[#DBE2EF] dark:border-slate-800 pt-3 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Status */}
              {activeTab === "active" && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setPage(1);
                    }}
                    className={selectCls}
                  >
                    <option value="">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              )}

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Payment Mode
                </label>
                <select
                  value={filterPaymentMode}
                  onChange={(e) => {
                    setFilterPaymentMode(e.target.value);
                    setPage(1);
                  }}
                  className={selectCls}
                >
                  <option value="">All Modes</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              {/* Is Active — only active tab */}
              {activeTab === "active" && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Active Status
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

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#101010] rounded-2xl border border-[#DBE2EF] dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading fees records...
          </div>
        ) : fees.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No fees records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF]/50 dark:bg-[#1a1a1a] border-b border-[#DBE2EF] dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 text-left">
                    <button
                      onClick={() => handleSort("student")}
                      className="flex items-center font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300"
                    >
                      Student{" "}
                      <SortArrow
                        field="student"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Course
                  </th>
                  <th className="px-5 py-3.5 text-left">
                    <button
                      onClick={() => handleSort("coursePrice")}
                      className="flex items-center font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300"
                    >
                      Total{" "}
                      <SortArrow
                        field="coursePrice"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-left">
                    <button
                      onClick={() => handleSort("amountPaid")}
                      className="flex items-center font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300"
                    >
                      Paid{" "}
                      <SortArrow
                        field="amountPaid"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-left">
                    <button
                      onClick={() => handleSort("remainingAmount")}
                      className="flex items-center font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300"
                    >
                      Due{" "}
                      <SortArrow
                        field="remainingAmount"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Due Date
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Mode
                  </th>
                  <th className="px-5 py-3.5 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300"
                    >
                      Status{" "}
                      <SortArrow
                        field="status"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
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
                {fees.map((fee) => (
                  <tr
                    key={fee._id}
                    className="hover:bg-[#F9F7F7] dark:hover:bg-[#1a1a1a] transition-colors group"
                  >
                    {/* Student */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-[#112D4E] dark:text-slate-100">
                        {fee.student?.visitor?.name || "—"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {fee.student?.visitor?.email || "—"}
                      </div>
                    </td>

                    {/* Course */}
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {fee.course?.title || "—"}
                    </td>

                    {/* Total */}
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      ₹{(fee.coursePrice || 0).toLocaleString()}
                    </td>

                    {/* Paid */}
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      ₹{(fee.amountPaid || 0).toLocaleString()}
                    </td>

                    {/* Remaining */}
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      ₹{(fee.remainingAmount || 0).toLocaleString()}
                    </td>

                    {/* Due Date */}
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {fee.dueDate
                        ? new Date(fee.dueDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Mode */}
                    <td className="px-5 py-4 capitalize text-slate-600 dark:text-slate-300">
                      {fee.paymentMode || "—"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          STATUS_STYLES[fee.status] || STATUS_STYLES.unpaid
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>

                    {/* Active */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          fee.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"
                        }`}
                      >
                        {fee.isActive ? "Yes" : "No"}
                      </span>
                    </td>

                    {/* Deleted On */}
                    {activeTab === "trash" && (
                      <td className="px-5 py-4 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {fee.deletedAt
                          ? new Date(fee.deletedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-5 py-4">
                      {activeTab === "trash" ? (
                        <button
                          onClick={() => handleRestore(fee._id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedFee(fee);
                              setOpenView(true);
                            }}
                            className="text-[#3F72AF] dark:text-slate-300 hover:text-[#112D4E] dark:hover:text-white transition"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedFee(fee);
                              setOpenEdit(true);
                            }}
                            className="text-slate-500 dark:text-slate-400 hover:text-[#112D4E] dark:hover:text-white transition"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            onClick={() => handleToggleActive(fee._id)}
                            className={`text-xs font-medium transition ${
                              fee.isActive
                                ? "text-amber-600 dark:text-amber-400 hover:text-amber-700"
                                : "text-green-600 dark:text-green-400 hover:text-green-700"
                            }`}
                            title={fee.isActive ? "Deactivate" : "Activate"}
                          >
                            {fee.isActive ? "Disable" : "Enable"}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedFee(fee);
                              setOpenDelete(true);
                            }}
                            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition"
                            title="Move to Trash"
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

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Modals */}
      <AddFeesModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddFee}
      />

      <EditFeesModal
        open={openEdit}
        fees={selectedFee}
        onClose={() => {
          setOpenEdit(false);
          setSelectedFee(null);
        }}
        onSubmit={handleUpdateFee}
      />

      <ViewFeesModal
        open={openView}
        fees={selectedFee}
        onClose={() => {
          setOpenView(false);
          setSelectedFee(null);
        }}
      />

      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedFee(null);
        }}
        onConfirm={handleDelete}
        title={selectedFee?.student?.visitor?.name || "this record"}
      />
    </div>
  );
};

export default AdminFees;
