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
        // A subtle repeating triangle pattern (Niho Taniwha)
        'niho-pattern': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20L40 0H0L20 20ZM20 20L40 40H0L20 20Z' fill='%23584738' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
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