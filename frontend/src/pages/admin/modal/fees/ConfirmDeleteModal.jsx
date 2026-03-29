import { Trash2, AlertTriangle } from "lucide-react";
import ModalShell from "../../../../components/ui/ModalShell";

const ConfirmDeleteModal = ({ open, onClose, onConfirm, title }) => {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Delete Fees Record"
      subtitle="This record will be moved to trash and can be restored later."
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="neu-inset rounded-[18px] p-3">
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <div className="pt-1 text-sm text-[var(--lms-text)]">
            Are you sure you want to delete fees record for{" "}
            <span className="font-semibold">{title || "Selected Student"}</span>?
          </div>
        </div>

        <div className="lms-status-warning">
          Deleting here only moves the record to trash. It is not permanently
          removed.
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="neu-button rounded-[20px] px-4 py-3 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="neu-button-danger rounded-[20px] px-4 py-3 text-sm font-semibold"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default ConfirmDeleteModal;
