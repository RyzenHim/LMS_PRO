import React from "react";

const buildPages = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push(null);
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < totalPages - 1) pages.push(null);

  pages.push(totalPages);
  return pages;
};

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);

  return (
    <div className="flex items-center justify-between text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          className="px-3 py-1 border rounded-lg"
          disabled={page === 1}
        >
          Prev
        </button>
        <div className="flex items-center gap-1">
          {pages.map((p, idx) =>
            p === null ? (
              <span key={`ellipsis-${idx}`} className="px-2">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-3 py-1 rounded-lg border ${
                  p === page
                    ? "bg-[#3F72AF] text-white border-[#3F72AF]"
                    : "hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a]"
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>
        <button
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          className="px-3 py-1 border rounded-lg"
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
