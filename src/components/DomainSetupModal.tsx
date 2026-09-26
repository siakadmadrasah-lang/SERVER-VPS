import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import { DomainDnsCheckResult } from '../types/vps';
import {
  Globe,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCw,
  ExternalLink,
  Shield,
  Server,
  FileCode,
  Terminal,
  Zap,
} from 'lucide-react';

interface DomainSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DomainSetupModal: React.FC<DomainSetupModalProps> = ({ isOpen, onClose }) => {
  const { selectedServer, checkDomainDns, setIsCloudflareModalOpen, lang, addToast } = useVps();

  const [customDomain, setCustomDomain] = useState('panel.domainanda.com');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCheckingDns, setIsCheckingDns] = useState(false);
  const [dnsResult, setDnsResult] = useState<DomainDnsCheckResult | null>(null);

  if (!isOpen || !selectedServer) return null;

  const targetIp = selectedServer.ip;

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast(
      lang === 'id' ? 'Disalin' : 'Copied',
      `${label} ${lang === 'id' ? 'berhasil disalin ke clipboard' : 'copied to clipboard'}`,
      'info'
    );
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCheckDns = async () => {
    if (!customDomain.trim()) return;
    setIsCheckingDns(true);
    const result = await checkDomainDns(customDomain.trim(), targetIp);
    setDnsResult(result);
    setIsCheckingDns(false);
    addToast(
      lang === 'id' ? 'Pengecekan DNS Selesai' : 'DNS Lookup Completed',
      result.isMatch
        ? `Domain ${result.domain} telah mengarah ke IP ${targetIp}`
        : `Domain belum terdeteksi mengarah ke IP server.`,
      result.isMatch ? 'success' : 'warning'
    );
  };

  // Nginx Config Template
  const nginxConfig = `server {
    listen 80;
    listen [::]:80;
    server_name ${customDomain.trim()};

    # Reverse proxy ke aplikasi VelaVPS (Port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}`;

  const certbotCommand = `certbot --nginx -d ${customDomain.trim()} --non-interactive --agree-tos --email admin@${customDomain.trim().split('.').slice(-2).join('.')} --redirect`;

  const pm2Command = `npm install -g pm2 && pm2 start npm --name "velavps" -- run dev && pm2 save && pm2 startup`;

  const systemdService = `[Unit]
Description=VelaVPS Management Orchestrator Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/velavps
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=5
Environment=NODE_ENV=production PORT=3000

[Install]
WantedBy=multi-user.target`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {lang === 'id' ? 'Panduan & Setup Domain Kustom untuk Aplikasi' : 'Custom Domain & DNS Setup Guide'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'id'
                  ? `Hubungkan domain Anda agar panel ini dapat diakses via nama domain (misal https://${customDomain})`
                  : `Point your custom domain to this orchestrator with HTTPS Let's Encrypt`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs leading-relaxed">
          {/* Cloudflare Quick Tunnel Shortcut Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="font-semibold text-white block">
                  {lang === 'id' ? 'Ingin Terhubung Otomatis Tanpa Ribet Nginx & Firewall?' : 'Want Automatic Connection Without Complex Nginx & Port Settings?'}
                </span>
                <span className="text-[11px] text-slate-300">
                  {lang === 'id'
                    ? 'Gunakan Cloudflare Quick Tunnel / Zero Trust. 1 perintah langsung dapat URL HTTPS publik tanpa buka port firewall.'
                    : 'Use Cloudflare Tunnel. Direct public HTTPS without opening inbound firewall ports.'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsCloudflareModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-colors self-start sm:self-auto shadow-sm"
            >
              {lang === 'id' ? 'Buka Koneksi Cloudflare' : 'Open Cloudflare'} &rarr;
            </button>
          </div>

          {/* Domain Input & Real-time DNS Checker */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-200 block">
              {lang === 'id' ? 'Masukkan Nama Domain / Subdomain yang Diinginkan:' : 'Desired Domain / Subdomain:'}
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="panel.domainanda.com atau vps.namasitus.id"
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleCheckDns}
                disabled={isCheckingDns}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 transition-colors shrink-0"
              >
                {isCheckingDns ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
                <span>{lang === 'id' ? 'Periksa Propagasi DNS' : 'Check DNS'}</span>
              </button>
            </div>

            {dnsResult && (
              <div
                className={`p-3 rounded-lg border text-xs space-y-1.5 animate-in fade-in ${
                  dnsResult.isMatch
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  {dnsResult.isMatch ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>
                    {dnsResult.isMatch
                      ? `Propagasi Berhasil! ${dnsResult.domain} -> ${dnsResult.targetIp}`
                      : `DNS ${dnsResult.domain} sedang dalam masa propagasi.`}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  Target Server IP: <strong className="text-white">{targetIp}</strong> · Nameserver: {dnsResult.nameserver}
                </div>
              </div>
            )}
          </div>

          {/* STEP 1: DNS Setup Table */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="text-sm font-semibold text-white">
                {lang === 'id' ? 'Langkah 1: Tambahkan DNS A Record di Pengelola Domain (Cloudflare / Registrar)' : 'Step 1: Add DNS A Record at Registrar / Cloudflare'}
              </h3>
            </div>
            <p className="text-slate-400 text-xs">
              {lang === 'id'
                ? `Masuk ke akun tempat Anda membeli domain (Cloudflare, Niagahoster, DomaiNesia, GoDaddy, Namecheap, dll), buka menu DNS Management, lalu tambahkan baris berikut:`
                : `Add this A Record in your DNS provider management panel:`}
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] bg-slate-900/60">
                    <th className="p-3 font-semibold">Tipe Record</th>
                    <th className="p-3 font-semibold">Nama / Host</th>
                    <th className="p-3 font-semibold">Nilai Target (Points To / IPv4)</th>
                    <th className="p-3 font-semibold">TTL</th>
                    <th className="p-3 font-semibold">Proxy Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  <tr>
                    <td className="p-3 font-bold text-sky-400">A</td>
                    <td className="p-3 text-amber-300">
                      {customDomain.split('.')[0] || 'panel'}
                    </td>
                    <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span>{targetIp}</span>
                      <button
                        onClick={() => handleCopy(targetIp, 'dns-ip', 'IP Target')}
                        className="text-slate-400 hover:text-white"
                        title="Salin IP"
                      >
                        {copiedId === 'dns-ip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-3 text-slate-400">Auto (atau 300s)</td>
                    <td className="p-3 text-slate-400">DNS Only (Abu-abu di Cloudflare)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* STEP 2: Nginx Reverse Proxy Setup */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="text-sm font-semibold text-white">
                {lang === 'id' ? 'Langkah 2: Buat Virtual Host Nginx Reverse Proxy' : 'Step 2: Nginx Reverse Proxy Configuration'}
              </h3>
            </div>
            <p className="text-slate-400 text-xs">
              {lang === 'id'
                ? `Buat file konfigurasi di VPS Anda pada /etc/nginx/sites-available/velavps.conf:`
                : `Create this virtual host in /etc/nginx/sites-available/velavps.conf:`}
            </p>

            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-[11px]">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
                <span>/etc/nginx/sites-available/velavps.conf</span>
                <button
                  onClick={() => handleCopy(nginxConfig, 'nginx-conf', 'Konfigurasi Nginx')}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-sans text-xs"
                >
                  {copiedId === 'nginx-conf' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'nginx-conf' ? 'Tersalin' : 'Salin Konfigurasi'}</span>
                </button>
              </div>
              <pre className="p-4 text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">
                {nginxConfig}
              </pre>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <div className="text-slate-400">Perintah untuk mengaktifkan konfigurasi:</div>
              <code className="block text-emerald-300">
                sudo ln -s /etc/nginx/sites-available/velavps.conf /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx
              </code>
            </div>
          </div>

          {/* STEP 3: Free Let's Encrypt SSL */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="text-sm font-semibold text-white">
                {lang === 'id' ? 'Langkah 3: Pasang Sertifikat SSL Gratis (HTTPS)' : 'Step 3: Issue Free Let\'s Encrypt SSL'}
              </h3>
            </div>
            <p className="text-slate-400 text-xs">
              {lang === 'id'
                ? `Jalankan perintah Certbot berikut di terminal VPS Anda untuk mengaktifkan gembok hijau HTTPS aman:`
                : `Run this certbot command to install TLS 1.3 certificate:`}
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 font-mono text-xs">
              <code className="text-emerald-300 truncate">{certbotCommand}</code>
              <button
                onClick={() => handleCopy(certbotCommand, 'certbot-cmd', 'Perintah Certbot')}
                className="flex items-center gap-1 text-slate-400 hover:text-white shrink-0 px-2 py-1 rounded bg-slate-800"
              >
                {copiedId === 'certbot-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin</span>
              </button>
            </div>
          </div>

          {/* STEP 4: Background Service Daemon (PM2 / Systemd) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                4
              </span>
              <h3 className="text-sm font-semibold text-white">
                {lang === 'id' ? 'Langkah 4: Menjalankan Aplikasi 24/7 (Daemon PM2 / Systemd)' : 'Step 4: Keep App Running 24/7 (Daemon)'}
              </h3>
            </div>
            <p className="text-slate-400 text-xs">
              {lang === 'id'
                ? `Agar aplikasi tidak mati saat sesi SSH ditutup, gunakan PM2 untuk menjaga proses selalu hidup saat server reboot:`
                : `Keep the Node.js dev server active 24/7 with PM2:`}
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 font-mono text-xs">
              <code className="text-amber-300 truncate">{pm2Command}</code>
              <button
                onClick={() => handleCopy(pm2Command, 'pm2-cmd', 'Perintah PM2')}
                className="flex items-center gap-1 text-slate-400 hover:text-white shrink-0 px-2 py-1 rounded bg-slate-800"
              >
                {copiedId === 'pm2-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-slate-500 text-xs">
            Akses: <strong className="text-white">https://{customDomain.trim()}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors shadow-sm"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
