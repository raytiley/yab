// tailwind.config.ts
import type { Config } from "tailwindcss"
import typography from "@tailwindcss/typography"

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      typography: {
        retro: {
          css: {
            "--tw-prose-body": "rgb(179 255 236 / 0.95)",
            "--tw-prose-headings": "rgb(0 204 255)",
            "--tw-prose-links": "rgb(0 255 153)",
            "--tw-prose-code": "rgb(0 255 153)",
            "--tw-prose-hr": "rgb(0 255 153 / 0.2)",
            color: "var(--tw-prose-body)",
            maxWidth: "65ch",
          },
        },
      },
    },
  },
  plugins: [typography()],
} satisfies Config
