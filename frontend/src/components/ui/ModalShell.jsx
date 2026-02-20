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
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-md"
        aria-label="Close modal backdrop"
      />

      <div
        className={`relative w-full ${maxWidth} rounded-3xl border border-white/50 dark:border-slate-700 bg-white/85 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl`}
      >
        <div className="px-6 py-5 border-b border-[#DBE2EF] dark:border-slate-700 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-sm text-[#3F72AF] dark:text-slate-300 mt-1">
                {subtitle}
              </p>
            ) : null}
          </div>
          <h1>hey lets see what is this</h1>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-[#DBE2EF] dark:border-slate-700 hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition"
          >
            <X size={18} className="text-[#112D4E] dark:text-[#DBE2EF]" />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

export default ModalShell;
