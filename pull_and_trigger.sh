#!/bin/bash

PROJECT_DIR="/etc/easypanel/projects/ux-jc/front/code"
TRIGGER_URL="http://145.223.126.91:3000/api/deploy/15628f354205cb49d9878a4975060310834507b89d8d0fdc"

cd "$PROJECT_DIR" || exit

echo "🔹 Atualizando repositório..."
if git pull origin main; then
  echo "✅ Pull realizado com sucesso."
else
  echo "❌ Erro ao realizar o pull." >&2
  exit 1
fi

echo "🔹 Disparando trigger do Easypanel..."
if curl -X POST "$TRIGGER_URL"; then
  echo "✅ Trigger disparado com sucesso."
else
  echo "❌ Erro ao disparar o trigger." >&2
  exit 1
fi
