# Deploy Guide - Easypanel

## Configuração no Easypanel

### 1. Criar Novo Projeto
- Acesse o Easypanel
- Crie um novo projeto
- Selecione "Docker" como tipo de aplicação

### 2. Configurar Repositório
- **Repository**: `https://github.com/lucasr0ck/trade-unlock-pro`
- **Branch**: `main`
- **Build Context**: `/` (raiz do repositório)

### 3. Variáveis de Ambiente
Configure as seguintes variáveis no Easypanel:

```
HB_BASIC_AUTH=bWluZHNsdGRhQGdtYWlsLmNvbTo1NF1bRGNvJUR4MHs=
VITE_HB_ROLE=hbb
PORT=8080
NODE_ENV=production
```

### 4. Configurações de Build
- **Dockerfile Path**: `Dockerfile`
- **Port**: `8080`
- **Health Check**: `/api/hb/v3/login` (retorna 404, mas confirma que o servidor está rodando)

### 5. Domínio (Opcional)
- Configure um domínio personalizado se desejar
- O app funcionará em qualquer domínio configurado

## Estrutura do Deploy

### Dockerfile
- Multi-stage build para otimização
- Usa Node.js 18 Alpine
- Instala apenas dependências de produção
- Executa como usuário não-root para segurança

### Servidor Express
- Serve arquivos estáticos do build do React
- Proxy para todas as APIs da Homebroker
- Injeta Basic Auth automaticamente no login
- Fallback para API direta se proxy falhar

### Variáveis Importantes
- `HB_BASIC_AUTH`: Token Base64 para autenticação com Homebroker
- `VITE_HB_ROLE`: Role padrão (hbb)
- `PORT`: Porta do servidor (8080)

## Teste Local

Para testar localmente antes do deploy:

```bash
# Build da aplicação
npm run build

# Testar servidor de produção
npm run serve
```

## Monitoramento

O Easypanel fornecerá:
- Logs da aplicação
- Métricas de CPU/Memória
- Status de saúde da aplicação
- Rede e conectividade

## Troubleshooting

### Login não funciona
- Verifique se `HB_BASIC_AUTH` está configurado corretamente
- Confirme que `VITE_HB_ROLE=hbb`

### Erro de CORS
- O servidor Express resolve CORS automaticamente
- Se persistir, verifique se o domínio está configurado corretamente

### Build falha
- Verifique se todas as dependências estão no `package.json`
- Confirme que o Dockerfile está na raiz do repositório
