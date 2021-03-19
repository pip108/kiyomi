const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
   app.use(
      '/kiyomi',
      createProxyMiddleware({
         target: `http://kiyomi-api:${process.env.API_PORT}`,
         changeOrigin: true,
      })
   );
   app.use(
      '/anime',
      createProxyMiddleware({
         target: `http://kiyomi-api:${process.env.API_PORT}`,
         changeOrigin: true,
      })
   );
};