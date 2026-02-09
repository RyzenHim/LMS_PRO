import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { batchService } from "../../../services/batchService";
import { batchStudentMapService } from "../../../services/batchStudentMapService";

const ChangeBatchModal = ({ open, onClose, student, onChanged }) => {
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [currentMapping, setCurrentMapping] = useState(null);
  const [toBatchId, setToBatchId] = useState("");

  useEffect(() => {
    if (open && student?._id) {
      fetchBatches();
      fetchCurrentBatch(student._id);
    }
  }, [open, student?._id]);

  const fetchBatches = async () => {
    try {
      const res = await batchService.getAll({ limit: 100 });
      setBatches((res.data.batches || []).filter((b) => b.isDeleted === false));
    } catch (error) {
      console.error("fetchBatches error:", error);
    }
  };

  const fetchCurrentBatch = async (studentId) => {
    try {
      const res = await batchStudentMapService.getBatchesOfStudent(studentId);
      const active = (res.data || []).find((b) => b.status === "active") || null;
      setCurrentMapping(active);
    } catch (error) {
      console.error("fetchCurrentBatch error:", error);
    }
  };

  const availableBatches = useMemo(() => {
    if (!currentMapping?.batch?._id) return batches;
    return batches.filter((b) => b._id !== currentMapping.batch._id);
  }, [batches, currentMapping]);

  const handleSubmit = async () => {
    if (!toBatchId) {
      return alert("Select a target batch");
    }

    setLoading(true);
    try {
      const payload = {
        fromBatchId: currentMapping?.batch?._id || null,
        toBatchId,
      };
      await batchStudentMapService.changeStudentBatch(student._id, payload);
      onChanged?.();
      onClose();
    } catch (error) {
      console.error("change batch error:", error);
      alert(error.response?.data?.message || "Failed to change batch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setBatches([]);
      setCurrentMapping(null);
      setToBatchId("");
    }
  }, [open]);

  if (!open || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-[#112D4E] rounded-2xl shadow-xl border border-[#DBE2EF] dark:border-[#3F72AF] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
          <div>
            <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Change Batch
            </h2>
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
              Student: <span className="font-medium">{student.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a]">
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
              Current Batch
            </p>
            <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              {currentMapping?.batch?.name || "Not assigned"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
              New Batch *
            </label>
            <select
              value={toBatchId}
              onChange={(e) => setToBatchId(e.target.value)}
              className="mt-2 w-full p-3 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF]"
            >
              <option value="">Select batch</option>
              {availableBatches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#DBE2EF] dark:border-[#3F72AF] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#3F72AF] text-white hover:bg-[#112D4E] transition-colors disabled:opacity-60"
          >
            {loading ? "Updating..." : "Change Batch"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeBatchModal;
