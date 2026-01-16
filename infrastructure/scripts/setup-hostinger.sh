#!/bin/bash
set -e

# =====================================
# 🔧 Setup Hostinger VPS
# =====================================

echo "🔧 Configurando VPS Hostinger para JurisNexo..."

# 1. Atualizar sistema
echo "1. Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar Docker
echo "2. Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# 3. Instalar Docker Compose
echo "3. Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 4. Instalar Certbot (SSL)
echo "4. Instalando Certbot..."
sudo apt install -y certbot

# 5. Criar diretórios
echo "5. Criando diretórios..."
sudo mkdir -p /opt/jurisnexo
sudo mkdir -p /var/www/certbot

# 6. Configurar firewall
echo "6. Configurando firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 7. Gerar certificado SSL (primeira vez)
echo "7. Para gerar certificado SSL, execute:"
echo "   sudo certbot certonly --standalone -d app.jurisnexo.com.br -d api.jurisnexo.com.br"
echo ""
echo "   Depois copie para:"
echo "   sudo cp /etc/letsencrypt/live/app.jurisnexo.com.br/fullchain.pem /opt/jurisnexo/infrastructure/nginx/ssl/"
echo "   sudo cp /etc/letsencrypt/live/app.jurisnexo.com.br/privkey.pem /opt/jurisnexo/infrastructure/nginx/ssl/"

echo ""
echo "✅ Setup concluído! Execute 'newgrp docker' para usar Docker sem sudo."
