export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        darkBg: '#0a0f1a', // SensCritique dark navy
        cardBg: '#121826', // Slightly lighter navy for cards
        accent: '#4CAF50', // SensCritique green
        secondary: '#3b82f6', // Blue for links/buttons
        ratingGood: '#4CAF50',
        ratingMid: '#fbbf24',
        ratingBad: '#ef4444'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: []
}
