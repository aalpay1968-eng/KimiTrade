/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trading: {
          bg: {
            primary: '#131722',
            secondary: '#1e222d',
            tertiary: '#2a2e39',
          },
          text: {
            primary: '#d1d4dc',
            secondary: '#787b86',
          },
          up: '#26a69a',
          down: '#ef5350',
          accent: '#2962ff',
          border: '#2a2e39',
          grid: '#2a2e39',
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'monospace'],
      },
      fontSize: {
        '2xs': '10px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
