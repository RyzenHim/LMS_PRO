import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

const SortHeader = ({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
  align = "left",
}) => {
  const active = sortBy === field;
  const Icon = !active ? ArrowUpDown : sortOrder === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex w-full items-center gap-1.5 text-left text-xs font-semibold uppercase tracking-[0.16em] transition ${
        align === "right" ? "justify-end" : ""
      } ${
        active
          ? "text-[var(--lms-accent-strong)]"
          : "text-[var(--lms-text-soft)] hover:text-[var(--lms-text)]"
      }`}
    >
      <span>{label}</span>
      <Icon size={12} />
    </button>
  );
};

export default SortHeader;
