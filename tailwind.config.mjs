/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        whenua: '#584738',    // Deep Earth Brown
        kakahu: '#b59e7d',    // Tan/Flax
        rauhuia: '#f9f9f7',   // Lighter Cream (Paper-like)
        marama: '#aaa396',    // Sage/Stone
        papa: '#3a2f26',      // Darkest Brown
        ako: '#00897B',       // Teal
        crisis: '#D84315',    // Terracotta
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'sans-serif'], // Ensure you have @fontsource-variable/inter installed
      },
      backgroundImage: {
        // Poutama pattern by Lee
        'niho-pattern': `url("/Poutama.svg")`,
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)', // Slower, smoother ease
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};