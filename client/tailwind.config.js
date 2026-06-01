/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette exacte de la maquette SailingLoc
        navy: {
          DEFAULT: '#07192E',
          50:  '#e8eef5',
          100: '#c5d4e6',
          200: '#9fb8d5',
          300: '#789cc4',
          400: '#5886b8',
          500: '#3870ac',
          600: '#2d5a8e',
          700: '#155374',   // --ocean de la maquette
          800: '#0E2540',   // --navy2
          900: '#07192E',   // --navy (base)
        },
        cyan: {
          DEFAULT: '#00C6E0',
          light:   '#4DDFF0',
          50:  '#e0f9fc',
          100: '#b3f1f8',
          200: '#80e8f3',
          300: '#4DDFF0',
          400: '#26d6ea',
          500: '#00C6E0',
          600: '#00afc8',
          700: '#0094a8',
          800: '#007a8a',
          900: '#005a66',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#dfc06e',
          dark:    '#a8882c',
        },
        off:   '#F7F5F2',
        smoke: '#EDF1F5',
        muted: '#8896A8',
        dark:  '#1A2535',
        body:  '#3D4D61',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(7,25,46,0.08)',
        'card-hover': '0 16px 48px rgba(7,25,46,0.16)',
        booking: '0 12px 48px rgba(7,25,46,0.14)',
      },
    },
  },
  plugins: [],
};
