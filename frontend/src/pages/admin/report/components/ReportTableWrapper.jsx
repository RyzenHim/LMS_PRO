const ReportTableWrapper = ({ title, count, children }) => {
  return (
    <div className="neu-panel overflow-hidden rounded-[30px]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h2 className="font-semibold text-[var(--lms-text)]">{title}</h2>

        <span className="neu-badge rounded-full px-3 py-1 text-xs font-semibold">
          {count || 0}
        </span>
      </div>

      <div className="overflow-x-auto">{children}</div>
    </div>
  );
};

export default ReportTableWrapper;
