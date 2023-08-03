/** @type {import('tailwindcss').Config} */
module.exports = {
      content: [
      './src/webparts/**/*.tsx',],
      darkMode: 'class',
    theme: {
      borderRadius: {
        'none': '30px',
        'sm': '0.125rem',
        DEFAULT: '30px',
        'md': '0.375rem',
        'lg': '0.5rem',
        'full': '9999px',
        'large': '12px',
      },
      extend: {
        colors: {
          'white': '#ffffff',
          'Princeton-Orange': '#f47c28',
          'Sandy-Brown': '#F7A369',
          'Deep-Peach': '#FBCBA9',
          'Metallic-Blue': '#375C7A',
          'Shadow-Blue': '#728DA1',
          'Pastel-Blue': '#AEBEC9',
          'Jet':'#363636',
          'Granite-Gray': '#656564',
          'Philippine-Gray': '#929292',
          'Argent':'#C2C1C1',
          'Cultured':'#F5F5F5',
          
          

        }
      },
    },
    variants: { 
    },
    plugins: [require('flowbite/plugin'),
    

    ],
    future: {
      removeDeprecatedGapUtilities: true,
      purgeLayersByDefault: true
    }
  };