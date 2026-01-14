import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        background: '#0a0a1a',
        surface: '#121225',
        pokemon: {
          yellow: '#FFCB05',
          gold: '#C7A008',
          blue: '#3B4CCA',
          lightBlue: '#6890F0',
          dark: '#1a1a2e',
          darker: '#0f0f1a',
          red: '#FF0000',
          electric: '#F8D030',
        },
        primary: {
          DEFAULT: '#FFCB05',
          foreground: '#0a0a1a',
        },
        accent: {
          DEFAULT: '#3B4CCA',
          glow: 'rgba(255, 203, 5, 0.3)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 1.5s ease-in-out infinite',
        'glow-intense': 'glowIntense 0.5s ease-in-out infinite',
        'shake': 'shake 0.1s ease-in-out infinite',
        'sparkle': 'sparkle 1s ease-in-out infinite',
        'evolution-flash': 'evolutionFlash 0.3s ease-out',
        'bob': 'bob 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(255, 203, 5, 0.5))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(255, 203, 5, 0.9))' },
        },
        glowIntense: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(255, 203, 5, 0.8)) brightness(1.2)' },
          '50%': { filter: 'drop-shadow(0 0 30px rgba(255, 203, 5, 1)) brightness(1.5)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-3px)' },
          '75%': { transform: 'translateX(3px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        evolutionFlash: {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'pokemon-gradient': 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
      },
      boxShadow: {
        'pokemon-glow': '0 0 20px rgba(255, 203, 5, 0.5)',
        'pokemon-glow-intense': '0 0 40px rgba(255, 203, 5, 0.8)',
        'blue-glow': '0 0 20px rgba(59, 76, 202, 0.5)',
      },
    },
  },
  plugins: [],
}
export default config
