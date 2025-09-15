/* eslint-disable */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
// Porta padrão (será utilizada pelo container interno). Usar 8080 para evitar necessidade de root ao bindar porta <1024
// Usar a porta definida pelo ambiente (EasyPanel define process.env.PORT). Mantemos fallback para 3000 em desenvolvimento local, mas imprimimos um aviso se não fornecido.
const portEnv = process.env.PORT;
if (!portEnv) {
  console.warn('Warning: process.env.PORT não definido. Usando fallback 3000 para desenvolvimento local. Em produção (EasyPanel) a porta deve ser fornecida via env.');
}
const port = portEnv || 3000;

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

// Health endpoint para EasyPanel
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// SPA fallback - usar middleware sem parâmetro de rota para evitar erros do path-to-regexp
app.use((req, res, next) => {
  // Apenas servir index.html para requisições GET que aceitam HTML
  if (req.method === 'GET' && req.headers.accept && req.headers.accept.includes('text/html')) {
    res.sendFile(path.join(distPath, 'index.html'));
    return;
  }
  next();
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});