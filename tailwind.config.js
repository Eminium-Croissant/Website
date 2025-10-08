/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Dark glassmorphism color palette
        dark: {
          primary: '#0A0A0F',
          secondary: '#1A1A23',
          tertiary: '#2A2A35',
          surface: 'rgba(30, 30, 40, 0.8)',
          surfaceLight: 'rgba(40, 40, 55, 0.6)',
          text: '#E8E8F0',
          textSecondary: '#B8B8C8',
          textMuted: '#888898',
        },
        // Glassmorphism with dark theme
        glass: {
          primary: 'rgba(255, 255, 255, 0.05)',
          secondary: 'rgba(255, 255, 255, 0.02)',
          accent: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.1)',
          text: 'rgba(255, 255, 255, 0.9)',
          textSecondary: 'rgba(255, 255, 255, 0.7)',
          textMuted: 'rgba(255, 255, 255, 0.5)',
        },
        // Subtle neon accents for dark theme
        neon: {
          blue: '#4A9EFF',
          purple: '#8B5CF6',
          pink: '#EC4899',
          green: '#10B981',
          orange: '#F59E0B',
          yellow: '#EAB308',
          cyan: '#06B6D4',
          indigo: '#6366F1',
        },
        // Star colors
        star: {
          white: '#FFFFFF',
          blue: '#87CEEB',
          yellow: '#FFD700',
          silver: '#C0C0C0',
        },
      },
      fontFamily: {
        genshin: ['Inter', 'system-ui', 'sans-serif'],
        'genshin-display': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(135deg, #0A0A0F 0%, #1A1A23 50%, #2A2A35 100%)',
        'glass-card': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'glass-accent': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'neon-blue': 'linear-gradient(135deg, #4A9EFF 0%, #3B82F6 100%)',
        'neon-purple': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        'neon-pink': 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
        'neon-green': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'star-field': 'radial-gradient(2px 2px at 20px 30px, #FFFFFF, transparent), radial-gradient(2px 2px at 40px 70px, #87CEEB, transparent), radial-gradient(1px 1px at 90px 40px, #FFD700, transparent)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.5)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'glass-glow': '0 0 20px rgba(74, 158, 255, 0.3)',
        'glass-card': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'neon-glow': '0 0 20px rgba(74, 158, 255, 0.4)',
        'glass-soft': '0 4px 20px rgba(0, 0, 0, 0.2)',
        'star-glow': '0 0 10px rgba(255, 255, 255, 0.8)',
      },
      animation: {
        'star-twinkle': 'twinkle 2s ease-in-out infinite alternate',
        'star-shooting': 'shooting 3s linear infinite',
        'star-float': 'float 8s ease-in-out infinite',
        'glass-glow': 'glow 4s ease-in-out infinite alternate',
        'glass-shimmer': 'shimmer 4s linear infinite',
        'glass-pulse': 'pulse 3s ease-in-out infinite',
        'star-field': 'starField 20s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%': { opacity: '0.3', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1.2)' },
        },
        shooting: {
          '0%': { transform: 'translateX(-100vw) translateY(-100vh)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(100vw) translateY(100vh)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(74, 158, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(74, 158, 255, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        starField: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-100px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
