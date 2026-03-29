const PageLoader = ({
  label = "Loading",
  detail = "Preparing your workspace",
  compact = false,
}) => {
  return (
    <div className={compact ? "flex items-center gap-4" : "lms-loader-shell"}>
      <div className={compact ? "lms-loader-orbit scale-75" : "lms-loader-orbit"}>
        <span className="lms-loader-dot" />
      </div>

      <div className={compact ? "space-y-1" : "mt-6 space-y-2"}>
        <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[var(--lms-text-soft)]">
          {label}
        </p>
        <p className="text-sm text-[var(--lms-text)]/80">{detail}</p>
      </div>
    </div>
  );
};

export default PageLoader;
