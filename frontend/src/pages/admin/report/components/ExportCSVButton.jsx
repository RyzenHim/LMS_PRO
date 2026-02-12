import { Download } from "lucide-react";

const ExportCSVButton = ({ rows = [], filename = "report.csv" }) => {
  const exportCSV = () => {
    if (!Array.isArray(rows) || rows.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = Object.keys(rows[0] || {});
    if (!headers.length) {
      alert("No data to export!");
      return;
    }

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = row?.[h] ?? "";
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };

  const disabled = !Array.isArray(rows) || rows.length === 0;

  return (
    <button
      onClick={exportCSV}
      disabled={disabled}
      className="
        inline-flex items-center gap-2
        px-4 py-2.5 rounded-2xl
        bg-[#3F72AF] text-white text-sm font-semibold
        shadow-sm transition-all duration-300
        hover:shadow-lg hover:-translate-y-[1px] hover:opacity-95
        active:translate-y-0
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:translate-y-0
      "
    >
      <Download size={16} />
      Export CSV
    </button>
  );
};

export default ExportCSVButton;
