import { useEffect, useState } from "react";
import AddVisitorModal from "./modal/AddVisitorModal";
import EditVisitorModal from "./modal/EditVisitorModal";
import axiosInstance from "../../api/axios";

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("active"); // active | trash

  const [openModal, setOpenModal] = useState(false);
  const [editVisitor, setEditVisitor] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  /* ---------------- FETCH VISITORS ---------------- */
  const fetchVisitors = async () => {
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

  useEffect(() => {
    fetchVisitors();
  }, []);

  /* ---------------- SOFT DELETE ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Move visitor to trash?")) return;

    try {
      await axiosInstance.delete(`/visitor/${id}`);
      setVisitors((prev) =>
        prev.map((v) => (v._id === id ? { ...v, isDeleted: true } : v)),
      );
    } catch {
      alert("Failed to delete visitor");
    }
  };

  /* ---------------- RESTORE ---------------- */
  const handleRestore = async (id) => {
    if (!window.confirm("Recover this visitor?")) return;

    try {
      const res = await axiosInstance.patch(`/visitor/${id}/restore`);
      setVisitors((prev) => prev.map((v) => (v._id === id ? res.data : v)));
    } catch {
      alert("Failed to recover visitor");
    }
  };

  /* ---------------- FILTERED DATA ---------------- */
  const activeVisitors = visitors.filter((v) => !v.isDeleted);
  const deletedVisitors = visitors.filter((v) => v.isDeleted);

  /* ---------------- UI ---------------- */
  if (loading) {
    return <p className="p-6">Loading visitors...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Visitors</h1>
          <p className="text-gray-500 text-sm">Manage visitor leads</p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => setOpenModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Visitor
          </button>
        )}
      </div>

      {/* ---------- TABS ---------- */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-2 ${
            activeTab === "active"
              ? "border-b-2 border-blue-600 font-medium"
              : "text-gray-500"
          }`}
        >
          Active ({activeVisitors.length})
        </button>

        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-2 ${
            activeTab === "trash"
              ? "border-b-2 border-red-600 font-medium"
              : "text-gray-500"
          }`}
        >
          Trash ({deletedVisitors.length})
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {/* ---------- TABLE ---------- */}
      {(activeTab === "active" ? activeVisitors : deletedVisitors).length ===
      0 ? (
        <div className="border rounded p-10 text-center text-gray-500">
          No visitors found.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3">Name</th>
                <th className="border p-3">Phone</th>
                <th className="border p-3">Source</th>
                <th className="border p-3">Created</th>
                <th className="border p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === "active" ? activeVisitors : deletedVisitors).map(
                (v) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="border p-3">{v.name}</td>
                    <td className="border p-3">{v.phone}</td>
                    <td className="border p-3 capitalize">{v.source}</td>
                    <td className="border p-3">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>

                    <td className="border p-3 space-x-3">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => {
                              setEditVisitor(v);
                              setOpenEditModal(true);
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(v._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(v._id)}
                          className="text-green-600 hover:underline"
                        >
                          Recover
                        </button>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- MODALS ---------- */}
      <AddVisitorModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={(visitor) => setVisitors((prev) => [visitor, ...prev])}
      />

      <EditVisitorModal
        open={openEditModal}
        visitor={editVisitor}
        onClose={() => {
          setOpenEditModal(false);
          setEditVisitor(null);
        }}
        onSuccess={(updatedVisitor) =>
          setVisitors((prev) =>
            prev.map((v) =>
              v._id === updatedVisitor._id ? updatedVisitor : v,
            ),
          )
        }
      />
    </div>
  );
};

export default Visitors;
