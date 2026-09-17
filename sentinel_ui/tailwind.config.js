/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0B0F17',
        surface: {
          DEFAULT: '#111827',
          card: '#111827',
          hover: '#1A2234',
          track: '#1E293B',
        },
        border: {
          DEFAULT: '#1F2937',
          subtle: '#1F2937',
          muted: '#374151',
        },
        signal: {
          critical: '#DC2626', // Crimson - Reserved for >90 Priority
          amber: '#D97706',    // Muted Amber - Priority 65-89
          emerald: '#059669',  // Forest Emerald - Legitimate Baseline
          cobalt: '#2563EB',   // Cobalt Blue - Selected Node / Tab
        },
        priority: {
          high: '#DC2626',
          med: '#D97706',
          low: '#059669',
          interactive: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Roboto Mono"', 'monospace'],
      },
      transitionTimingFunction: {
        'snappy': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '120': '120ms',
      }
    },
  },
  plugins: [],
}

