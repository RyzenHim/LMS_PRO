const BatchReportFilters = ({
  courses = [],
  batches = [],
  selectedCourse,
  setSelectedCourse,
  selectedBatch,
  setSelectedBatch,
  loadingBatches,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* COURSE */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          Select Course
        </label>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="
            w-full px-3 py-2.5 rounded-xl
            border border-[#DBE2EF] dark:border-[#3F72AF]
            bg-white dark:bg-[#0a1f3a]
            text-sm text-[#112D4E] dark:text-[#DBE2EF]
            shadow-sm
            transition-all duration-300
            hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/40
          "
        >
          <option value="">-- Select Course --</option>

          {(courses || []).map((c) => (
            <option key={c?._id} value={c?._id}>
              {c?.title || "Course"}
            </option>
          ))}
        </select>
      </div>

      {/* BATCH */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          Select Batch
        </label>

        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          disabled={!selectedCourse || loadingBatches}
          className="
            w-full px-3 py-2.5 rounded-xl
            border border-[#DBE2EF] dark:border-[#3F72AF]
            bg-white dark:bg-[#0a1f3a]
            text-sm text-[#112D4E] dark:text-[#DBE2EF]
            shadow-sm
            transition-all duration-300
            hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/40
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          <option value="">
            {!selectedCourse
              ? "-- Select course first --"
              : loadingBatches
                ? "Loading batches..."
                : "-- Select Batch --"}
          </option>

          {(batches || []).map((b) => (
            <option key={b?._id} value={b?._id}>
              {b?.name || "Batch"}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BatchReportFilters;
