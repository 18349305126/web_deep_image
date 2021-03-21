module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  devServer: {
    port: 3000,
    open: true,
    proxy: {
      '^/project': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true // 允许跨域
      }
    }
  },
  lintOnSave: process.env.NODE_ENV !== 'production'
}
