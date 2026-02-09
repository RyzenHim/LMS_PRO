import { useState } from "react";
import { GraduationCap } from "lucide-react";
import axiosInstance from "../../../api/axios";

const ConvertVisitorModal = ({ open, onClose, visitor, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !visitor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!visitor.email) {
      setError("Email is required for conversion. Please add email to visitor first.");
      return;
    }

    try {
      setLoading(true);
      const endpoint = `/visitor/${visitor._id}/convert/student`;
      const res = await axiosInstance.post(endpoint);

      if (res?.data) {
        alert(
          "Visitor converted to student successfully! Default password: Password@123"
        );
        onSuccess(res.data.visitor);
        onClose();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to convert visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#112D4E] w-full max-w-md rounded-xl shadow-2xl p-6 border border-[#DBE2EF] dark:border-[#3F72AF]">
        <h2 className="text-xl font-semibold mb-4 text-[#112D4E] dark:text-[#DBE2EF]">
          Convert Visitor
        </h2>

        {error && (
          <p className="text-red-600 dark:text-red-400 mb-3 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Convert To *
            </label>
            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 border rounded-lg flex flex-col items-center gap-2 border-[#3F72AF] bg-[#DBE2EF] dark:bg-[#3F72AF] text-[#112D4E] dark:text-[#DBE2EF]">
                <GraduationCap size={24} />
                <span className="text-xs">Student</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> A user account will be created with default password:{" "}
              <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">Password@123</code>
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg text-[#3F72AF] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-[#3F72AF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#3F72AF] text-white rounded-lg hover:bg-[#112D4E] dark:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] disabled:opacity-50 transition-colors"
            >
              {loading ? "Converting..." : "Convert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertVisitorModal;
