module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/exchange-data-pdf-qrcode/'
    : '/',
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
