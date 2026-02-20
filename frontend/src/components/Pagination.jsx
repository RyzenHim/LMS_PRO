import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const buildPages = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push(null);
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push(null);
  pages.push(totalPages);
  return pages;
};

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);
  const btnBase =
    "inline-flex items-center justify-center h-8 min-w-[2rem] px-2.5 rounded-lg border text-sm font-medium transition select-none";
  const btnInactive =
    "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#3F72AF]/10 dark:hover:bg-[#3F72AF]/20 hover:border-[#3F72AF]/30 dark:hover:border-[#3F72AF]/40 hover:text-[#3F72AF] dark:hover:text-[#7aa8d8]";
  const btnActive =
    "bg-[#3F72AF] border-[#3F72AF] text-white shadow-sm shadow-[#3F72AF]/20 cursor-default";
  const btnDisabled =
    "opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600";

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
        Page{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {totalPages}
        </span>
      </span>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page === 1}
          className={`${btnBase} gap-1 pr-3 ${page === 1 ? btnDisabled : btnInactive}`}
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-0.5">
          {pages.map((p, idx) =>
            p === null ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-7 text-center text-slate-400 dark:text-slate-500 text-sm select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
              >
                {p}
              </button>
            ),
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
          className={`${btnBase} gap-1 pl-3 ${page >= totalPages ? btnDisabled : btnInactive}`}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
