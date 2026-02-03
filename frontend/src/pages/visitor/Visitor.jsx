import { useEffect, useState } from "react";
import { Search, Plus, Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import AddVisitorModal from "./modal/AddVisitorModal";
import EditVisitorModal from "./modal/EditVisitorModal";
import ViewVisitorModal from "./modal/ViewVisitorModal";
import ConfirmDeleteModal from "../admin/modal/ConfirmDeleteModal";
import axiosInstance from "../../api/axios";

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [deletedVisitors, setDeletedVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editVisitor, setEditVisitor] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewVisitor, setViewVisitor] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteVisitor, setDeleteVisitor] = useState(null);

  /* ---------------- FETCH VISITORS ---------------- */
  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/visitor/allvisitor");
      setVisitors(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setError("Failed to load visitors");
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedVisitors = async () => {
    try {
      const res = await axiosInstance.get("/visitor/trash/list");
      setDeletedVisitors(Array.isArray(res?.data) ? res.data : []);
    } catch {
      console.error("Failed to load deleted visitors");
    }
  };

  useEffect(() => {
    fetchVisitors();
    fetchDeletedVisitors();
  }, []);

  /* ---------------- SOFT DELETE ---------------- */
  const handleDeleteClick = (visitor) => {
    setDeleteVisitor(visitor);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/visitor/${deleteVisitor._id}`);
      setVisitors((prev) => prev.filter((v) => v._id !== deleteVisitor._id));
      fetchDeletedVisitors();
      setOpenDeleteModal(false);
      setDeleteVisitor(null);
    } catch {
      alert("Failed to delete visitor");
    }
  };

  /* ---------------- RESTORE ---------------- */
  const handleRestore = async (id) => {
    try {
      await axiosInstance.patch(`/visitor/${id}/restore`);
      setDeletedVisitors((prev) => prev.filter((v) => v._id !== id));
      fetchVisitors();
    } catch {
      alert("Failed to recover visitor");
    }
  };

  /* ---------------- VIEW ---------------- */
  const handleView = (visitor) => {
    setViewVisitor(visitor);
    setOpenViewModal(true);
  };

  /* ---------------- FILTERED DATA ---------------- */
  const activeVisitors = visitors.filter((v) => !v.isDeleted);
  const filteredVisitors =
    activeTab === "active"
      ? activeVisitors.filter(
          (v) =>
            v.name?.toLowerCase().includes(search.toLowerCase()) ||
            v.email?.toLowerCase().includes(search.toLowerCase()) ||
            v.phone?.toString().includes(search) ||
            v.course?.toLowerCase().includes(search.toLowerCase())
        )
      : deletedVisitors.filter(
          (v) =>
            v.name?.toLowerCase().includes(search.toLowerCase()) ||
            v.email?.toLowerCase().includes(search.toLowerCase())
        );

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Loading visitors...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Visitors
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage visitor leads
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Visitor
          </button>
        )}
      </div>

      {/* ---------- TABS ---------- */}
      <div className="flex gap-4 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-2 px-2 ${
            activeTab === "active"
              ? "border-b-2 border-blue-600 font-medium text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Active ({activeVisitors.length})
        </button>

        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-2 px-2 ${
            activeTab === "trash"
              ? "border-b-2 border-red-600 font-medium text-red-600 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Trash ({deletedVisitors.length})
        </button>
      </div>

      {/* ---------- SEARCH ---------- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <Search className="text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search visitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* ---------- TABLE ---------- */}
      {filteredVisitors.length === 0 ? (
        <div className="border dark:border-gray-700 rounded-lg p-10 text-center text-gray-500 dark:text-gray-400">
          No visitors found.
        </div>
      ) : (
        <div className="overflow-x-auto border dark:border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="border dark:border-gray-600 p-3 text-left text-gray-700 dark:text-gray-300">
                  Name
                </th>
                <th className="border dark:border-gray-600 p-3 text-left text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="border dark:border-gray-600 p-3 text-left text-gray-700 dark:text-gray-300">
                  Phone
                </th>
                <th className="border dark:border-gray-600 p-3 text-left text-gray-700 dark:text-gray-300">
                  Course
                </th>
                <th className="border dark:border-gray-600 p-3 text-left text-gray-700 dark:text-gray-300">
                  Source
                </th>
                <th className="border dark:border-gray-600 p-3 text-left text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="border dark:border-gray-600 p-3 text-left text-gray-700 dark:text-gray-300">
                  Created
                </th>
                <th className="border dark:border-gray-600 p-3 text-left text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map((v) => (
                <tr
                  key={v._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="border dark:border-gray-700 p-3 dark:text-white">
                    {v.name}
                  </td>
                  <td className="border dark:border-gray-700 p-3 dark:text-gray-300">
                    {v.email || "—"}
                  </td>
                  <td className="border dark:border-gray-700 p-3 dark:text-gray-300">
                    {v.phone || "—"}
                  </td>
                  <td className="border dark:border-gray-700 p-3 dark:text-gray-300">
                    {v.course || "—"}
                  </td>
                  <td className="border dark:border-gray-700 p-3 capitalize dark:text-gray-300">
                    {v.source || "—"}
                  </td>
                  <td className="border dark:border-gray-700 p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-md capitalize ${
                        v.status === "converted"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : v.status === "contacted"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {v.status || "new"}
                    </span>
                  </td>
                  <td className="border dark:border-gray-700 p-3 dark:text-gray-300">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </td>

                  <td className="border dark:border-gray-700 p-3 space-x-2">
                    {activeTab === "active" ? (
                      <>
                        <button
                          onClick={() => handleView(v)}
                          className="text-indigo-600 hover:underline text-sm dark:text-indigo-400"
                          title="View"
                        >
                          <Eye size={16} className="inline" />
                        </button>
                        <button
                          onClick={() => {
                            setEditVisitor(v);
                            setOpenEditModal(true);
                          }}
                          className="text-blue-600 hover:underline text-sm dark:text-blue-400"
                          title="Edit"
                        >
                          <Edit size={16} className="inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(v)}
                          className="text-red-600 hover:underline text-sm dark:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={16} className="inline" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestore(v._id)}
                        className="text-green-600 hover:underline text-sm dark:text-green-400 flex items-center gap-1"
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

      {/* ---------- MODALS ---------- */}
      <AddVisitorModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={(visitor) => {
          setVisitors((prev) => [visitor, ...prev]);
          setOpenModal(false);
        }}
      />

      <EditVisitorModal
        open={openEditModal}
        visitor={editVisitor}
        onClose={() => {
          setOpenEditModal(false);
          setEditVisitor(null);
        }}
        onSuccess={(updatedVisitor) => {
          setVisitors((prev) =>
            prev.map((v) =>
              v._id === updatedVisitor._id ? updatedVisitor : v
            )
          );
          setOpenEditModal(false);
          setEditVisitor(null);
        }}
      />

      <ViewVisitorModal
        open={openViewModal}
        visitor={viewVisitor}
        onClose={() => {
          setOpenViewModal(false);
          setViewVisitor(null);
        }}
      />

      <ConfirmDeleteModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setDeleteVisitor(null);
        }}
        onConfirm={handleDelete}
        title={deleteVisitor?.name}
      />
    </div>
  );
};

export default Visitors;
