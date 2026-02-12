import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const ReportCard = ({ title, desc, to, icon }) => {
  return (
    <Link
      to={to}
      className="
        group block relative overflow-hidden
        rounded-2xl border border-[#DBE2EF] dark:border-[#3F72AF]
        bg-white dark:bg-[#112D4E]
        p-5 shadow-sm
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl
        active:translate-y-0 active:shadow-md
      "
    >
      {/* subtle hover glow */}
      <div
        className="
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-br from-[#DBE2EF]/60 via-transparent to-[#3F72AF]/20
          dark:from-[#0a1f3a]/70 dark:to-[#3F72AF]/10
        "
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          {/* icon */}
          <div
            className="
              w-11 h-11 rounded-2xl flex items-center justify-center
              bg-[#DBE2EF] dark:bg-[#0a1f3a]
              text-[#112D4E] dark:text-[#DBE2EF]
              shadow-sm
              transition-transform duration-300
              group-hover:scale-110
            "
          >
            {icon || "📄"}
          </div>

          {/* text */}
          <div>
            <h3 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              {title || "Report"}
            </h3>

            <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF] mt-1 leading-relaxed">
              {desc || "View and export report"}
            </p>
          </div>
        </div>

        <ChevronRight
          size={18}
          className="
            mt-2 text-[#3F72AF] dark:text-[#DBE2EF]
            opacity-0 translate-x-2
            transition-all duration-300
            group-hover:opacity-100 group-hover:translate-x-0
          "
        />
      </div>
    </Link>
  );
};

export default ReportCard;
