const ReportTableWrapper = ({ title, count, children }) => {
  return (
    <div
      className="
        rounded-2xl border border-[#DBE2EF] dark:border-[#3F72AF]
        bg-white dark:bg-[#112D4E]
        overflow-hidden shadow-sm
        transition hover:shadow-lg
      "
    >
      <div className="p-4 border-b border-[#DBE2EF] dark:border-[#3F72AF] flex items-center justify-between">
        <h2 className="font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          {title}
        </h2>

        <span className="text-xs px-3 py-1 rounded-full bg-[#DBE2EF] dark:bg-[#0a1f3a] text-[#112D4E] dark:text-[#DBE2EF]">
          {count || 0}
        </span>
      </div>

      <div className="overflow-x-auto">{children}</div>
    </div>
  );
};

export default ReportTableWrapper;
