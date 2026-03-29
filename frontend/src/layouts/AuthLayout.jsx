import { Outlet } from "react-router-dom";

const AuthLayoutEnterprise = () => {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(24,36,59,0.82),rgba(17,25,42,0.94))]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1220]/80 via-transparent to-transparent" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#9bb6ff]/22 blur-3xl" />
        <div className="absolute right-[-8rem] top-1/3 h-96 w-96 rounded-full bg-[#7f95d7]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between p-16 text-white">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 shadow-[inset_1px_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/14 text-lg font-semibold">
                L
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-[0.24em] uppercase">
                  LMS Portal
                </h1>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-300">
                  Learning Command Center
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-lg space-y-8">
            <h2 className="text-5xl font-semibold leading-[1.05] tracking-tight">
              Sculpt calmer systems for sharper learning outcomes.
            </h2>

            <p className="text-lg leading-relaxed text-slate-200/88">
              A premium learning management experience for institutions,
              instructors, and operations teams that need elegance, structure,
              and confidence in every workflow.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                "Instructor Management",
                "Course Analytics",
                "Student Tracking",
                "Role-Based Access",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/10 px-4 py-3 shadow-[inset_1px_1px_0_rgba(255,255,255,0.16)] backdrop-blur-xl"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-[#dce5ff]" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-slate-300">
              <span>Trusted by 10,000+ learners</span>
              <span className="h-1 w-1 rounded-full bg-gray-400" />
              <span>ISO 27001 Secure</span>
              <span className="h-1 w-1 rounded-full bg-gray-400" />
              <span>99.99% Uptime</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>© 2026 LMS Portal</span>
            <span>Privacy • Security • Compliance</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center overflow-hidden px-6 py-10 sm:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_34%),linear-gradient(180deg,var(--lms-bg-secondary),var(--lms-bg))]" />
        <div className="absolute left-[-5rem] top-[10%] h-72 w-72 rounded-full bg-white/35 blur-3xl" />
        <div className="absolute bottom-[8%] right-[-4rem] h-72 w-72 rounded-full bg-[var(--lms-accent-soft)] blur-3xl" />

        <div className="neu-panel relative z-10 w-full max-w-xl rounded-[34px] px-7 py-8 sm:px-10 sm:py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayoutEnterprise;
