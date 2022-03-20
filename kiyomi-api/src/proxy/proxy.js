
const { createProxyMiddleware } = require('http-proxy-middleware');
const getToken = require('./get-token');

const proxy_config = {
   target: 'https://api.myanimelist.net',
   changeOrigin: true,
   pathRewrite: {
      '^/anime': '/v2/anime',
   },
   onProxyReq: (proxyReq, req, res) => {
      console.log(proxyReq.path);
   }
};

module.exports = function (express) {
   return async function () {
      const get_token = await getToken();
      const router = express.Router();

      router.use(async (req, _, next) => {
         const token = await get_token();
         req.headers.Authorization = `Bearer ${token}`;
         console.log(req.path);
         next();
      });

      router.use(createProxyMiddleware(proxy_config));
      return router;
   };
}