module.exports = {
      content: ['./src/**/*.tsx'],
      darkMode: 'class',
    theme: {
      extend: {
        colors: {
          transparent: 'transparent',
          current: 'currentColor',
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
          'red' : '#FF0000',
          

        }
      },
    },
    variants: {
   
    },
    plugins: [require('flowbite/plugin')

    ],
    future: {
      removeDeprecatedGapUtilities: true,
      purgeLayersByDefault: true
    }
  };