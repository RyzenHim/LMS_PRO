import { useEffect, useState } from "react";
import { Search, Plus, Eye, Edit, Trash2, RotateCcw, UserPlus, XCircle, Clock, CheckCircle } from "lucide-react";
import AddVisitorModal from "./modal/AddVisitorModal";
import EditVisitorModal from "./modal/EditVisitorModal";
import ViewVisitorModal from "./modal/ViewVisitorModal";
import ConvertVisitorModal from "./modal/ConvertVisitorModal";
import NotInterestedModal from "./modal/NotInterestedModal";
import ConfirmDeleteModal from "../admin/modal/ConfirmDeleteModal";
import axiosInstance from "../../api/axios";

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [notInterestedVisitors, setNotInterestedVisitors] = useState([]);
  const [followUpVisitors, setFollowUpVisitors] = useState([]);
  const [convertedVisitors, setConvertedVisitors] = useState([]);
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
  const [openConvertModal, setOpenConvertModal] = useState(false);
  const [convertVisitor, setConvertVisitor] = useState(null);
  const [openNotInterestedModal, setOpenNotInterestedModal] = useState(false);
  const [notInterestedVisitor, setNotInterestedVisitor] = useState(null);

  /* ---------------- FETCH VISITORS ---------------- */
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [activeRes, notInterestedRes, followUpRes, convertedRes, deletedRes] = await Promise.all([
        axiosInstance.get("/visitor/allvisitor"),
        axiosInstance.get("/visitor/not-interested/list"),
        axiosInstance.get("/visitor/follow-up/list"),
        axiosInstance.get("/visitor/converted/list"),
        axiosInstance.get("/visitor/trash/list"),
      ]);

      setVisitors(Array.isArray(activeRes?.data) ? activeRes.data.filter(v => !["converted", "not-interested", "follow-up"].includes(v.status)) : []);
      setNotInterestedVisitors(Array.isArray(notInterestedRes?.data) ? notInterestedRes.data : []);
      setFollowUpVisitors(Array.isArray(followUpRes?.data) ? followUpRes.data : []);
      setConvertedVisitors(Array.isArray(convertedRes?.data) ? convertedRes.data : []);
      setDeletedVisitors(Array.isArray(deletedRes?.data) ? deletedRes.data : []);
    } catch (err) {
      setError("Failed to load visitors");
      console.error("Error fetching visitors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  /* ---------------- SOFT DELETE ---------------- */
  const handleDeleteClick = (visitor) => {
    setDeleteVisitor(visitor);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/visitor/${deleteVisitor._id}`);
      fetchAllData();
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
      fetchAllData();
    } catch {
      alert("Failed to recover visitor");
    }
  };

  /* ---------------- VIEW ---------------- */
  const handleView = (visitor) => {
    setViewVisitor(visitor);
    setOpenViewModal(true);
  };

  /* ---------------- CONVERT ---------------- */
  const handleConvertClick = (visitor) => {
    setConvertVisitor(visitor);
    setOpenConvertModal(true);
  };

  const handleConvertSuccess = () => {
    fetchAllData();
    setOpenConvertModal(false);
    setConvertVisitor(null);
  };

  /* ---------------- NOT INTERESTED ---------------- */
  const handleNotInterestedClick = (visitor) => {
    setNotInterestedVisitor(visitor);
    setOpenNotInterestedModal(true);
  };

  const handleNotInterestedSuccess = () => {
    fetchAllData();
    setOpenNotInterestedModal(false);
    setNotInterestedVisitor(null);
  };

  /* ---------------- FILTERED DATA ---------------- */
  const getFilteredVisitors = () => {
    let dataToFilter = [];
    switch (activeTab) {
      case "active":
        dataToFilter = visitors;
        break;
      case "not-interested":
        dataToFilter = notInterestedVisitors;
        break;
      case "follow-up":
        dataToFilter = followUpVisitors;
        break;
      case "converted":
        dataToFilter = convertedVisitors;
        break;
      case "trash":
        dataToFilter = deletedVisitors;
        break;
      default:
        dataToFilter = visitors;
    }

    return dataToFilter.filter(
      (v) =>
        v.name?.toLowerCase().includes(search.toLowerCase()) ||
        v.email?.toLowerCase().includes(search.toLowerCase()) ||
        v.phone?.toString().includes(search) ||
        v.course?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filteredVisitors = getFilteredVisitors();

  const getTabCount = (tab) => {
    switch (tab) {
      case "active":
        return visitors.length;
      case "not-interested":
        return notInterestedVisitors.length;
      case "follow-up":
        return followUpVisitors.length;
      case "converted":
        return convertedVisitors.length;
      case "trash":
        return deletedVisitors.length;
      default:
        return 0;
    }
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
        Loading visitors...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Visitors
          </h1>
          <p className="text-[#3F72AF] dark:text-[#DBE2EF] text-sm">
            Manage visitor leads and conversions
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-[#3F72AF] text-white px-4 py-2 rounded-lg hover:bg-[#112D4E] dark:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] transition-colors shadow-md"
          >
            <Plus size={18} />
            Add Visitor
          </button>
        )}
      </div>

      {/* ---------- TABS ---------- */}
      <div className="flex gap-4 border-b border-[#DBE2EF] dark:border-[#3F72AF] overflow-x-auto">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-2 px-2 whitespace-nowrap transition-colors ${
            activeTab === "active"
              ? "border-b-2 border-[#3F72AF] font-medium text-[#3F72AF] dark:text-[#DBE2EF] dark:border-[#DBE2EF]"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          Active ({getTabCount("active")})
        </button>
        <button
          onClick={() => setActiveTab("not-interested")}
          className={`pb-2 px-2 whitespace-nowrap transition-colors ${
            activeTab === "not-interested"
              ? "border-b-2 border-red-600 font-medium text-red-600 dark:text-red-400 dark:border-red-400"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          <XCircle size={16} className="inline mr-1" />
          Not Interested ({getTabCount("not-interested")})
        </button>
        <button
          onClick={() => setActiveTab("follow-up")}
          className={`pb-2 px-2 whitespace-nowrap transition-colors ${
            activeTab === "follow-up"
              ? "border-b-2 border-yellow-600 font-medium text-yellow-600 dark:text-yellow-400 dark:border-yellow-400"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          <Clock size={16} className="inline mr-1" />
          Follow-up ({getTabCount("follow-up")})
        </button>
        <button
          onClick={() => setActiveTab("converted")}
          className={`pb-2 px-2 whitespace-nowrap transition-colors ${
            activeTab === "converted"
              ? "border-b-2 border-green-600 font-medium text-green-600 dark:text-green-400 dark:border-green-400"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          <CheckCircle size={16} className="inline mr-1" />
          Converted ({getTabCount("converted")})
        </button>
        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-2 px-2 whitespace-nowrap transition-colors ${
            activeTab === "trash"
              ? "border-b-2 border-red-600 font-medium text-red-600 dark:text-red-400 dark:border-red-400"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          Trash ({getTabCount("trash")})
        </button>
      </div>

      {/* ---------- SEARCH ---------- */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Search className="text-[#3F72AF] dark:text-[#DBE2EF]" size={18} />
          <input
            type="text"
            placeholder="Search visitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* ---------- TABLE ---------- */}
      {filteredVisitors.length === 0 ? (
        <div className="border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg p-10 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
          No visitors found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg shadow-lg">
          <table className="w-full text-sm">
            <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF]">
              <tr>
                <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  Name
                </th>
                <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  Email
                </th>
                <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  Phone
                </th>
                <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  Course
                </th>
                <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  Source
                </th>
                <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  Status
                </th>
                {activeTab === "not-interested" && (
                  <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Reason
                  </th>
                )}
                {activeTab === "follow-up" && (
                  <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Follow-up Date
                  </th>
                )}
                {activeTab === "converted" && (
                  <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Converted To
                  </th>
                )}
                <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  Created
                </th>
                <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map((v) => (
                <tr
                  key={v._id}
                  className="hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition-colors"
                >
                  <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#112D4E] dark:text-[#DBE2EF] font-medium">
                    {v.name}
                  </td>
                  <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                    {v.email || "—"}
                  </td>
                  <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                    {v.phone || "—"}
                  </td>
                  <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                    {v.course || "—"}
                  </td>
                  <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 capitalize text-[#3F72AF] dark:text-[#DBE2EF]">
                    {v.source || "—"}
                  </td>
                  <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-md capitalize ${
                        v.status === "converted"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : v.status === "contacted"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : v.status === "not-interested"
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          : v.status === "follow-up"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {v.status || "new"}
                    </span>
                  </td>
                  {activeTab === "not-interested" && (
                    <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#3F72AF] dark:text-[#DBE2EF] text-xs">
                      {v.notInterestedReason || "—"}
                    </td>
                  )}
                  {activeTab === "follow-up" && (
                    <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {v.followUpDate
                        ? new Date(v.followUpDate).toLocaleDateString()
                        : "—"}
                    </td>
                  )}
                  {activeTab === "converted" && (
                    <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3">
                      <span className="px-2 py-1 text-xs rounded-md bg-[#DBE2EF] dark:bg-[#3F72AF] text-[#112D4E] dark:text-[#DBE2EF] capitalize">
                        {v.conversionType || "—"}
                      </span>
                    </td>
                  )}
                  <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </td>

                  <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 space-x-2">
                    {activeTab === "active" ? (
                      <>
                        <button
                          onClick={() => handleView(v)}
                          className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white text-sm transition-colors"
                          title="View"
                        >
                          <Eye size={16} className="inline" />
                        </button>
                        <button
                          onClick={() => {
                            setEditVisitor(v);
                            setOpenEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} className="inline" />
                        </button>
                        <button
                          onClick={() => handleConvertClick(v)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm transition-colors"
                          title="Convert"
                        >
                          <UserPlus size={16} className="inline" />
                        </button>
                        <button
                          onClick={() => handleNotInterestedClick(v)}
                          className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-sm transition-colors"
                          title="Not Interested"
                        >
                          <XCircle size={16} className="inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(v)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="inline" />
                        </button>
                      </>
                    ) : activeTab === "trash" ? (
                      <button
                        onClick={() => handleRestore(v._id)}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm flex items-center gap-1 transition-colors"
                        title="Restore"
                      >
                        <RotateCcw size={16} />
                        Restore
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleView(v)}
                          className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white text-sm transition-colors"
                          title="View"
                        >
                          <Eye size={16} className="inline" />
                        </button>
                        <button
                          onClick={() => {
                            setEditVisitor(v);
                            setOpenEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} className="inline" />
                        </button>
                        {activeTab === "not-interested" && (
                          <button
                            onClick={() => handleConvertClick(v)}
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm transition-colors"
                            title="Convert"
                          >
                            <UserPlus size={16} className="inline" />
                          </button>
                        )}
                      </>
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
          fetchAllData();
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
          fetchAllData();
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

      <ConvertVisitorModal
        open={openConvertModal}
        visitor={convertVisitor}
        onClose={() => {
          setOpenConvertModal(false);
          setConvertVisitor(null);
        }}
        onSuccess={handleConvertSuccess}
      />

      <NotInterestedModal
        open={openNotInterestedModal}
        visitor={notInterestedVisitor}
        onClose={() => {
          setOpenNotInterestedModal(false);
          setNotInterestedVisitor(null);
        }}
        onSuccess={handleNotInterestedSuccess}
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
