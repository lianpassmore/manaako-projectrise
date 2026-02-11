/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        whenua: '#584738',
        kakahu: '#b59e7d',
        rauhuia: '#f9f9f7',
        marama: '#aaa396',
        papa: '#3a2f26',
        ako: '#00897B',
        crisis: '#D84315',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'sans-serif'],
      },
      backgroundImage: {
        'niho-pattern': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20L40 0H0L20 20ZM20 20L40 40H0L20 20Z' fill='%23584738' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'orb-pulse': 'orbPulse 3s infinite ease-in-out',
        'orb-speak': 'orbSpeak 0.8s infinite ease-in-out',
        'ring-breathe': 'ringBreathe 4s infinite linear',
        'ring-speak': 'ringSpeak 1.5s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        orbPulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(0, 137, 123, 0.3)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(0, 137, 123, 0.5)' },
        },
        orbSpeak: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        ringBreathe: {
          '0%': { transform: 'scale(0.9) rotate(0deg)', opacity: '0.3' },
          '50%': { transform: 'scale(1.1) rotate(2deg)', opacity: '0.6' },
          '100%': { transform: 'scale(0.9) rotate(0deg)', opacity: '0.3' },
        },
        ringSpeak: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
