import React from "react";
import ModalShell from "../../../../components/ui/ModalShell";

const ViewFeesModal = ({ open, onClose, fees }) => {
  if (!open || !fees) return null;

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString();
  };

  const card = "neu-panel-soft rounded-[22px] p-4";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Fees Details"
      subtitle="Student fees, payment mode, and due information."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className={card}>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">Student</p>
            <p className="mt-2 font-medium text-[var(--lms-text)]">{fees.student?.name || "-"}</p>
            <p className="text-xs text-[var(--lms-text-soft)]">{fees.student?.email || "-"} · {fees.student?.phone || "-"}</p>
          </div>
          <div className={card}>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">Course</p>
            <p className="mt-2 font-medium text-[var(--lms-text)]">{fees.course?.title || "-"}</p>
            <p className="text-xs text-[var(--lms-text-soft)]">Price: Rs {fees.coursePrice || fees.course?.price || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className={card}>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">Paid</p>
            <p className="mt-2 font-semibold text-[var(--lms-text)]">Rs {fees.amountPaid || 0}</p>
          </div>
          <div className={card}>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">Remaining</p>
            <p className="mt-2 font-semibold text-[var(--lms-text)]">Rs {fees.remainingAmount || 0}</p>
          </div>
          <div className={card}>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">Due Date</p>
            <p className="mt-2 font-semibold text-[var(--lms-text)]">{formatDate(fees.dueDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className={card}>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">Payment Type</p>
            <p className="mt-2 font-medium capitalize text-[var(--lms-text)]">{fees.paymentType || "-"}</p>
          </div>
          <div className={card}>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">Payment Mode</p>
            <p className="mt-2 font-medium capitalize text-[var(--lms-text)]">{fees.paymentMode || "-"}</p>
          </div>
        </div>

        <div className={card}>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">Status</p>
          <p className="mt-2 font-medium capitalize text-[var(--lms-text)]">{fees.status || "-"}</p>
        </div>

        {fees.note ? (
          <div className={card}>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">Note</p>
            <p className="mt-2 text-[var(--lms-text)]">{fees.note}</p>
          </div>
        ) : null}

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="neu-button rounded-[20px] px-4 py-3 text-sm font-semibold">
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default ViewFeesModal;
