import React from "react";

const SortHeader = ({ label, field, sortBy, sortOrder, onSort, align = "left" }) => {
  const active = sortBy === field;
  const icon = active ? (sortOrder === "asc" ? "▲" : "▼") : "↕";

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-1 text-left w-full ${align === "right" ? "justify-end" : ""}`}
    >
      <span>{label}</span>
      <span className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">{icon}</span>
    </button>
  );
};

export default SortHeader;
