const ReportPageHeader = ({ title, subtitle, right }) => {
  return (
    <div className="neu-panel lms-sheen relative overflow-hidden rounded-[34px] px-6 py-6">
      <div className="lms-glow-orb left-[-3rem] top-[-2rem] h-32 w-32 bg-white/35" />
      <div
        className="lms-glow-orb bottom-[-2rem] right-[-2rem] h-36 w-36 bg-[var(--lms-accent-soft)]"
        style={{ animationDelay: "-2.4s" }}
      />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lms-text-soft)]">
            Reports
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--lms-text)]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--lms-text-soft)]">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">{right}</div>
      </div>
    </div>
  );
};

export default ReportPageHeader;
