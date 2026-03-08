/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F4F7FB",
                primary: "#5B8DEF",
                secondary: "#FF8FA3",
                success: "#4FD1C5",
                card: "#FFFFFF",
                textPrimary: "#1F2937",
                textSecondary: "#6B7280",
            },
            boxShadow: {
                clay: "8px 8px 16px rgba(0,0,0,0.08), -8px -8px 16px rgba(255,255,255,0.9)",
            },
            borderRadius: {
                clay: "28px",
            }
        },
    },
    plugins: [],
}
