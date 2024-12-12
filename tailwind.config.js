/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A90E2',
        secondary: '#6B7280',
        success: 'rgba(75, 192, 192, 1)',
        warning: 'rgba(255, 159, 64, 1)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      }
    }
  },
  plugins: [],
}
