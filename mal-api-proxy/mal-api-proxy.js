const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const malTokenTool = require('./mal-token-tool');

const app = express();
const port = parseInt(process.env.PORT);
const host = process.env.HOST;

const mal_basic_auth = {
   username: process.env.MAL_API_CLIENT_ID,
   password: process.env.MAL_API_CLIENT_SECRET
};
const refresh_token = process.env.MAL_API_REFRESH_TOKEN;


const proxyOptions = {
   dev: {
      target: 'https://api.myanimelist.net',
      changeOrigin: true,
      pathRewrite: {
         '^/anime': '/v2/anime',
      },
      router: {
         '/kiyomi': 'http://kiyomi-api:3002'
      },
      onProxyReq: (proxyReq, req, res) => {
         console.log(req.originalUrl);
      }
   },
   prod: {
      target: 'https://api.myanimelist.net',
      changeOrigin: true,
      pathRewrite: {
         '^/anime': '/v2/anime',
      },
      onProxyReq: (proxyReq, req, res) => {
         console.log(req.originalUrl);
      }
   }
}
const proxyMiddlware = createProxyMiddleware(process.env.NODE_ENV === 'development' ? proxyOptions.dev : proxyOptions.prod);

const tokenTool = malTokenTool(mal_basic_auth, refresh_token, () => {

   app.use('', async (req, _, next) => {
      const access_token = await tokenTool.getToken();
      req.headers.authorization = `Bearer ${access_token}`;
      next();
   });

   app.use('', proxyMiddlware);

   app.listen(port, host, () => console.log(`MAL API proxy started on ${host}:${port}`));
});
