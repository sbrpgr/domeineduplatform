/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px'
      },
      colors: {
        primary: '#1A3C5E',
        accent: '#2E75B6',
        novice: '#86B049',
        beginner: '#0D9BD7',
        intermediate: '#EA8A18',
        advanced: '#D83C3C'
      },
      fontSize: {
        h1: ['40px', { lineHeight: '1.15', fontWeight: '700' }],
        h2: ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        h3: ['24px', { lineHeight: '1.25', fontWeight: '600' }],
        h4: ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.6' }],
        caption: ['12px', { lineHeight: '1.4' }]
      }
    }
  },
  plugins: []
};
