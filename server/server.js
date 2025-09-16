/* eslint-disable */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import fs from 'fs';
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

// Caminhos possíveis para a build 'dist' (suporte a diferentes working dirs: /app, /code, etc.)
const possibleDistPaths = [
  path.join(__dirname, '..', 'dist'), // usual: server in /app/server -> dist in /app/dist
  path.join(process.cwd(), 'dist'),   // painel pode usar /code como workdir
  path.join(__dirname, 'dist'),       // caso dist esteja dentro do mesmo diretório
];

let distPath = possibleDistPaths.find(p => fs.existsSync(p));
if (!distPath) {
  console.error('ERROR: pasta dist não encontrada. Verifique se o build foi executado e onde o diretório dist foi gerado. Procurados:', possibleDistPaths);
  // fallback para o primeiro caminho (vai lançar ENOENT ao tentar servir, mas com log claro)
  distPath = possibleDistPaths[0];
} else {
  console.log('Using dist path:', distPath);
}
app.use(express.static(distPath));

// Configuração do proxy
const proxyOptions = {
  auth: {
    target: 'https://bot-account-manager-api.homebroker.com',
    auth: process.env.HB_BASIC_AUTH || process.env.VITE_HB_BASIC_AUTH || 'bWluZHNsdGRhQGdtYWlsLmNvbTo1NF1bRGNvJUR4MHs='
  }
};

// Parse JSON bodies
app.use(express.json());

// Proxies
app.use('/api/hb', createProxyMiddleware({
  target: proxyOptions.auth.target,
  changeOrigin: true,
  pathRewrite: { '^/api/hb': '' },
  onProxyReq: (proxyReq, req, res) => {
    // Adicionar Basic Auth obrigatório para a API
    proxyReq.setHeader('Authorization', `Basic ${proxyOptions.auth.auth}`);
    
    // Garantir que o Content-Type esteja correto
    proxyReq.setHeader('Content-Type', 'application/json');
    
    // Se houver corpo na requisição, reescrever corretamente
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      
      console.log('📤 Proxy request body:', {
        ...req.body,
        password: req.body.password ? '****' : undefined
      });
      
      // Importante: É necessário terminar a escrita do corpo
      proxyReq.write(bodyData);
      proxyReq.end();
    }
    
    console.log(`🔄 Proxy request to ${proxyReq.path} [${proxyReq.method}]`);
    console.log('🔑 Headers:', {
      ...Object.fromEntries(proxyReq.getHeaders()),
      Authorization: 'Basic ****'
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log detalhado da resposta
    console.log(`📡 Proxy response from ${req.path}: ${proxyRes.statusCode}`);
    console.log('📝 Response headers:', proxyRes.headers);
    
    // Se houver erro, logar o corpo da resposta
    if (proxyRes.statusCode >= 400) {
      let responseBody = '';
      proxyRes.on('data', function(chunk) {
        responseBody += chunk;
      });
      proxyRes.on('end', function() {
        try {
          const parsed = JSON.parse(responseBody);
          console.log('❌ Error response:', parsed);
        } catch (e) {
          console.log('❌ Error response (raw):', responseBody);
        }
      });
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