import { useEffect, useState } from "react";
import axios from "axios";
import AddVisitorModal from "./modal/AddVisitorModal";
import axiosInstance from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);

  /* ---------------- FETCH VISITORS ---------------- */
  const fetchVisitors = async () => {
    try {
      const res = await axiosInstance.get(`/visitor/`, {
        withCredentials: true,
      });

      setVisitors(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
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
      await axios.delete(`${API_URL}/visitors/${id}`, {
        withCredentials: true,
      });

      setVisitors((prev) => prev.filter((v) => v?._id !== id));
    } catch {
      alert("Failed to delete visitor");
    }
  };

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
          <p className="text-gray-500 text-sm">
            Manage visitor leads added by admin
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Visitor
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {/* ---------- TABLE / EMPTY STATE ---------- */}
      {visitors.length === 0 ? (
        <div className="border rounded p-10 text-center text-gray-500">
          No visitors found. Click{" "}
          <span className="font-medium">Add Visitor</span> to create one.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3 text-left">Name</th>
                <th className="border p-3 text-left">Phone</th>
                <th className="border p-3 text-left">Source</th>
                <th className="border p-3 text-left">Created</th>
                <th className="border p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v?._id} className="hover:bg-gray-50">
                  <td className="border p-3">{v?.name}</td>
                  <td className="border p-3">{v?.phone}</td>
                  <td className="border p-3 capitalize">{v?.source}</td>
                  <td className="border p-3">
                    {v?.createdAt
                      ? new Date(v.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="border p-3">
                    <button
                      onClick={() => handleDelete(v._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- ADD VISITOR MODAL ---------- */}
      <AddVisitorModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={(visitor) => setVisitors((prev) => [visitor, ...prev])}
      />
    </div>
  );
};

export default Visitors;
