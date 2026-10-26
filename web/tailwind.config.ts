import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F7F3EA',
        paper: '#FCFAF5',
        forest: {
          DEFAULT: '#1F3D33',
          deep: '#152B24',
        },
        gold: '#B08D57',
        ink: '#1B1B1B',
        muted: '#6B6B6B',
        line: '#E5DED0',
      },
      fontFamily: {
        serif: ['"Newsreader Variable"', 'Georgia', 'serif'],
        sans: ['"Manrope Variable"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 24px 70px rgba(31, 61, 51, 0.10)',
      },
    },
  },
  plugins: [],
};

export default config;
