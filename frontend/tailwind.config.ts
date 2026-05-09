import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "var(--color-bg-base)",
          subtle: "var(--color-bg-subtle)",
          elevated: "var(--color-bg-elevated)",
          inverse: "var(--color-bg-inverse)",
        },
        primary: {
          950: "var(--color-primary-950)",
          900: "var(--color-primary-900)",
          800: "var(--color-primary-800)",
          700: "var(--color-primary-700)",
          600: "var(--color-primary-600)",
          500: "var(--color-primary-500)",
          400: "var(--color-primary-400)",
          300: "var(--color-primary-300)",
          200: "var(--color-primary-200)",
          100: "var(--color-primary-100)",
          50: "var(--color-primary-50)",
        },
        accent: {
          900: "var(--color-accent-900)",
          800: "var(--color-accent-800)",
          700: "var(--color-accent-700)",
          600: "var(--color-accent-600)",
          500: "var(--color-accent-500)",
          400: "var(--color-accent-400)",
          300: "var(--color-accent-300)",
          200: "var(--color-accent-200)",
          100: "var(--color-accent-100)",
        },
        status: {
          pending: "var(--color-status-pending)",
          progress: "var(--color-status-progress)",
          solved: "var(--color-status-solved)",
          cancelled: "var(--color-status-cancelled)",
          "pending-bg": "var(--color-status-pending-bg)",
          "progress-bg": "var(--color-status-progress-bg)",
          "solved-bg": "var(--color-status-solved-bg)",
          "cancelled-bg": "var(--color-status-cancelled-bg)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
          accent: "var(--color-text-accent)",
        },
        border: {
          DEFAULT: "var(--color-border-default)",
          subtle: "var(--color-border-subtle)",
          strong: "var(--color-border-strong)",
          focus: "var(--color-border-focus)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      transitionTimingFunction: {
        "out-quart": "var(--ease-out-quart)",
        "in-quart": "var(--ease-in-quart)",
      },
      maxWidth: {
        content: "var(--content-max)",
      },
    },
  },
  plugins: [],
};

export default config;
