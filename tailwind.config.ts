import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Dark Mode Palette - Futurista e Premium
                background: {
                    DEFAULT: "#0a0a0f",
                    secondary: "#121218",
                    tertiary: "#1a1a24",
                    card: "#16161e",
                },
                primary: {
                    DEFAULT: "#10b981", // InovaSys Green (Emerald)
                    light: "#34d399",
                    dark: "#059669",
                    glow: "rgba(16, 185, 129, 0.3)",
                },
                accent: {
                    DEFAULT: "#22d3ee", // Cyan neon
                    light: "#67e8f9",
                    dark: "#06b6d4",
                    glow: "rgba(34, 211, 238, 0.3)",
                },
                success: {
                    DEFAULT: "#10b981",
                    light: "#34d399",
                    dark: "#059669",
                },
                warning: {
                    DEFAULT: "#f59e0b",
                    light: "#fbbf24",
                    dark: "#d97706",
                },
                danger: {
                    DEFAULT: "#ef4444",
                    light: "#f87171",
                    dark: "#dc2626",
                },
                text: {
                    primary: "#f8fafc",
                    secondary: "#94a3b8",
                    muted: "#64748b",
                },
                border: {
                    DEFAULT: "#2d2d3a",
                    light: "#3d3d4a",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            boxShadow: {
                glow: "0 0 20px rgba(99, 102, 241, 0.3)",
                "glow-accent": "0 0 20px rgba(34, 211, 238, 0.3)",
                "glow-success": "0 0 20px rgba(16, 185, 129, 0.3)",
                "glow-danger": "0 0 20px rgba(239, 68, 68, 0.3)",
                card: "0 4px 20px rgba(0, 0, 0, 0.4)",
                elevated: "0 8px 32px rgba(0, 0, 0, 0.5)",
            },
            backdropBlur: {
                xs: "2px",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
                "slide-down": "slideDown 0.3s ease-out",
                pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                float: "float 3s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideDown: {
                    "0%": { opacity: "0", transform: "translateY(-10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-5px)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
