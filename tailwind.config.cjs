module.exports = {
  content: ['./index.html', './assets/page-editor.js'],
  theme: {
    extend: {
      colors: {
        studio: '#ece1d2', panel: '#f7f1e8', accent: '#817264',
        accentHover: '#706254', muted: '#6c6256', bone: '#302b25', danger: '#9e4242'
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'], serif: ['Playfair Display', 'serif'], sans: ['Inter', 'sans-serif']
      }
    }
  }
};
