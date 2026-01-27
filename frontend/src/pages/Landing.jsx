import { Link } from "react-router-dom";

const Landing = () => {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">

            {/* ================= NAVBAR ================= */}
            <header className="flex justify-between items-center px-10 py-6 border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-2xl font-bold text-indigo-600">
                    LMS Portal
                </h1>

                <div className="flex items-center gap-6">
                    <Link
                        to="/auth/login"
                        className="text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                    >
                        Login
                    </Link>
                    <Link
                        to="/auth/signup"
                        className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow"
                    >
                        Get Started
                    </Link>
                </div>
            </header>

            {/* ================= HERO SECTION ================= */}
            <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">

                {/* Background Orbs */}
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute top-40 -right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                    The Future of
                    <span className="text-indigo-600"> Learning Management</span>
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mb-10">
                    A powerful, secure, and scalable platform to manage courses, instructors,
                    students, analytics, and certifications — all in one modern LMS solution.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/auth/signup"
                        className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-600/30"
                    >
                        Start Free Trial
                    </Link>

                    <Link
                        to="/auth/login"
                        className="px-8 py-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                        Login to Dashboard
                    </Link>
                </div>

                {/* Trust strip */}
                <div className="mt-12 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap justify-center gap-6">
                    <span>Trusted by 10,000+ learners</span>
                    <span>ISO 27001 Certified</span>
                    <span>99.99% Uptime</span>
                    <span>Enterprise Secure</span>
                </div>

            </section>

            {/* ================= FEATURES ================= */}
            <section className="py-24 px-10 bg-gray-50 dark:bg-slate-900">

                <h3 className="text-4xl font-semibold text-center mb-16 text-gray-900 dark:text-white">
                    Everything you need to run a modern LMS
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">

                    {/* Feature Card */}
                    <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow hover:shadow-lg transition">
                        <h4 className="text-xl font-semibold mb-3">Course Management</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Create, organize, schedule, and publish courses with full lifecycle control.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow hover:shadow-lg transition">
                        <h4 className="text-xl font-semibold mb-3">Instructor Portal</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Dedicated dashboards for instructors with content tools and performance insights.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow hover:shadow-lg transition">
                        <h4 className="text-xl font-semibold mb-3">Student Tracking</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Monitor progress, attendance, grades, and certifications in real time.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow hover:shadow-lg transition">
                        <h4 className="text-xl font-semibold mb-3">Analytics & Reports</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Powerful dashboards with insights into engagement, performance, and outcomes.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow hover:shadow-lg transition">
                        <h4 className="text-xl font-semibold mb-3">Role Based Access</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Secure access for admins, instructors, and students with full permission control.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow hover:shadow-lg transition">
                        <h4 className="text-xl font-semibold mb-3">Secure & Scalable</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Enterprise-grade security, cloud scalability, and compliance ready.
                        </p>
                    </div>

                </div>
            </section>

            {/* ================= BENEFITS ================= */}
            <section className="py-24 px-10">

                <h3 className="text-4xl font-semibold text-center mb-16 text-gray-900 dark:text-white">
                    Why institutions choose our LMS
                </h3>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

                    <div>
                        <h4 className="text-2xl font-semibold mb-4">Increase Learning Efficiency</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Automate workflows, reduce administrative overhead, and let educators focus on teaching.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-2xl font-semibold mb-4">Improve Student Outcomes</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Real-time progress tracking ensures students stay engaged and complete courses successfully.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-2xl font-semibold mb-4">Scale Without Limits</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Support thousands of learners simultaneously with cloud-native infrastructure.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-2xl font-semibold mb-4">Enterprise Security</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Industry-standard encryption, compliance, and audit logging for peace of mind.
                        </p>
                    </div>

                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="py-24 px-10 bg-indigo-600 text-white text-center">

                <h3 className="text-4xl font-semibold mb-6">
                    Ready to transform your learning platform?
                </h3>

                <p className="text-lg text-indigo-100 max-w-2xl mx-auto mb-10">
                    Join thousands of institutions and enterprises already managing learning smarter.
                </p>

                <Link
                    to="/auth/signup"
                    className="px-10 py-4 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-gray-100 shadow-lg"
                >
                    Create Free Account
                </Link>

            </section>

            {/* ================= FOOTER ================= */}
            <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
                © 2026 LMS Portal. All rights reserved.
            </footer>

        </div>
    );
};

export default Landing;
