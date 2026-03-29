import { Link } from "react-router-dom";

const features = [
  {
    title: "Course Management",
    description:
      "Create, organize, schedule, and publish courses with a calmer operational flow.",
  },
  {
    title: "Instructor Portal",
    description:
      "Give tutors polished workspaces with cleaner context, faster actions, and fewer missed details.",
  },
  {
    title: "Student Tracking",
    description:
      "Monitor attendance, progress, fees, and milestones from one cohesive control layer.",
  },
  {
    title: "Analytics & Reports",
    description:
      "Turn daily activity into readable signals with premium dashboards and confident reporting.",
  },
  {
    title: "Role-Based Access",
    description:
      "Support admins, HR, tutors, and students without sacrificing clarity or security.",
  },
  {
    title: "Secure & Scalable",
    description:
      "Run a dependable institution-grade platform built for smooth growth and resilience.",
  },
];

const benefits = [
  "Increase Learning Efficiency",
  "Improve Student Outcomes",
  "Scale Without Limits",
  "Enterprise Security",
];

const Landing = () => {
  return (
    <div className="lms-app-shell flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
        <div className="neu-panel-soft flex items-center gap-3 rounded-full px-4 py-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--lms-accent-soft)] text-lg font-semibold text-[var(--lms-accent-strong)]">
            L
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-[0.22em] uppercase text-[var(--lms-text)]">
              LMS Portal
            </h1>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
              Award-ready learning ops
            </p>
          </div>
        </div>

        <Link
          to="/auth/login"
          className="neu-button neu-button-primary rounded-full px-6 py-3 text-sm font-semibold"
        >
          Login
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 pb-10 pt-4 sm:px-8 lg:px-10">
        <section className="relative overflow-hidden rounded-[40px] px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
          <div className="neu-panel absolute inset-0" />
          <div className="absolute -left-14 top-10 h-56 w-56 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute bottom-[-4rem] right-[-3rem] h-72 w-72 rounded-full bg-[var(--lms-accent-soft)] blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.3fr,0.9fr] lg:items-end">
            <div className="space-y-7">
              <span className="neu-badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                Modern Neumorphic Workspace
              </span>

              <div className="space-y-5">
                <h2 className="max-w-4xl text-5xl font-semibold leading-[0.98] text-[var(--lms-text)] sm:text-6xl">
                  The future of learning management, softened into a premium operating system.
                </h2>
                <p className="max-w-3xl text-lg leading-relaxed text-[var(--lms-text-soft)]">
                  A polished LMS for institutions that want every dashboard,
                  modal, and action flow to feel intentional, legible, and
                  trustworthy.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/auth/login"
                  className="neu-button neu-button-primary rounded-[24px] px-8 py-4 text-center text-sm font-semibold"
                >
                  Login to Dashboard
                </Link>
                <div className="neu-panel-soft inline-flex items-center rounded-[24px] px-5 py-4 text-sm text-[var(--lms-text-soft)]">
                  Trusted by 10,000+ learners, ISO 27001 secure, and built for calm operations.
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Live Operations", "Unified visibility across courses, teams, and learners."],
                ["Premium Dashboards", "Readable metrics designed to reduce friction and noise."],
                ["Stronger Signals", "Timetables, attendance, and reports in one polished flow."],
                ["Modal Focus", "Blurred backdrops and stronger hierarchy for clear task focus."],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="neu-panel-soft rounded-[28px] p-5"
                >
                  <p className="text-sm font-semibold text-[var(--lms-text)]">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--lms-text-soft)]">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
                Features
              </p>
              <h3 className="text-3xl font-semibold text-[var(--lms-text)]">
                Everything you need to run a modern LMS
              </h3>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--lms-text-soft)]">
              Every surface is tuned to feel soft, tactile, and clear without
              losing the operational seriousness of an admin platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="neu-panel rounded-[30px] p-7">
                <h4 className="text-xl font-semibold text-[var(--lms-text)]">
                  {feature.title}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-[var(--lms-text-soft)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="neu-panel rounded-[34px] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
              Why it works
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-[var(--lms-text)]">
              Institutions choose calm interfaces because clarity compounds.
            </h3>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="neu-inset rounded-[26px] p-5">
                  <p className="text-base font-semibold text-[var(--lms-text)]">
                    {benefit}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--lms-text-soft)]">
                    Better visual hierarchy, fewer noisy surfaces, and clearer
                    action paths help teams move faster with less fatigue.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="neu-panel rounded-[34px] p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
              Ready to begin
            </p>
            <h3 className="mt-3 text-3xl font-semibold text-[var(--lms-text)]">
              Transform your learning platform into a polished control center.
            </h3>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--lms-text-soft)]">
              Join institutions already managing students, instructors, fees,
              timetables, and reports with more confidence.
            </p>
            <Link
              to="/auth/login"
              className="neu-button neu-button-primary mt-8 inline-flex rounded-[24px] px-8 py-4 text-sm font-semibold"
            >
              Enter LMS Portal
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-7xl px-6 pb-8 text-center text-sm text-[var(--lms-text-soft)] sm:px-8 lg:px-10">
        © 2026 LMS Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
