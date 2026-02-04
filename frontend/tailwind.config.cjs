/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'lms-cream': '#F9F7F7',
                'lms-light-blue': '#DBE2EF',
                'lms-blue': '#3F72AF',
                'lms-dark-blue': '#112D4E',
            },
        },
    },
    plugins: [],
};
