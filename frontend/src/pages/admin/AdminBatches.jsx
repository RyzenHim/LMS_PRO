import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Users,
  UserCog,
} from "lucide-react";

import { batchService } from "../../services/batchService";

import AddBatchModal from "./modal/batch/AddBatchModal";
import EditBatchModal from "./modal/batch/EditBatchModal";
import ViewBatchModal from "./modal/batch/ViewBatchModal";
import ConfirmDeleteModal from "./modal/batch/ConfirmDeleteModal";
import ManageBatchStudentsModal from "./modal/ManageBatchStudentsModal";

import Pagination from "../../components/Pagination";
import SortHeader from "../../components/SortHeader";

const AdminBatches = () => {
  const [search, setSearch] = useState("");

  const [loadingActive, setLoadingActive] = useState(false);
  const [loadingTrash, setLoadingTrash] = useState(false);

  const [batches, setBatches] = useState([]);
  const [deletedBatches, setDeletedBatches] = useState([]);

  const [page, setPage] = useState(1);
  const [trashPage, setTrashPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [trashTotalPages, setTrashTotalPages] = useState(1);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const filters = {};
  const [activeTab, setActiveTab] = useState("active");

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openManageStudents, setOpenManageStudents] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState(null);

  // ✅ stable dependency key for filters
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  // ==========================
  // Sort
  // ==========================
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

  // ==========================
  // Fetch Active
  // ==========================
  const fetchBatches = useCallback(async () => {
    try {
      setLoadingActive(true);

      const res = await batchService.getAll({
        page,
        limit: 10,
        search,
        sortBy,
        sortOrder,
        ...filters,
      });

      setBatches(res.data?.batches || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching batches", error);
    } finally {
      setLoadingActive(false);
    }
  }, [page, search, sortBy, sortOrder, filtersKey]);

  // ==========================
  // Fetch Trash
  // ==========================
  const fetchDeletedBatches = useCallback(async () => {
    try {
      setLoadingTrash(true);

      const res = await batchService.getDeleted({
        page: trashPage,
        limit: 10,
        search,
        sortBy,
        sortOrder,
        ...filters,
      });

      setDeletedBatches(res.data?.batches || []);
      setTrashTotalPages(res.data?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching deleted batches", error);
    } finally {
      setLoadingTrash(false);
    }
  }, [trashPage, search, sortBy, sortOrder, filtersKey]);

  // ==========================
  // Effects
  // ==========================
  useEffect(() => {
    if (activeTab === "active") fetchBatches();
  }, [activeTab, fetchBatches]);

  useEffect(() => {
    if (activeTab === "trash") fetchDeletedBatches();
  }, [activeTab, fetchDeletedBatches]);

  useEffect(() => {
    setPage(1);
    setTrashPage(1);
  }, [activeTab]);

  // ==========================
  // CRUD
  // ==========================
  const handleAddBatch = async (data) => {
    try {
      await batchService.create(data);
      await fetchBatches();
      setOpenAdd(false);
    } catch (error) {
      console.error("Add batch failed", error);
      alert(error.response?.data?.message || "Failed to add batch");
    }
  };

  const handleEdit = (batch) => {
    setSelectedBatch(batch);
    setOpenEdit(true);
  };

  const handleUpdateBatch = async (data) => {
    try {
      if (!selectedBatch?._id) return;

      await batchService.update(selectedBatch._id, data);
      await fetchBatches();

      setOpenEdit(false);
      setSelectedBatch(null);
    } catch (error) {
      console.error("Update failed", error);
      alert(error.response?.data?.message || "Failed to update batch");
    }
  };

  const handleView = (batch) => {
    setSelectedBatch(batch);
    setOpenView(true);
  };

  const handleDeleteClick = (batch) => {
    setSelectedBatch(batch);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      if (!selectedBatch?._id) return;

      await batchService.softDelete(selectedBatch._id);

      setBatches((prev) => prev.filter((b) => b._id !== selectedBatch._id));

      await fetchDeletedBatches();

      setOpenDelete(false);
      setSelectedBatch(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert(error.response?.data?.message || "Failed to delete batch");
    }
  };

  const handleRestore = async (id) => {
    try {
      if (!id) return;

      await batchService.restore(id);

      setDeletedBatches((prev) => prev.filter((b) => b._id !== id));

      await fetchBatches();
    } catch (error) {
      console.error("Restore failed", error);
      alert(error.response?.data?.message || "Failed to restore batch");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      if (!id) return;

      const res = await batchService.toggleStatus(id);

      setBatches((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, isActive: res.data?.isActive } : b,
        ),
      );
    } catch (error) {
      console.error("Toggle status failed", error);
      alert(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const filteredBatches = activeTab === "active" ? batches : deletedBatches;
  const loading = activeTab === "active" ? loadingActive : loadingTrash;

  const getRoomLabel = (batch) => {
    const room =
      batch?.room ||
      batch?.roomUnit ||
      batch?.assignedRoom ||
      batch?.roomId ||
      batch?.roomID;

    if (!room) return "—";

    if (typeof room === "string") return "Assigned";

    const parts = [
      room?.location,
      room?.buildingName,
      room?.floorNumber ? `Floor ${room.floorNumber}` : null,
      room?.roomNumber,
      room?.name,
      room?.roomName,
    ].filter(Boolean);

    return parts.length ? parts.join(" • ") : "Assigned";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black/90 dark:text-white">
            Batches
          </h1>
          <p className="text-sm text-black/50 dark:text-white/50">
            Manage all LMS batches (with rooms)
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => setOpenAdd(true)}
            className="
              inline-flex items-center gap-2
              rounded-2xl bg-black px-5 py-2.5
              text-sm font-semibold text-white
              hover:bg-black/80 transition
              dark:bg-white dark:text-black dark:hover:bg-white/80
            "
          >
            <Plus size={18} />
            Add Batch
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("active")}
          className={`
            rounded-2xl px-4 py-2 text-sm font-semibold transition
            ${
              activeTab === "active"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-black/[0.04] text-black/60 hover:bg-black/[0.07] dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
            }
          `}
        >
          Active
        </button>

        <button
          onClick={() => setActiveTab("trash")}
          className={`
            rounded-2xl px-4 py-2 text-sm font-semibold transition
            ${
              activeTab === "trash"
                ? "bg-red-600 text-white"
                : "bg-black/[0.04] text-black/60 hover:bg-black/[0.07] dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
            }
          `}
        >
          Trash
        </button>
      </div>

      {/* Search */}
      <div
        className="
          rounded-2xl border border-black/10 dark:border-white/10
          bg-white/80 dark:bg-[#141414]/70
          backdrop-blur-xl
          p-4 shadow-sm
          flex items-center gap-3
        "
      >
        <Search size={18} className="text-black/50 dark:text-white/50" />
        <input
          type="text"
          placeholder="Search batches..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
            setTrashPage(1);
          }}
          className="
            w-full bg-transparent outline-none text-sm
            text-black/80 dark:text-white
            placeholder:text-black/40 dark:placeholder:text-white/30
          "
        />
      </div>

      {/* Table */}
      <div
        className="
          overflow-hidden rounded-2xl border border-black/10 dark:border-white/10
          bg-white dark:bg-[#101010]
          shadow-sm
        "
      >
        {loading ? (
          <div className="p-10 text-center text-black/50 dark:text-white/50">
            Loading batches...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/[0.03] dark:bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-black/70 dark:text-white/70">
                    <SortHeader
                      label="Batch"
                      field="name"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>

                  <th className="px-6 py-4 text-left font-semibold text-black/70 dark:text-white/70">
                    Course
                  </th>

                  <th className="px-6 py-4 text-left font-semibold text-black/70 dark:text-white/70">
                    Tutor
                  </th>

                  <th className="px-6 py-4 text-left font-semibold text-black/70 dark:text-white/70">
                    Room
                  </th>

                  <th className="px-6 py-4 text-left font-semibold text-black/70 dark:text-white/70">
                    <SortHeader
                      label="Start Date"
                      field="startDate"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>

                  <th className="px-6 py-4 text-left font-semibold text-black/70 dark:text-white/70">
                    Students
                  </th>

                  <th className="px-6 py-4 text-left font-semibold text-black/70 dark:text-white/70">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left font-semibold text-black/70 dark:text-white/70">
                    Is Active
                  </th>

                  <th className="px-6 py-4 text-right font-semibold text-black/70 dark:text-white/70">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredBatches.map((batch) => (
                  <tr
                    key={batch._id}
                    className="
                      border-t border-black/5 dark:border-white/10
                      hover:bg-black/[0.02] dark:hover:bg-white/[0.03]
                      transition
                    "
                  >
                    <td className="px-6 py-4 font-semibold text-black/80 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Users
                          size={16}
                          className="text-black/40 dark:text-white/40"
                        />
                        {batch?.name || "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-black/60 dark:text-white/60">
                      {batch?.course?.title || "—"}
                    </td>

                    <td className="px-6 py-4 text-black/60 dark:text-white/60">
                      {batch?.tutor?.name || "—"}
                    </td>

                    <td className="px-6 py-4 text-black/60 dark:text-white/60">
                      {getRoomLabel(batch)}
                    </td>

                    <td className="px-6 py-4 text-black/60 dark:text-white/60">
                      {batch?.startDate
                        ? new Date(batch.startDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4 text-black/60 dark:text-white/60">
                      {batch?.studentsCount ?? 0}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`
                          inline-flex items-center rounded-2xl px-3 py-1 text-xs font-semibold capitalize
                          ${
                            batch?.status === "running"
                              ? "bg-green-500/10 text-green-700 dark:text-green-300"
                              : batch?.status === "completed"
                                ? "bg-white/10 text-black/70 dark:text-white/70"
                                : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
                          }
                        `}
                      >
                        {batch?.status || "upcoming"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`
                          inline-flex items-center rounded-2xl px-3 py-1 text-xs font-semibold
                          ${
                            batch?.isActive
                              ? "bg-green-500/10 text-green-700 dark:text-green-300"
                              : "bg-red-500/10 text-red-700 dark:text-red-300"
                          }
                        `}
                      >
                        {batch?.isActive ? "Yes" : "No"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {activeTab === "active" ? (
                          <>
                            <button
                              onClick={() => handleView(batch)}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-black/[0.03] dark:hover:bg-white/10 transition"
                              title="View"
                            >
                              <Eye
                                size={16}
                                className="text-black/70 dark:text-white/70"
                              />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedBatch(batch);
                                setOpenManageStudents(true);
                              }}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-black/[0.03] dark:hover:bg-white/10 transition"
                              title="Manage Students"
                            >
                              <UserCog
                                size={16}
                                className="text-black/70 dark:text-white/70"
                              />
                            </button>

                            {/* <button
                              onClick={() => handleOpenAssignRoom(batch)}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-black/[0.03] dark:hover:bg-white/10 transition"
                              title="Assign Room"
                            >
                              <Building2
                                size={16}
                                className="text-black/70 dark:text-white/70"
                              />
                            </button> */}

                            <button
                              onClick={() => handleEdit(batch)}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-black/[0.03] dark:hover:bg-white/10 transition"
                              title="Edit"
                            >
                              <Edit
                                size={16}
                                className="text-black/70 dark:text-white/70"
                              />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(batch._id)}
                              className="rounded-2xl px-3 py-2 text-xs font-semibold bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 transition"
                              title="Toggle Active"
                            >
                              {batch?.isActive ? "Disable" : "Enable"}
                            </button>

                            <button
                              onClick={() => handleDeleteClick(batch)}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-2xl bg-red-600 hover:bg-red-700 transition"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-white" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(batch._id)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition"
                            title="Restore"
                          >
                            <RotateCcw size={16} />
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredBatches.length === 0 && (
          <div className="p-10 text-center text-black/50 dark:text-white/50 text-sm">
            No batches found
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

      {/* Modals */}
      <AddBatchModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddBatch}
      />

      <EditBatchModal
        open={openEdit}
        batch={selectedBatch}
        onClose={() => {
          setOpenEdit(false);
          setSelectedBatch(null);
        }}
        onSubmit={handleUpdateBatch}
      />

      <ViewBatchModal
        open={openView}
        batch={selectedBatch}
        onClose={() => {
          setOpenView(false);
          setSelectedBatch(null);
        }}
      />

      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedBatch(null);
        }}
        onConfirm={handleDelete}
        title={selectedBatch?.name}
      />

      <ManageBatchStudentsModal
        open={openManageStudents}
        batch={selectedBatch}
        onClose={async () => {
          setOpenManageStudents(false);
          setSelectedBatch(null);

          if (activeTab === "active") await fetchBatches();
        }}
      />

      {/* <AssignBatchRoomModal
        open={openAssignRoom}
        batch={selectedBatch}
        onClose={() => {
          setOpenAssignRoom(false);
          setSelectedBatch(null);
        }}
        onAssigned={handleRoomAssigned}
      /> */}
    </div>
  );
};

export default AdminBatches;
