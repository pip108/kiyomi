const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { access_token } = require('./token.json');

const app = express();
const port = parseInt(process.env.PORT);
const host = process.env.HOST;

const proxyOptions = {
   dev: {
      target: 'https://api.myanimelist.net',
      changeOrigin: true,
      pathRewrite: {
         '^/anime': '/v2/anime',
      },
      router: {
         '/kiyomi': 'http://kiyomi-api:3002'
      }
   },
   prod: {
      target: 'https://api.myanimelist.net',
      changeOrigin: true,
      pathRewrite: {
         '^/anime': '/v2/anime',
      }
   }
  
}

app.use('', (req, _, next) => {
   req.headers.authorization = `Bearer ${access_token}`;
   next();
})

app.use('', createProxyMiddleware(process.env.NODE_ENV === 'development' ? proxyOptions.dev : proxyOptions.prod));

app.listen(port, host, () => console.log(`MAL API proxy started on ${host}:${port}`));