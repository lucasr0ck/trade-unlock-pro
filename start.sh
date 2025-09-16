#!/bin/sh

# Configurar variáveis de ambiente se não estiverem definidas
export PORT=${PORT:-80}
export NODE_ENV=${NODE_ENV:-production}
export VITE_HB_ROLE=${VITE_HB_ROLE:-hbb}

# Iniciar o servidor
node server/server.js