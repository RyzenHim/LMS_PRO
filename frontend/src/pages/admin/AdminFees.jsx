import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  IndianRupee,
} from "lucide-react";

import { feesService } from "../../services/feesService";

import AddFeesModal from "./modal/fees/AddFeesModal";
import EditFeesModal from "./modal/fees/EditFeesModal";
import ViewFeesModal from "./modal/fees/ViewFeesModal";
import ConfirmDeleteModal from "./modal/fees/ConfirmDeleteModal";
import Pagination from "../../components/Pagination";
import SortHeader from "../../components/SortHeader";

const AdminFees = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [fees, setFees] = useState([]);
  const [deletedFees, setDeletedFees] = useState([]);
  const [page, setPage] = useState(1);
  const [trashPage, setTrashPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [trashTotalPages, setTrashTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filters, setFilters] = useState({});
  const [filterField, setFilterField] = useState("status");
  const [filterValue, setFilterValue] = useState("");

  const [activeTab, setActiveTab] = useState("active");

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedFees, setSelectedFees] = useState(null);

  useEffect(() => {
    fetchFees();
  }, [page, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchDeletedFees();
  }, [trashPage, search, sortBy, sortOrder, activeTab]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await feesService.getAll({
        page,
        limit: 10,
        search,
        sortBy,
        sortOrder,
        ...filters,
      });
      setFees(res.data.fees || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching fees", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedFees = async () => {
    try {
      const res = await feesService.getDeleted({
        page: trashPage,
        limit: 10,
        search,
        sortBy,
        sortOrder,
        ...filters,
      });
      setDeletedFees(res.data.fees || []);
      setTrashTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching deleted fees", error);
    }
  };

  const handleAddFees = async (data) => {
    try {
      const res = await feesService.create(data);
      setFees((prev) => [res.data.fees, ...prev]);
      setOpenAdd(false);
    } catch (error) {
      console.error("Add fees failed", error);
      alert(error.response?.data?.message || "Failed to add fees");
    }
  };

  const handleEdit = (item) => {
    setSelectedFees(item);
    setOpenEdit(true);
  };

  const handleUpdateFees = async (data) => {
    try {
      const res = await feesService.update(selectedFees._id, data);

      setFees((prev) =>
        prev.map((f) => (f._id === selectedFees._id ? res.data.fees : f)),
      );

      setOpenEdit(false);
      setSelectedFees(null);
    } catch (error) {
      console.error("Update failed", error);
      alert(error.response?.data?.message || "Failed to update fees");
    }
  };

  const handleView = (item) => {
    setSelectedFees(item);
    setOpenView(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedFees(item);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await feesService.softDelete(selectedFees._id);
      setFees((prev) => prev.filter((f) => f._id !== selectedFees._id));
      fetchDeletedFees();
      setOpenDelete(false);
      setSelectedFees(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert(error.response?.data?.message || "Failed to delete fees");
    }
  };

  const handleRestore = async (id) => {
    try {
      await feesService.restore(id);
      setDeletedFees((prev) => prev.filter((f) => f._id !== id));
      fetchFees();
    } catch (error) {
      console.error("Restore failed", error);
      alert(error.response?.data?.message || "Failed to restore fees");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await feesService.toggleStatus(id);

      setFees((prev) =>
        prev.map((f) =>
          f._id === id ? { ...f, isActive: res.data.isActive } : f,
        ),
      );
    } catch (error) {
      console.error("Toggle status failed", error);
      alert(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const filteredFees = useMemo(() => {
    return activeTab === "active" ? fees : deletedFees;
  }, [fees, deletedFees, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Fees
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            Manage student fees and due payments
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3F72AF] text-white hover:bg-[#112D4E] dark:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] transition-colors shadow-md"
          >
            <Plus size={18} />
            Add Fees
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-2 px-2 transition-colors ${
            activeTab === "active"
              ? "border-b-2 border-[#3F72AF] font-medium text-[#3F72AF] dark:text-[#DBE2EF] dark:border-[#DBE2EF]"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          Active ({fees.length})
        </button>

        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-2 px-2 transition-colors ${
            activeTab === "trash"
              ? "border-b-2 border-red-600 font-medium text-red-600 dark:text-red-400 dark:border-red-400"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          Trash ({deletedFees.length})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 flex items-center gap-3 shadow-sm">
        <Search size={18} className="text-[#3F72AF] dark:text-[#DBE2EF]" />
        <input
          type="text"
          placeholder="Search fees by student, course, status..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
            setTrashPage(1);
          }}
          className="w-full outline-none text-sm bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        />
      </div>

      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <select
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="text-sm border rounded-lg px-2 py-1 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        >
          <option value="status">Status</option>
          <option value="paymentMode">Payment Mode</option>
          <option value="paymentType">Payment Type</option>
          <option value="isActive">Is Active</option>
        </select>
        <input
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          placeholder="Filter value"
          className="text-sm border rounded-lg px-2 py-1 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        />
        <button
          onClick={addFilter}
          className="px-3 py-1 rounded-lg bg-[#3F72AF] text-white text-sm"
        >
          Add Filter
        </button>
        <button
          onClick={clearFilters}
          className="px-3 py-1 rounded-lg border text-sm"
        >
          Clear Filters
        </button>
        <div className="flex flex-wrap gap-2">
          {Object.keys(filters).map((key) => (
            <button
              key={key}
              onClick={() => removeFilter(key)}
              className="px-2 py-1 text-xs rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a]"
            >
              {key}: {String(filters[key])} ×
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading fees...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF] border-b border-[#DBE2EF] dark:border-[#3F72AF]">
                <tr>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    <SortHeader
                      label="Student"
                      field="student"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    <SortHeader
                      label="Total"
                      field="coursePrice"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    <SortHeader
                      label="Paid"
                      field="amountPaid"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    <SortHeader
                      label="Remaining"
                      field="remainingAmount"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    <SortHeader
                      label="Due Date"
                      field="dueDate"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Is Active
                  </th>
                  <th className="px-6 py-3 text-right text-[#112D4E] dark:text-[#DBE2EF]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredFees.map((f) => (
                  <tr
                    key={f._id}
                    className="border-b border-[#DBE2EF] dark:border-[#3F72AF] last:border-none hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                      {f.student?.name || "—"}
                      <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                        {f.student?.email || "—"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {f.course?.title || "—"}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      ₹{f.coursePrice || f.course?.price || 0}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      ₹{f.amountPaid || 0}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      ₹{f.remainingAmount || 0}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {f.dueDate
                        ? new Date(f.dueDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF] capitalize">
                      {f.paymentMode || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-md capitalize ${
                          f.status === "paid"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : f.status === "partial"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-md ${
                          f.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {f.isActive ? "Yes" : "No"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => handleView(f)}
                            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white text-sm transition-colors"
                            title="View"
                          >
                            <Eye size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => handleEdit(f)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(f._id)}
                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 text-sm transition-colors"
                            title="Toggle Status"
                          >
                            {f.isActive ? "Disable" : "Enable"}
                          </button>

                          <button
                            onClick={() => handleDeleteClick(f)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="inline" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(f._id)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm flex items-center gap-1 transition-colors"
                          title="Restore"
                        >
                          <RotateCcw size={16} />
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredFees.length === 0 && (
          <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF] text-sm">
            No fees found
          </div>
        )}
      </div>

      <Pagination
        page={activeTab === "active" ? page : trashPage}
        totalPages={activeTab === "active" ? totalPages : trashTotalPages}
        onPageChange={(p) =>
          activeTab === "active" ? setPage(p) : setTrashPage(p)
        }
      />

      <AddFeesModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddFees}
      />

      <EditFeesModal
        open={openEdit}
        fees={selectedFees}
        onClose={() => {
          setOpenEdit(false);
          setSelectedFees(null);
        }}
        onSubmit={handleUpdateFees}
      />

      <ViewFeesModal
        open={openView}
        fees={selectedFees}
        onClose={() => {
          setOpenView(false);
          setSelectedFees(null);
        }}
      />

      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedFees(null);
        }}
        onConfirm={handleDelete}
        title={selectedFees?.student?.name}
      />
    </div>
  );
};

export default AdminFees;
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
    setTrashPage(1);
  };

  const addFilter = () => {
    if (!filterField || !filterValue) return;
    setFilters((prev) => ({ ...prev, [filterField]: filterValue }));
    setFilterValue("");
    setPage(1);
    setTrashPage(1);
  };

  const removeFilter = (field) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setPage(1);
    setTrashPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
    setTrashPage(1);
  };
