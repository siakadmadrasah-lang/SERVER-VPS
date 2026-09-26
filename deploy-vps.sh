#!/bin/bash
set -e

echo "========================================================"
echo "      VelaVPS Manager - Auto Deploy on VPS Linux        "
echo "========================================================"

APP_DIR="/opt/velavps"

echo "[1/5] Memperbarui dependensi sistem & instalasi git/curl/node..."
apt update -y
apt install -y git curl

# Pastikan Node.js terupgrade ke versi 20 LTS (Debian default repo membawa v18 yang terlalu lama untuk Vite 8)
NODE_MAJOR=0
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
fi

if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "[2/5] Mengupgrade Node.js ke versi 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "[Node.js Version]: $(node -v)"
echo "[NPM Version]: $(npm -v)"

# Install PM2 global untuk auto-start dan menjaga aplikasi tetap hidup 24/7
npm install -g pm2

# Clone atau pull repository
if [ -d "$APP_DIR" ]; then
  echo "[3/5] Memperbarui repository yang sudah ada..."
  cd "$APP_DIR"
  git reset --hard
  git pull origin main
else
  echo "[3/5] Mengunduh repository aplikasi ke $APP_DIR..."
  git clone https://github.com/siakadmadrasah-lang/SERVER-VPS.git "$APP_DIR"
  cd "$APP_DIR"
fi

echo "[4/5] Menginstal paket dependensi & build frontend..."
npm install
npm run build

echo "[5/5] Menjalankan VelaVPS service via PM2 di port 3000..."
# Pastikan port 3000 dibuka di firewall jika ada
which ufw >/dev/null 2>&1 && ufw allow 3000/tcp || true
which iptables >/dev/null 2>&1 && iptables -I INPUT -p tcp --dport 3000 -j ACCEPT || true

pm2 delete velavps 2>/dev/null || true
pm2 start "npm run start" --name velavps
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# Otomatisasi Deteksi NAT & Cloudflare Bridge
echo "[Auto-Detector] Memeriksa topologi jaringan (IP Publik vs NAT)..."
INT_IP=$(hostname -I | awk "{print \$1}")
EXT_IP=$(curl -s -4 ifconfig.me || curl -s -4 icanhazip.com || echo "38.102.126.42")

IS_NAT=false
if [[ "$INT_IP" =~ ^10\. ]] || [[ "$INT_IP" =~ ^192\.168\. ]] || [[ "$INT_IP" =~ ^172\.(1[6-9]|2[0-9]|3[0-1])\. ]]; then
  if [ "$INT_IP" != "$EXT_IP" ]; then
    IS_NAT=true
  fi
fi

if [ "$IS_NAT" = true ]; then
  echo ">>> [NAT DETECTED] Server berada di balik NAT (Internal: $INT_IP, Publik: $EXT_IP)"
  echo ">>> Menjalankan Cloudflare Auto-Bridge agar VelaVPS dan FastPanel langsung terhubung bebas port..."
  
  if ! command -v cloudflared >/dev/null 2>&1; then
    curl -L --output /usr/local/bin/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
    chmod +x /usr/local/bin/cloudflared
  fi

  pkill -f cloudflared || true
  nohup cloudflared tunnel --url http://127.0.0.1:3000 > /tmp/vela_tunnel.log 2>&1 &
  if systemctl is-active fastpanel2 >/dev/null 2>&1 || [ -f /usr/local/fastpanel2/fastpanel ]; then
    nohup cloudflared tunnel --url https://127.0.0.1:8888 --no-tls-verify --http-host-header $EXT_IP:8888 > /tmp/fp_tunnel.log 2>&1 &
  fi

  sleep 5
  VELA_URL=$(grep -o "https://[-a-zA-Z0-9.]*trycloudflare.com" /tmp/vela_tunnel.log | tail -n 1)
  FP_URL=$(grep -o "https://[-a-zA-Z0-9.]*trycloudflare.com" /tmp/fp_tunnel.log 2>/dev/null | tail -n 1 || echo "")
  
  echo ""
  echo "========================================================"
  echo "          VelaVPS AUTO-NAT BRIDGE ONLINE!               "
  echo "========================================================"
  echo "👉 Dashboard VelaVPS : $VELA_URL"
  if [ -n "$FP_URL" ]; then
    echo "👉 FastPanel URL     : $FP_URL"
  fi
  echo "========================================================"
else
  echo ">>> [PUBLIC IP DETECTED] Server memiliki IP publik langsung ($EXT_IP)"
fi
echo "          VelaVPS BERHASIL DIAKTIFKAN DI VPS!           "
echo "========================================================"
echo ""
echo "Akses dashboard kontrol mandiri Anda langsung di browser:"
echo "👉 http://${IP}:3000"
echo ""
echo "Sekarang semua tombol instal panel & ganti OS di web tersebut"
echo "sudah 100% terhubung langsung dan mengeksekusi server Anda!"
echo "========================================================"
