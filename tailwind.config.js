/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      '2xs': '320px',
      xs: '375px',
      sm: '640px',
      md: '768px',
      tablet: '834px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          dark: '#070b14',
          card: '#0d1527',
          border: '#1e293b',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e'
        }
      },
      minHeight: {
        canvas: 'min(52vh, 520px)',
      },
    },
  },
  plugins: [],
}
