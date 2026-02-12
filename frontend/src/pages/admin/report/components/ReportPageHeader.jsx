const ReportPageHeader = ({ title, subtitle, right }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#112D4E] dark:text-[#DBE2EF]">
          {title}
        </h1>
        <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
          {subtitle}
        </p>
      </div>

      <div className="flex gap-3">{right}</div>
    </div>
  );
};

export default ReportPageHeader;
