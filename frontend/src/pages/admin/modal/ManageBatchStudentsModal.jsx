import React, { useEffect, useMemo, useState } from "react";
import { X, Search, UserPlus, UserMinus, Users } from "lucide-react";

import { studentService } from "../../../services/studentService";
import { batchStudentMapService } from "../../../services/batchStudentMapService";

const ManageBatchStudentsModal = ({ open, onClose, batch }) => {
  const [loading, setLoading] = useState(false);

  const [allStudents, setAllStudents] = useState([]);
  const [batchMappings, setBatchMappings] = useState([]);

  const [searchAll, setSearchAll] = useState("");
  const [searchBatch, setSearchBatch] = useState("");

  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [selectedToRemove, setSelectedToRemove] = useState([]);

  useEffect(() => {
    if (open && batch?._id) {
      fetchAllStudents();
      fetchBatchStudents();
    }
  }, [open, batch]);

  const fetchAllStudents = async () => {
    try {
      const res = await studentService.getAll();
      setAllStudents(res.data || []);
    } catch (error) {
      console.error("fetchAllStudents error", error);
    }
  };

  const fetchBatchStudents = async () => {
    try {
      const res = await batchStudentMapService.getStudentsOfBatch(batch._id);
      setBatchMappings(res.data || []);
    } catch (error) {
      console.error("fetchBatchStudents error", error);
    }
  };

  // Batch students IDs set
  const batchStudentIds = useMemo(() => {
    return new Set(
      (batchMappings || [])
        .map((m) => m.student?._id)
        .filter(Boolean)
        .map((id) => id.toString()),
    );
  }, [batchMappings]);

  const filteredAllStudents = useMemo(() => {
    const q = searchAll.toLowerCase();

    return (allStudents || [])
      .filter((s) => s.isDeleted === false)
      .filter((s) => {
        return (
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.phone?.toLowerCase().includes(q) ||
          s.adhaar?.toLowerCase().includes(q)
        );
      });
  }, [allStudents, searchAll]);

  const filteredBatchStudents = useMemo(() => {
    const q = searchBatch.toLowerCase();

    return (batchMappings || []).filter((m) => {
      const s = m.student;
      return (
        s?.name?.toLowerCase().includes(q) ||
        s?.email?.toLowerCase().includes(q) ||
        s?.phone?.toLowerCase().includes(q) ||
        s?.adhaar?.toLowerCase().includes(q)
      );
    });
  }, [batchMappings, searchBatch]);

  const toggleAddSelect = (studentId) => {
    setSelectedToAdd((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const toggleRemoveSelect = (studentId) => {
    setSelectedToRemove((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleAddStudents = async () => {
    if (!selectedToAdd.length) return alert("Select students to add");

    setLoading(true);
    try {
      await batchStudentMapService.addStudentsToBatch(batch._id, selectedToAdd);
      setSelectedToAdd([]);
      await fetchBatchStudents();
    } catch (error) {
      console.error("handleAddStudents error", error);
      alert(error.response?.data?.message || "Failed to add students");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudents = async () => {
    if (!selectedToRemove.length) return alert("Select students to remove");

    setLoading(true);
    try {
      await batchStudentMapService.removeStudentsFromBatch(
        batch._id,
        selectedToRemove,
      );
      setSelectedToRemove([]);
      await fetchBatchStudents();
    } catch (error) {
      console.error("handleRemoveStudents error", error);
      alert(error.response?.data?.message || "Failed to remove students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSearchAll("");
      setSearchBatch("");
      setSelectedToAdd([]);
      setSelectedToRemove([]);
      setAllStudents([]);
      setBatchMappings([]);
    }
  }, [open]);

  if (!open || !batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-6xl bg-white dark:bg-[#112D4E] rounded-2xl shadow-xl border border-[#DBE2EF] dark:border-[#3F72AF] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
          <div>
            <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Manage Students
            </h2>
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
              Batch: <span className="font-medium">{batch.name}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* LEFT: All Students */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-[#DBE2EF] dark:border-[#3F72AF]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                All Students
              </h3>
              <span className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Total: {filteredAllStudents.length}
              </span>
            </div>

            {/* Search */}
            <div className="mt-4 bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-3 flex items-center gap-3 shadow-sm">
              <Search
                size={16}
                className="text-[#3F72AF] dark:text-[#DBE2EF]"
              />
              <input
                type="text"
                placeholder="Search students..."
                value={searchAll}
                onChange={(e) => setSearchAll(e.target.value)}
                className="w-full outline-none text-sm bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              />
            </div>

            {/* List */}
            <div className="mt-4 max-h-[420px] overflow-y-auto space-y-2 pr-1">
              {filteredAllStudents.map((s) => {
                const alreadyInBatch = batchStudentIds.has(s._id.toString());
                const checked = selectedToAdd.includes(s._id);

                return (
                  <button
                    key={s._id}
                    disabled={alreadyInBatch}
                    onClick={() => toggleAddSelect(s._id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      alreadyInBatch
                        ? "opacity-50 cursor-not-allowed border-[#DBE2EF] dark:border-[#3F72AF]"
                        : checked
                          ? "border-[#3F72AF] bg-[#DBE2EF] dark:bg-[#0a1f3a]"
                          : "border-[#DBE2EF] dark:border-[#3F72AF] hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users size={16} className="text-[#3F72AF]" />
                      <div>
                        <p className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                          {s.name}
                        </p>
                        <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                          {s.email || "—"} • {s.phone || "—"} •{" "}
                          {s.adhaar || "—"}
                        </p>
                      </div>
                    </div>

                    {alreadyInBatch && (
                      <p className="text-xs text-green-600 mt-2">
                        Already in batch
                      </p>
                    )}
                  </button>
                );
              })}

              {filteredAllStudents.length === 0 && (
                <p className="text-sm text-center text-[#3F72AF] dark:text-[#DBE2EF] mt-8">
                  No students found
                </p>
              )}
            </div>

            {/* Add Button */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleAddStudents}
                disabled={loading || selectedToAdd.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3F72AF] text-white hover:bg-[#112D4E] transition-colors disabled:opacity-60"
              >
                <UserPlus size={18} />
                Add Selected ({selectedToAdd.length})
              </button>
            </div>
          </div>

          {/* RIGHT: Batch Students */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                Batch Students
              </h3>
              <span className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Total: {filteredBatchStudents.length}
              </span>
            </div>

            {/* Search */}
            <div className="mt-4 bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-3 flex items-center gap-3 shadow-sm">
              <Search
                size={16}
                className="text-[#3F72AF] dark:text-[#DBE2EF]"
              />
              <input
                type="text"
                placeholder="Search batch students..."
                value={searchBatch}
                onChange={(e) => setSearchBatch(e.target.value)}
                className="w-full outline-none text-sm bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              />
            </div>

            {/* List */}
            <div className="mt-4 max-h-[420px] overflow-y-auto space-y-2 pr-1">
              {filteredBatchStudents.map((m) => {
                const s = m.student;
                if (!s?._id) return null;

                const checked = selectedToRemove.includes(s._id);

                return (
                  <button
                    key={m._id}
                    onClick={() => toggleRemoveSelect(s._id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      checked
                        ? "border-red-500 bg-red-50 dark:bg-[#0a1f3a]"
                        : "border-[#DBE2EF] dark:border-[#3F72AF] hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users size={16} className="text-[#3F72AF]" />
                      <div>
                        <p className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                          {s?.name || "—"}
                        </p>
                        <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                          {s?.email || "—"} • {s?.phone || "—"} •{" "}
                          {s?.adhaar || "—"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredBatchStudents.length === 0 && (
                <p className="text-sm text-center text-[#3F72AF] dark:text-[#DBE2EF] mt-8">
                  No students in this batch
                </p>
              )}
            </div>

            {/* Remove Button */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleRemoveStudents}
                disabled={loading || selectedToRemove.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                <UserMinus size={18} />
                Remove Selected ({selectedToRemove.length})
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DBE2EF] dark:border-[#3F72AF] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageBatchStudentsModal;
