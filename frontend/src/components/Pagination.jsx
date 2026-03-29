import { ChevronLeft, ChevronRight } from "lucide-react";

const buildPages = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push(null);
  for (let current = start; current <= end; current += 1) pages.push(current);
  if (end < totalPages - 1) pages.push(null);

  pages.push(totalPages);
  return pages;
};

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);
  const btnBase =
    "neu-button lms-card-hover inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-2xl px-3 text-sm font-medium";
  const btnActive =
    "neu-button neu-button-primary cursor-default rounded-2xl px-3.5";
  const btnDisabled = "opacity-45 cursor-not-allowed";

  return (
    <div className="neu-panel-soft flex items-center justify-between gap-4 rounded-[28px] px-4 py-3">
      <span className="text-xs uppercase tracking-[0.18em] text-[var(--lms-text-soft)] whitespace-nowrap">
        Page{" "}
        <span className="font-semibold text-[var(--lms-text)]">{page}</span> of{" "}
        <span className="font-semibold text-[var(--lms-text)]">
          {totalPages}
        </span>
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page === 1}
          className={`${btnBase} gap-1.5 pr-3 ${page === 1 ? btnDisabled : ""}`}
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </button>

        <div className="flex items-center gap-1">
          {pages.map((item, index) =>
            item === null ? (
              <span
                key={`ellipsis-${index}`}
                className="w-8 text-center text-sm text-[var(--lms-text-soft)]"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className={item === page ? btnActive : btnBase}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
          className={`${btnBase} gap-1.5 pl-3 ${page >= totalPages ? btnDisabled : ""}`}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
