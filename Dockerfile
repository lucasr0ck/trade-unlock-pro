# Multi-stage build tailored for EasyPanel deployments
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies required to build the frontend
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application (sem executar o build durante o postinstall)
ENV NODE_ENV=development
RUN npm run build

# Runtime image
FROM node:18-alpine AS production

WORKDIR /app

# Install only runtime dependencies
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy the build output and the Express server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Allow the non-root user to bind to privileged ports (needed for port 80)
RUN apk add --no-cache libcap && setcap 'cap_net_bind_service=+ep' /usr/local/bin/node

# Create and use an unprivileged user for runtime
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# EasyPanel expects the application on port 80 by default
ENV PORT=80
EXPOSE 80

# Health check endpoint exposed by server/server.js
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Copiar e configurar o script de inicialização
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Executar o script de inicialização
CMD ["/app/start.sh"]
