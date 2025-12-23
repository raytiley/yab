// tailwind.config.ts
import type { Config } from "tailwindcss"
import typography from "@tailwindcss/typography"

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./app/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      typography: {
        retro: {
          css: {
            // Base colors - WCAG AA compliant on #0e0e11 background
            "--tw-prose-body": "#d4d4d4",
            "--tw-prose-headings": "#00ffaa",
            "--tw-prose-lead": "#a1a1aa",
            "--tw-prose-links": "#00ff99",
            "--tw-prose-bold": "#ffffff",
            "--tw-prose-counters": "#9ca3af",
            "--tw-prose-bullets": "#00ffaa",
            "--tw-prose-hr": "rgba(0, 255, 170, 0.2)",
            "--tw-prose-quotes": "#d4d4d4",
            "--tw-prose-quote-borders": "#00ffaa",
            "--tw-prose-captions": "#9ca3af",
            "--tw-prose-code": "#e879f9",
            "--tw-prose-pre-code": "#d4d4d4",
            "--tw-prose-pre-bg": "#1e1e24",
            "--tw-prose-th-borders": "rgba(0, 255, 170, 0.3)",
            "--tw-prose-td-borders": "rgba(0, 255, 170, 0.15)",

            // Apply styles
            color: "var(--tw-prose-body)",
            maxWidth: "65ch",

            // Headings with retro hierarchy
            "h1": {
              color: "#00ffaa",
              fontFamily: "'VT323', 'Courier New', monospace",
            },
            "h2": {
              color: "#d4a574", // Retro gold/amber
              fontFamily: "'VT323', 'Courier New', monospace",
            },
            "h3": {
              color: "#9ca3af",
              fontFamily: "'VT323', 'Courier New', monospace",
            },
            "h4": {
              color: "#9ca3af",
              fontFamily: "'VT323', 'Courier New', monospace",
            },

            // Links
            "a": {
              color: "var(--tw-prose-links)",
              textDecoration: "underline",
              textDecorationColor: "rgba(0, 255, 153, 0.4)",
              "&:hover": {
                textDecorationColor: "rgba(0, 255, 153, 1)",
              },
            },

            // Bold/Strong
            "strong": {
              color: "var(--tw-prose-bold)",
              fontWeight: "700",
            },

            // Code
            "code": {
              color: "var(--tw-prose-code)",
              backgroundColor: "rgba(232, 121, 249, 0.1)",
              padding: "0.125rem 0.25rem",
              borderRadius: "0.25rem",
              fontWeight: "400",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },

            // Pre/Code blocks
            "pre": {
              backgroundColor: "var(--tw-prose-pre-bg)",
              color: "var(--tw-prose-pre-code)",
              border: "1px solid rgba(0, 255, 170, 0.2)",
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
            },

            // Blockquotes
            "blockquote": {
              borderLeftColor: "var(--tw-prose-quote-borders)",
              color: "var(--tw-prose-quotes)",
              fontStyle: "italic",
            },

            // Lists
            "ul > li::marker": {
              color: "var(--tw-prose-bullets)",
            },
            "ol > li::marker": {
              color: "var(--tw-prose-counters)",
            },

            // Horizontal rule
            "hr": {
              borderColor: "var(--tw-prose-hr)",
            },
          },
        },
      },
    },
  },
  plugins: [typography()],
} satisfies Config
