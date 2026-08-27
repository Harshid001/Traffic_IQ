/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#04070D',
        surface: '#11151A',
        card: 'rgba(17, 21, 26, 0.95)',
        primary: '#38BDF8',
        'primary-bright': '#7DD3FC',
        'primary-dark': '#0EA5E9',
        fastest: '#FBBF24'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      },
      boxShadow: {
        glow: '0 8px 24px rgba(56, 189, 248, 0.35)',
        'glow-lg': '0 10px 28px rgba(56, 189, 248, 0.5)',
        'glow-xl': '0 16px 48px rgba(56, 189, 248, 0.45)',
        frame: '0 30px 80px rgba(14, 165, 233, 0.25)',
        'card-hover': '0 20px 50px rgba(56, 189, 248, 0.15), 0 0 0 1px rgba(56, 189, 248, 0.2)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.06)'
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.4)' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' }
        },
        routeDash: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' }
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.2)', opacity: '0' }
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(56, 189, 248, 0.3)' },
          '50%': { borderColor: 'rgba(56, 189, 248, 0.7)' }
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        }
      },
      animation: {
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        fadeUp: 'fadeUp 0.55s ease',
        shimmer: 'shimmer 2.5s linear infinite',
        float: 'float 4s ease-in-out infinite',
        slideInLeft: 'slideInLeft 0.4s ease-out',
        slideInRight: 'slideInRight 0.4s ease-out',
        gradientShift: 'gradientShift 6s ease infinite',
        'bounce-dot-1': 'bounceDot 1.2s ease-in-out infinite',
        'bounce-dot-2': 'bounceDot 1.2s ease-in-out 0.15s infinite',
        'bounce-dot-3': 'bounceDot 1.2s ease-in-out 0.3s infinite',
        routeDash: 'routeDash 0.8s linear infinite',
        pulseRing: 'pulseRing 1.8s ease-out infinite',
        borderGlow: 'borderGlow 2.5s ease-in-out infinite',
        countUp: 'countUp 0.6s ease-out both'
      }
    }
  },
  plugins: []
};