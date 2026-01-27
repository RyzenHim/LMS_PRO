import { Outlet } from "react-router-dom";

const AuthLayoutEnterprise = () => {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-100 dark:bg-black">

            {/* LEFT EXPERIENCE PANEL */}
            <div className="relative hidden lg:flex flex-col justify-between overflow-hidden">

                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center scale-105"
                    style={{
                        backgroundImage:
                            "url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80)",
                    }}
                />

                {/* Gradient Overlay Layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900/85 to-black/90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Decorative Floating Lights */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -right-32 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full p-16 text-white">

                    {/* BRAND */}
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-wide">
                            LMS Portal
                        </h1>
                        <p className="text-sm text-gray-300">
                            Enterprise Learning Platform
                        </p>
                    </div>

                    {/* CENTER HERO */}
                    <div className="max-w-lg space-y-8">

                        {/* Headline */}
                        <h2 className="text-5xl font-semibold leading-tight tracking-tight">
                            Shape minds.
                            <br />
                            Build futures.
                            <br />
                            Scale learning.
                        </h2>

                        {/* Description */}
                        <p className="text-lg text-gray-300 leading-relaxed">
                            A next-generation learning management system designed for institutions,
                            instructors, and enterprise teams to deliver world-class education experiences.
                        </p>

                        {/* Feature Highlights */}
                        <div className="grid grid-cols-2 gap-4 mt-6">

                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl">
                                <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full" />
                                <span className="text-sm">Instructor Management</span>
                            </div>

                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl">
                                <span className="w-2.5 h-2.5 bg-pink-400 rounded-full" />
                                <span className="text-sm">Course Analytics</span>
                            </div>

                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl">
                                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                                <span className="text-sm">Student Tracking</span>
                            </div>

                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl">
                                <span className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                                <span className="text-sm">Role-Based Access</span>
                            </div>

                        </div>

                        {/* Trust Signals */}
                        <div className="flex items-center gap-6 mt-8 text-gray-300 text-sm">
                            <span>Trusted by 10,000+ learners</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full" />
                            <span>ISO 27001 Secure</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full" />
                            <span>99.99% Uptime</span>
                        </div>

                    </div>

                    {/* FOOTER */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>© 2026 LMS Portal</span>
                        <span>Privacy • Security • Compliance</span>
                    </div>
                </div>
            </div>

            {/* RIGHT AUTH PANEL */}
            <div className="flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-8">

                {/* Glass Card Container */}
                <div className="
          w-full max-w-md
          bg-white/90 dark:bg-slate-900/95
          backdrop-blur-xl
          rounded-2xl
          shadow-2xl
          border border-gray-100 dark:border-gray-800
          p-10
        ">
                    <Outlet />
                </div>

            </div>

        </div>
    );
};

export default AuthLayoutEnterprise;
