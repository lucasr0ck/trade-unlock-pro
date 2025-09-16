#!/bin/sh

# Construir a imagem Docker
docker build -t trade-unlock-pro .

# Parar o contêiner existente se houver
docker stop trade-unlock-pro || true
docker rm trade-unlock-pro || true

# Executar o novo contêiner
docker run -d --name trade-unlock-pro \
  -p 80:80 \
  --restart unless-stopped \
  trade-unlock-pro