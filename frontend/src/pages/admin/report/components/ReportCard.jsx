import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const ReportCard = ({ title, desc, to, icon }) => {
  return (
    <Link
      to={to}
      className="neu-panel lms-card-hover lms-sheen group relative block overflow-hidden rounded-[30px] p-6"
    >
      <div className="lms-glow-orb left-[-2.5rem] top-[-2rem] h-28 w-28 bg-white/35" />
      <div
        className="lms-glow-orb bottom-[-2rem] right-[-2rem] h-32 w-32 bg-[var(--lms-accent-soft)]"
        style={{ animationDelay: "-3.2s" }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="neu-inset flex h-12 w-12 items-center justify-center rounded-[22px] text-[var(--lms-accent-strong)] transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[var(--lms-text)]">
              {title || "Report"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--lms-text-soft)]">
              {desc || "View and export report"}
            </p>
          </div>
        </div>

        <span className="neu-button inline-flex h-10 w-10 items-center justify-center rounded-2xl opacity-70 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
          <ChevronRight size={18} className="text-[var(--lms-text)]" />
        </span>
      </div>
    </Link>
  );
};

export default ReportCard;
