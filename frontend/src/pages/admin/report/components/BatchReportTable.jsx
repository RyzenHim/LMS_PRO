const BatchReportTable = ({ students = [], tutors = [], loading }) => {
  if (loading) {
    return (
      <div className="p-10 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
        Loading report...
      </div>
    );
  }

  const TableCard = ({ title, count, columns = [], rows = [], type }) => {
    return (
      <div
        className="
          rounded-2xl border border-[#DBE2EF] dark:border-[#3F72AF]
          bg-white dark:bg-[#112D4E]
          overflow-hidden shadow-sm
          transition hover:shadow-lg
        "
      >
        {/* Header */}
        <div className="p-4 border-b border-[#DBE2EF] dark:border-[#3F72AF] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            {title}
          </h2>

          <span className="text-xs px-3 py-1 rounded-full bg-[#DBE2EF] dark:bg-[#0a1f3a] text-[#112D4E] dark:text-[#DBE2EF] font-semibold">
            {count || 0}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#F9F7F7] dark:bg-[#0a1f3a] sticky top-0 z-10">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c}
                    className="p-3 text-left font-semibold text-[#112D4E] dark:text-[#DBE2EF]"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.length ? (
                rows.map((item) => (
                  <tr
                    key={item?._id}
                    className="border-t hover:bg-[#F9F7F7] dark:hover:bg-[#0a1f3a] transition"
                  >
                    <td className="p-3 font-medium">{item?.name || "-"}</td>
                    <td className="p-3">{item?.email || "-"}</td>
                    <td className="p-3">{item?.phone || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="p-6 text-center text-sm text-[#3F72AF] dark:text-[#DBE2EF]"
                    colSpan={columns.length}
                  >
                    {type === "students"
                      ? "No students in this batch."
                      : "No tutors assigned to this batch."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <TableCard
        title="Students"
        count={students.length}
        columns={["Name", "Email", "Phone"]}
        rows={students}
        type="students"
      />

      <TableCard
        title="Tutors"
        count={tutors.length}
        columns={["Name", "Email", "Phone"]}
        rows={tutors}
        type="tutors"
      />
    </div>
  );
};

export default BatchReportTable;
