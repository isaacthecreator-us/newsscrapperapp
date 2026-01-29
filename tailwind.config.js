/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#4285F4',
          red: '#EA4335',
          yellow: '#FBBC05',
          green: '#34A853',
          darkGray: '#202124',
          lightGray: '#5F6368',
          bgGray: '#F8F9FA',
          borderGray: '#DFE1E5',
          hoverGray: '#E8EAED',
        }
      },
      fontFamily: {
        'google': ['Google Sans', 'Roboto', 'Arial', 'sans-serif'],
      },
      animation: {
        'bounce-delay-1': 'bounce 1.4s ease-in-out 0s infinite',
        'bounce-delay-2': 'bounce 1.4s ease-in-out 0.16s infinite',
        'bounce-delay-3': 'bounce 1.4s ease-in-out 0.32s infinite',
        'bounce-delay-4': 'bounce 1.4s ease-in-out 0.48s infinite',
      }
    },
  },
  plugins: [],
}
