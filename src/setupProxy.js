const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/storage', // This is the base path you use in your React app
    createProxyMiddleware({
      target: 'https://firebasestorage.googleapis.com', // The URL of Firebase Storage
      changeOrigin: true,
      pathRewrite: {
        '^/api/storage': '', // Remove the base path before forwarding the request
      },
    })
  );
};
