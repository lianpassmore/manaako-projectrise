/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Project Rise Palette
        whenua: '#584738',    // Dark Brown (Text)
        kakahu: '#b59e7d',    // Tan (Accents)
        rauhuia: '#f1eada',   // Cream (Background)
        marama: '#aaa396',    // Sage (Secondary)
        papa: '#3a2f26',      // Dark contrast
        
        // Mana Ako Palette
        ako: '#00897B',       // Teal (Primary Action)
        
        // Functional
        forest: '#059669',
        amber: '#f59e0b',
        crisis: '#dc2626',    // Red for exit/crisis
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Lexend Deca"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};