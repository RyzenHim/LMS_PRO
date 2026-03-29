import { X } from "lucide-react";

const ModalShell = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-2xl",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="lms-modal-backdrop absolute inset-0"
        aria-label="Close modal backdrop"
      />

      <div
        className={`neu-panel relative z-10 w-full ${maxWidth} overflow-hidden rounded-[34px]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[var(--lms-text)]">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-[var(--lms-text-soft)]">
                {subtitle}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="neu-button h-11 w-11 rounded-2xl"
          >
            <X size={18} className="mx-auto text-[var(--lms-text)]" />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

export default ModalShell;
