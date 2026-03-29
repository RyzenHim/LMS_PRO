import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  IndianRupee,
  Filter,
  Wallet,
  ReceiptText,
} from "lucide-react";

import { feesService } from "../../services/feesService";
import AddFeesModal from "./modal/fees/AddFeesModal";
import EditFeesModal from "./modal/fees/EditFeesModal";
import ViewFeesModal from "./modal/fees/ViewFeesModal";
import ConfirmDeleteModal from "./modal/fees/ConfirmDeleteModal";
import Pagination from "../../components/Pagination";
import PageLoader from "../../components/ui/PageLoader";

const STATUS_STYLES = {
  paid: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  unpaid: "bg-rose-100 text-rose-700",
};

const AdminFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPaymentMode, setFilterPaymentMode] = useState("");
  const [filterIsActive, setFilterIsActive] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search, sortBy, sortOrder };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

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
    <div className="lms-page-enter space-y-6">
      <section className="neu-panel lms-card-hover lms-sheen rounded-[34px] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--lms-accent-soft)]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lms-accent-strong)]">
              <Wallet size={14} />
              Finance Desk
            </div>
            <h1 className="text-3xl font-semibold text-[var(--lms-text)]">
              Fees Records
            </h1>
            <p className="max-w-2xl text-sm text-[var(--lms-text-soft)]">
              Review student payments, dues, and collection states with a more
              tactile, calmer administrative workspace.
            </p>
          </div>

          {activeTab === "active" ? (
            <button
              onClick={() => setOpenAdd(true)}
              className="neu-button neu-button-primary rounded-[24px] px-5 py-3 text-sm font-semibold"
            >
              <Plus size={16} />
              Add Fee
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "Total Records", value: totalRecords, icon: ReceiptText },
            { label: "Visible Rows", value: fees.length, icon: IndianRupee },
            { label: "Active Filters", value: activeFilterCount, icon: Filter },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="neu-panel-soft rounded-[28px] p-4">
                <div className="flex items-center gap-3">
                  <div className="neu-inset flex h-12 w-12 items-center justify-center rounded-[18px]">
                    <Icon size={18} className="text-[var(--lms-accent-strong)]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-[var(--lms-text)]">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="neu-panel rounded-[32px] p-4">
        <div className="flex flex-wrap gap-3">
          {[
            { key: "active", label: "Active" },
            { key: "trash", label: "Trash" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-[22px] px-4 py-2.5 text-sm font-semibold ${
                activeTab === tab.key
                  ? tab.key === "trash"
                    ? "neu-button-danger"
                    : "neu-button neu-button-primary"
                  : "neu-button"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="neu-panel rounded-[32px] p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="neu-inset flex flex-1 items-center gap-3 rounded-[24px] px-4 py-3">
            <Search className="text-[var(--lms-accent-strong)]/70" size={16} />
            <input
              type="text"
              placeholder="Search by student, course, status, mode..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-sm text-[var(--lms-text)] outline-none placeholder:text-[var(--lms-text-soft)]"
            />
          </div>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`rounded-[22px] px-4 py-3 text-sm font-semibold ${
              showFilters || activeFilterCount > 0
                ? "neu-button neu-button-primary"
                : "neu-button"
            }`}
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
        </div>

        {showFilters ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {activeTab === "active" ? (
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="neu-input rounded-[20px] px-4 py-3 text-sm"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
            ) : (
              <div className="neu-inset rounded-[20px] px-4 py-3 text-sm text-[var(--lms-text-soft)]">
                Trash records ignore active status toggles.
              </div>
            )}

            <select
              value={filterPaymentMode}
              onChange={(e) => {
                setFilterPaymentMode(e.target.value);
                setPage(1);
              }}
              className="neu-input rounded-[20px] px-4 py-3 text-sm"
            >
              <option value="">All Modes</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
            </select>

            {activeTab === "active" ? (
              <select
                value={filterIsActive}
                onChange={(e) => {
                  setFilterIsActive(e.target.value);
                  setPage(1);
                }}
                className="neu-input rounded-[20px] px-4 py-3 text-sm"
              >
                <option value="">All Activity</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            ) : null}

            {activeFilterCount > 0 ? (
              <button
                onClick={clearFilters}
                className="neu-button rounded-[20px] px-4 py-3 text-sm font-semibold md:col-span-3"
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="neu-panel rounded-[34px] p-4">
        {loading ? (
          <PageLoader label="Loading" detail="Refreshing fee records" compact />
        ) : fees.length === 0 ? (
          <div className="neu-inset rounded-[28px] px-6 py-12 text-center">
            <p className="text-base font-medium text-[var(--lms-text)]">
              No fees records found
            </p>
            <p className="mt-2 text-sm text-[var(--lms-text-soft)]">
              Add a payment entry or switch tabs to inspect archived records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="neu-table min-w-full text-sm">
              <thead>
                <tr>
                  {[
                    ["Student", "student"],
                    ["Course", null],
                    ["Total", "coursePrice"],
                    ["Paid", "amountPaid"],
                    ["Due", "remainingAmount"],
                    ["Due Date", null],
                    ["Mode", null],
                    ["Status", "status"],
                    ["Active", null],
                  ].map(([label, field]) => (
                    <th key={label} className="px-5 py-4 text-left">
                      {field ? (
                        <button
                          onClick={() => handleSort(field)}
                          className="inline-flex items-center gap-2 font-semibold text-[var(--lms-text)]"
                        >
                          {label}
                          <span className="text-xs text-[var(--lms-text-soft)]">
                            {sortBy === field
                              ? sortOrder === "asc"
                                ? "↑"
                                : "↓"
                              : "↕"}
                          </span>
                        </button>
                      ) : (
                        <span className="font-semibold text-[var(--lms-text)]">
                          {label}
                        </span>
                      )}
                    </th>
                  ))}
                  {activeTab === "trash" ? (
                    <th className="px-5 py-4 text-left">Deleted On</th>
                  ) : null}
                  <th className="px-5 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee._id}>
                    <td className="px-5 py-4">
                      <div className="font-medium text-[var(--lms-text)]">
                        {fee.student?.visitor?.name || "-"}
                      </div>
                      <div className="text-xs text-[var(--lms-text-soft)]">
                        {fee.student?.visitor?.email || "-"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[var(--lms-text)]">
                      {fee.course?.title || "-"}
                    </td>
                    <td className="px-5 py-4 font-medium text-[var(--lms-text)]">
                      Rs {(fee.coursePrice || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4 font-medium text-[var(--lms-text)]">
                      Rs {(fee.amountPaid || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4 font-medium text-[var(--lms-text)]">
                      Rs {(fee.remainingAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4 text-[var(--lms-text-soft)]">
                      {fee.dueDate
                        ? new Date(fee.dueDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-5 py-4 capitalize text-[var(--lms-text-soft)]">
                      {fee.paymentMode || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                          STATUS_STYLES[fee.status] || STATUS_STYLES.unpaid
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                          fee.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {fee.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    {activeTab === "trash" ? (
                      <td className="px-5 py-4 text-xs text-[var(--lms-text-soft)]">
                        {fee.deletedAt
                          ? new Date(fee.deletedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>
                    ) : null}
                    <td className="px-5 py-4">
                      {activeTab === "trash" ? (
                        <button
                          onClick={() => handleRestore(fee._id)}
                          className="neu-button rounded-[16px] px-4 py-2 text-sm font-semibold text-emerald-700"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedFee(fee);
                              setOpenView(true);
                            }}
                            className="neu-button h-10 w-10 rounded-[16px]"
                          >
                            <Eye size={15} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFee(fee);
                              setOpenEdit(true);
                            }}
                            className="neu-button h-10 w-10 rounded-[16px]"
                          >
                            <Edit size={15} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(fee._id)}
                            className="neu-button rounded-[16px] px-3 py-2 text-xs font-semibold"
                          >
                            {fee.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFee(fee);
                              setOpenDelete(true);
                            }}
                            className="neu-button-danger rounded-[16px] px-3 py-2 text-xs font-semibold"
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
      </section>

      {!loading && totalPages > 1 ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}

      <AddFeesModal open={openAdd} onClose={() => setOpenAdd(false)} onSubmit={handleAddFee} />
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
