module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pages: {
    index: {
      entry: './src/pages/Generator/main.js',
      template: 'public/index.html',
      title: 'Generator',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    scanner: {
      entry: './src/pages/Scanner/main.js',
      template: 'public/index.html',
      title: 'Scanner',
      chunks: ['chunk-vendors', 'chunk-common', 'scanner']
    }
  }
}
