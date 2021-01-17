const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { access_token } = require('./token.json');

const app = express();
const port = 3001;
const host = 'localhost';

const proxyOptions = {
   target: 'https://api.myanimelist.net',
   changeOrigin: true,
   pathRewrite: {
      '^/anime':  '/v2/anime',
   },
   router: {
      '/kiyomi': 'http://localhost:3002'
   }
}

app.use('', (req, _, next) => {
   req.headers.authorization = `Bearer ${access_token}`;
   next();
})

app.use('', createProxyMiddleware(proxyOptions));

app.use('', (_, res, next) => {
   console.log('res', res);
   next();
});

app.listen(port, host, () => console.log(`Starting MAL API Proxy at ${host}:${port}`));