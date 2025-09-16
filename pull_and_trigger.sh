#!/bin/bash

# Diretório do projeto
PROJECT_DIR="/etc/easypanel/projects/ux-jc/front/code"

# URL do trigger
TRIGGER_URL="http://145.223.126.91:3000/api/deploy/15628f354205cb49d9878a4975060310834507b89d8d0fdc"

# Navegar até o diretório do projeto
cd "$PROJECT_DIR" || exit

# Fazer pull do repositório
if git pull origin main; then
  echo "Pull realizado com sucesso."
else
  echo "Erro ao realizar o pull." >&2
  exit 1
fi

# Disparar o trigger
if curl -X POST "$TRIGGER_URL"; then
  echo "Trigger disparado com sucesso."
else
  echo "Erro ao disparar o trigger." >&2
  exit 1
fi
