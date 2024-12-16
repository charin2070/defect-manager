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
        danger: 'rgba(255, 99, 132, 1)',
        dark: '#1A1A1A',
        light: '#F8F9FA',
        white: '#FFFFFF',
        black: '#000000',
        gray: {
          100: '#F8F9FA',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#868E96',
          700: '#495057',
          800: '#343A40',
          900: '#212529',
        },
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      }
    }
  },
  plugins: [],
}
