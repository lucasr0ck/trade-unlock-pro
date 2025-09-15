/* eslint-disable */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Proxies
app.use('/api/hb', createProxyMiddleware({
  target: 'https://bot-account-manager-api.homebroker.com',
  changeOrigin: true,
  pathRewrite: { '^/api/hb': '' },
  onProxyReq: (proxyReq) => {
    const basic = process.env.HB_BASIC_AUTH || process.env.VITE_HB_BASIC_AUTH || '';
    if (basic) {
      proxyReq.setHeader('Authorization', `Basic ${basic}`);
    }
  },
}));

app.use('/api/hb-wallet', createProxyMiddleware({
  target: 'https://bot-wallet-api.homebroker.com',
  changeOrigin: true,
  pathRewrite: { '^/api/hb-wallet': '' },
}));

app.use('/api/hb-config', createProxyMiddleware({
  target: 'https://bot-configuration-api.homebroker.com',
  changeOrigin: true,
  pathRewrite: { '^/api/hb-config': '' },
}));

app.use('/api/hb-market', createProxyMiddleware({
  target: 'https://bot-market-historic-api.homebroker.com',
  changeOrigin: true,
  pathRewrite: { '^/api/hb-market': '' },
}));

app.use('/api/hb-user', createProxyMiddleware({
  target: 'https://bot-user-api.homebroker.com',
  changeOrigin: true,
  pathRewrite: { '^/api/hb-user': '' },
}));

app.use('/api/hb-trade-edge', createProxyMiddleware({
  target: 'https://trade-api-edge.homebroker.com',
  changeOrigin: true,
  pathRewrite: { '^/api/hb-trade-edge': '' },
}));

app.use('/api/hb-trade', createProxyMiddleware({
  target: 'https://bot-trade-api.homebroker.com',
  changeOrigin: true,
  pathRewrite: { '^/api/hb-trade': '' },
}));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


