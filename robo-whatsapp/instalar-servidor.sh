#!/usr/bin/env bash
# Instala o robô do WhatsApp do casamento num servidor Ubuntu (ex.: Oracle Cloud grátis)
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/cezarrocha123/nosso-casamento/main/robo-whatsapp/instalar-servidor.sh | URL="..." TOKEN="..." bash
set -euo pipefail

REPO="https://github.com/cezarrocha123/nosso-casamento.git"
PASTA="$HOME/nosso-casamento"
ROBO="$PASTA/robo-whatsapp"
NUMEROS="${NUMEROS:-Cezar:5584987422956,Liriel:5584988121045}"

echo "==> 1/5 Preparando o sistema"
sudo apt-get update -y -qq
sudo apt-get install -y -qq curl git ca-certificates >/dev/null

# Máquina pequena (1 GB): cria memória extra (swap) para a instalação não travar
if [ "$(free -m | awk '/Mem:/{print $2}')" -lt 2000 ] && ! swapon --show | grep -q /swapfile; then
  echo "    criando 2 GB de swap"
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile >/dev/null && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo "==> 2/5 Instalando Node.js"
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - >/dev/null
  sudo apt-get install -y -qq nodejs >/dev/null
fi
node -v

echo "==> 3/5 Baixando o robô do GitHub"
if [ -d "$PASTA/.git" ]; then git -C "$PASTA" pull -q; else git clone -q --depth 1 "$REPO" "$PASTA"; fi

echo "==> 4/5 Configurando"
if [ -n "${URL:-}" ] && [ -n "${TOKEN:-}" ]; then
  AVISAR=$(echo "$NUMEROS" | tr ',' '\n' | awk -F: 'NF==2{printf "%s    { \"nome\": \"%s\", \"numero\": \"%s\" }", (n++?",\n":""), $1, $2}')
  cat > "$ROBO/config.json" <<EOF
{
  "urlPlanilha": "$URL",
  "token": "$TOKEN",
  "intervaloSegundos": 30,
  "avisar": [
$AVISAR
  ]
}
EOF
  chmod 600 "$ROBO/config.json"
elif [ ! -f "$ROBO/config.json" ]; then
  echo "ERRO: rode de novo informando URL=... e TOKEN=... antes do 'bash'."; exit 1
fi
cd "$ROBO" && npm install --no-audit --no-fund --omit=dev --loglevel=error

echo "==> 5/5 Criando o serviço (liga sozinho e reinicia se cair)"
sudo tee /etc/systemd/system/robo-casamento.service >/dev/null <<EOF
[Unit]
Description=Robo WhatsApp - Casamento Cezar e Liriel
After=network-online.target
Wants=network-online.target

[Service]
User=$USER
WorkingDirectory=$ROBO
ExecStart=$(command -v node) robo.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload

echo
echo "============================================================"
echo " Instalado! Falta só conectar o WhatsApp (uma vez):"
echo
echo "   cd $ROBO && node robo.js"
echo
echo " Escaneie o QR Code. Quando aparecer 'Conectado', aperte Ctrl+C e rode:"
echo
echo "   sudo systemctl enable --now robo-casamento"
echo
echo " Para ver o robô funcionando:  journalctl -fu robo-casamento"
echo "============================================================"
