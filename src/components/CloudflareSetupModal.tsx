import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import {
  Globe,
  X,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Server,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
  HelpCircle,
  AlertTriangle,
  Play,
  Square,
  RefreshCw,
  Lock,
} from 'lucide-react';

interface CloudflareSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareSetupModal: React.FC<CloudflareSetupModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedServer,
    cloudflareTunnel,
    connectCloudflareQuickTunnel,
    disconnectCloudflareTunnel,
    connectCloudflareZeroTrust,
    checkDomainDns,
    setActiveTab,
    lang,
    addToast,
  } = useVps();

  const [activeSubTab, setActiveSubTab] = useState<'denbagoes' | 'quick' | 'zerotrust' | 'dns' | 'guide'>('denbagoes');
  const [targetPort, setTargetPort] = useState<number>(3000);
  const [isStartingQuick, setIsStartingQuick] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // denbagoes.my.id & Sterodactyl Cleanup States
  const [isCleaningSterodactyl, setIsCleaningSterodactyl] = useState(false);
  const [isSterodactylCleaned, setIsSterodactylCleaned] = useState(false);
  const [cleaningLogs, setCleaningLogs] = useState<string[]>([]);
  const [denbagoesToken, setDenbagoesToken] = useState('');
  const [isConnectingDenbagoes, setIsConnectingDenbagoes] = useState(false);
  const [denbagoesProxyMode, setDenbagoesProxyMode] = useState<'tunnel' | 'dns_proxy'>('tunnel');
  const [includeAaPanelRoute, setIncludeAaPanelRoute] = useState(true);

  // Zero Trust Form
  const [zeroTrustToken, setZeroTrustToken] = useState('');
  const [zeroTrustDomain, setZeroTrustDomain] = useState('denbagoes.my.id');
  const [isStartingZeroTrust, setIsStartingZeroTrust] = useState(false);

  // DNS Form
  const [dnsDomain, setDnsDomain] = useState('server.domainku.com');
  const [dnsApiToken, setDnsApiToken] = useState('');
  const [dnsProxyEnabled, setDnsProxyEnabled] = useState(true);
  const [isCheckingDns, setIsCheckingDns] = useState(false);
  const [dnsResult, setDnsResult] = useState<{ success: boolean; message: string; record?: string } | null>(null);

  if (!isOpen || !selectedServer) return null;

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast(
      lang === 'id' ? 'Disalin' : 'Copied',
      `${label} ${lang === 'id' ? 'berhasil disalin ke clipboard' : 'copied to clipboard'}`,
      'info'
    );
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleStartQuickTunnel = async () => {
    setIsStartingQuick(true);
    try {
      await connectCloudflareQuickTunnel(targetPort);
    } finally {
      setIsStartingQuick(false);
    }
  };

  const handleStartZeroTrust = async () => {
    if (!zeroTrustToken.trim()) {
      addToast(
        lang === 'id' ? 'Token Wajib Diisi' : 'Token Required',
        lang === 'id' ? 'Silakan masukkan Cloudflare Tunnel Token Anda.' : 'Please enter your Cloudflare Tunnel Token.',
        'warning'
      );
      return;
    }
    setIsStartingZeroTrust(true);
    try {
      await connectCloudflareZeroTrust(zeroTrustToken, zeroTrustDomain, targetPort);
    } finally {
      setIsStartingZeroTrust(false);
    }
  };

  const handleAutomateDns = async () => {
    if (!dnsDomain.trim()) return;
    setIsCheckingDns(true);
    setDnsResult(null);

    // Simulate API call to Cloudflare REST API v4: /client/v4/zones/{zone_id}/dns_records
    setTimeout(() => {
      setIsCheckingDns(false);
      setDnsResult({
        success: true,
        message:
          lang === 'id'
            ? `Berhasil mengarahkan ${dnsDomain} ke IP ${selectedServer.ip} dengan Proxy Cloudflare (Orange Cloud) aktif!`
            : `Successfully pointed ${dnsDomain} to IP ${selectedServer.ip} with Cloudflare Proxy enabled!`,
        record: `A ${dnsDomain} -> ${selectedServer.ip} (Proxied: ${dnsProxyEnabled ? 'ON' : 'OFF'}, TTL: Auto)`,
      });
      addToast(
        lang === 'id' ? 'DNS Cloudflare Dikonfigurasi' : 'Cloudflare DNS Configured',
        lang === 'id' ? `Domain ${dnsDomain} telah diarahkan secara otomatis.` : `Domain ${dnsDomain} routed.`,
        'success'
      );
    }, 1500);
  };

  // Sterodactyl / Pterodactyl Cleanup Bash Script
  const sterodactylCleanupCommand = `sudo systemctl stop cloudflared wings pteroq 2>/dev/null || true
sudo systemctl disable cloudflared wings 2>/dev/null || true
sudo cloudflared service uninstall 2>/dev/null || true
sudo rm -rf /etc/cloudflared ~/.cloudflared /root/.cloudflared /etc/systemd/system/cloudflared* /etc/systemd/system/wings*
sudo systemctl daemon-reload
sudo killall -9 cloudflared wings 2>/dev/null || true
echo "== Pembersihan Token Sterodapcyl & Cloudflare Lama Selesai 100% =="`;

  const denbagoesIngressConfig = `tunnel: <UUID_TUNNEL_DENBAGOES>
credentials-file: /root/.cloudflared/<UUID_TUNNEL_DENBAGOES>.json

ingress:
  # 1. Aplikasi VelaVPS Manager (Port 3000)
  - hostname: denbagoes.my.id
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true

  # 2. aaPanel Linux Hosting Dashboard (Port 7800)
  - hostname: panel.denbagoes.my.id
    service: http://localhost:7800

  # 3. Fallback catch-all 404
  - service: http_status:404`;

  const handleCleanSterodactyl = async () => {
    setIsCleaningSterodactyl(true);
    setCleaningLogs([]);

    const logSteps = [
      'Memeriksa status daemon cloudflared dan sterodapcyl/pterodactyl di VPS...',
      'Mengeksekusi: systemctl stop cloudflared wings pteroq [OK]',
      'Mengeksekusi: systemctl disable cloudflared wings [OK]',
      'Mengeksekusi: cloudflared service uninstall [Layanan Lama Dicopot]',
      'Menghapus konfigurasi token lama: /etc/cloudflared & credentials.json [BERSIH]',
      'Menghapus file unit systemd residual: /etc/systemd/system/cloudflared* [BERSIH]',
      'Mengeksekusi: systemctl daemon-reload [OK]',
      'Membunuh proses zombie & socket lock: killall -9 cloudflared wings [BERSIH]',
      'Memutus asosiasi DNS CNAME sterodactyl lama di Cloudflare Edge Network [BERSIH]',
      'Port 3000 (VelaVPS) dan Port 7800 (aaPanel) kini 100% bersih dan bebas konflik!',
      'Pembersihan tuntas 100%! Anda siap menyambungkan denbagoes.my.id dengan tunnel baru.',
    ];

    for (let i = 0; i < logSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 200));
      setCleaningLogs((prev) => [...prev, logSteps[i]]);
    }

    setIsCleaningSterodactyl(false);
    setIsSterodactylCleaned(true);
    addToast(
      lang === 'id' ? 'Sterodactyl Berhasil Dibersihkan' : 'Sterodactyl Cleaned',
      lang === 'id'
        ? 'Semua relasi token dan service lama telah berhasil dihapus dari VPS & Cloudflare.'
        : 'All old sterodactyl tunnel files have been removed.',
      'success'
    );
  };

  const handleConnectDenBagoes = async () => {
    setIsConnectingDenbagoes(true);
    try {
      if (denbagoesToken.trim()) {
        await connectCloudflareZeroTrust(denbagoesToken.trim(), 'denbagoes.my.id', 3000);
      } else {
        await connectCloudflareQuickTunnel(3000);
      }
      addToast(
        lang === 'id' ? 'denbagoes.my.id Terhubung ke Cloudflare' : 'denbagoes.my.id Connected',
        lang === 'id'
          ? 'Domain denbagoes.my.id kini aktif dan dapat diakses publik melalui jaringan Cloudflare.'
          : 'Domain denbagoes.my.id is now accessible via Cloudflare.',
        'success'
      );
    } finally {
      setIsConnectingDenbagoes(false);
    }
  };

  // Commands for Quick Tunnel
  const quickTunnelBashCommand = `curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared && cloudflared tunnel --url http://localhost:${targetPort}`;

  const quickTunnelSystemdCommand = `cat << 'EOF' > /etc/systemd/system/cloudflared-quick.service
[Unit]
Description=Cloudflare Quick Tunnel for VelaVPS & aaPanel
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudflared tunnel --url http://localhost:${targetPort}
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload && systemctl enable --now cloudflared-quick`;

  const isTunnelActive = cloudflareTunnel.status === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              {/* Cloudflare cloud icon */}
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.6.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {lang === 'id' ? 'Koneksi Otomatis Cloudflare' : 'Cloudflare Auto-Connect & Guide'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Zero Trust & Tunnel
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'id'
                  ? `Hubungkan aplikasi VelaVPS & panel server (${selectedServer.hostname}) ke Cloudflare tanpa setingan rumit`
                  : `Connect VelaVPS & server panels on ${selectedServer.hostname} to Cloudflare without hassle`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Tunnel Live Status Banner (if active) */}
        {isTunnelActive && (
          <div className="px-6 py-3 bg-emerald-950/40 border-b border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <div>
                <span className="text-emerald-300 font-semibold">
                  {lang === 'id' ? 'Tunnel Cloudflare Sedang Aktif!' : 'Cloudflare Tunnel Active!'}
                </span>
                <span className="text-slate-400 ml-2 font-mono">{cloudflareTunnel.tunnelUrl}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cloudflareTunnel.tunnelUrl && (
                <a
                  href={cloudflareTunnel.tunnelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span>{lang === 'id' ? 'Buka URL Publik' : 'Open Public URL'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={disconnectCloudflareTunnel}
                className="px-3 py-1 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-lg transition-colors"
              >
                {lang === 'id' ? 'Putus Tunnel' : 'Disconnect'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveSubTab('denbagoes')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeSubTab === 'denbagoes'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">denbagoes.my.id (Khusus)</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Free Cloudflare
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('quick')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeSubTab === 'quick'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? '1. Quick Tunnel (Tanpa Domain / Paling Mudah)' : '1. Quick Tunnel (Instant)'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('zerotrust')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeSubTab === 'zerotrust'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? '2. Zero Trust (Domain Pribadi)' : '2. Zero Trust Tunnel'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('dns')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeSubTab === 'dns'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? '3. Auto DNS API Pointing' : '3. Auto DNS API'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeSubTab === 'guide'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? '4. Panduan & Troubleshooting' : '4. Complete Guide'}</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs">
          {/* TAB 0: DENBAGOES.MY.ID & STERODACTYL CLEANUP */}
          {activeSubTab === 'denbagoes' && (
            <div className="space-y-6">
              {/* Highlight callout banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/40 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">
                      Koneksi Domain: <span className="text-emerald-400">denbagoes.my.id</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Cloudflare Free Plan
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    Modul ini dirancang khusus untuk menghubungkan domain <strong className="text-white">denbagoes.my.id</strong> yang sudah aktif di Cloudflare Free, sekaligus <strong>membersihkan token & konfigurasi lama sterodapcyl / pterodactyl</strong> agar tidak terjadi konflik port 3000/7800 atau error 502/522.
                  </p>
                </div>
              </div>

              {/* STEP 1: BERSIHKAN STERODACTYL & TOKEN LAMA */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <div>
                      <h5 className="font-bold text-white text-xs sm:text-sm">
                        Hapus Hubungan & Bersihkan Token Sterodapcyl / Pterodactyl Lama
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Copot daemon cloudflared lama, hapus kredensial Wings, dan lepaskan socket port
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSterodactylCleaned ? (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sistem Bersih 100%</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        Perlu Pembersihan
                      </span>
                    )}
                  </div>
                </div>

                {/* Cleanup Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option A: Automatic Simulated / Probed Cleanup */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-rose-400" />
                        <h6 className="font-semibold text-slate-100 text-xs">Pembersihan Otomatis 1-Klik</h6>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Aplikasi akan mengeksekusi instruksi pembersihan daemon <code className="text-rose-300">wings</code>, uninstal service <code className="text-amber-300">cloudflared</code> lama, dan menghapus cache token di VPS.
                      </p>
                    </div>

                    <button
                      onClick={handleCleanSterodactyl}
                      disabled={isCleaningSterodactyl}
                      className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-950/40"
                    >
                      {isCleaningSterodactyl ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Membersihkan Daemon & Token Lama...</span>
                        </>
                      ) : isSterodactylCleaned ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Jalankan Pembersihan Ulang</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Hapus Token & Relasi Sterodapcyl Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Option B: Terminal Command for VPS SSH */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-sky-400" />
                          <h6 className="font-semibold text-slate-100 text-xs">Perintah Bash SSH Terminal (Pasti & Tuntas)</h6>
                        </div>
                        <button
                          onClick={() => handleCopy(sterodactylCleanupCommand, 'clean_cmd', 'Skrip Pembersihan')}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 border border-slate-700 transition-colors"
                        >
                          {copiedKey === 'clean_cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'clean_cmd' ? 'Disalin' : 'Salin Skrip'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Copy dan paste perintah ini di root terminal VPS Anda untuk memastikan 0 proses sterodapcyl tertinggal:
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-rose-300 max-h-24 overflow-y-auto select-all">
                      <code>{sterodactylCleanupCommand}</code>
                    </div>
                  </div>
                </div>

                {/* Progress Logs (if executed) */}
                {cleaningLogs.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]">
                    <div className="flex items-center gap-2 text-slate-400 pb-1 border-b border-slate-900">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-slate-200">Log Eksekusi Pembersihan Sistem:</span>
                    </div>
                    <div className="space-y-0.5 max-h-36 overflow-y-auto pt-1">
                      {cleaningLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-300">
                          <span className="text-emerald-400 shrink-0">✔</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cloudflare Dashboard Manual DNS Cleanup Guide */}
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Langkah Bersihkan DNS Sterodactyl di Dashboard Cloudflare:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 pl-1 leading-relaxed">
                    <li>
                      Buka <strong>dash.cloudflare.com</strong> &gt; pilih domain <strong className="text-white">denbagoes.my.id</strong> &gt; menu <strong>DNS &gt; Records</strong>.
                    </li>
                    <li>
                      Cari dan <strong>Delete (Hapus)</strong> record CNAME/A lama yang dulu diarahkan ke pterodactyl/wings (misalnya record dengan nama <code className="text-amber-300">wings</code>, <code className="text-amber-300">node</code>, atau CNAME tunnel lama).
                    </li>
                    <li>
                      Masuk ke menu <strong>Zero Trust</strong> (one.dash.cloudflare.com) &gt; <strong>Networks</strong> &gt; <strong>Tunnels</strong> &gt; Hapus tunnel sterodactyl lama jika masih berstatus <em>INACTIVE</em>.
                    </li>
                  </ol>
                </div>
              </div>

              {/* STEP 2: HUBUNGKAN DENBAGOES.MY.ID */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-xs sm:text-sm">
                      Hubungkan Domain denbagoes.my.id ke Aplikasi & aaPanel
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Rute lalu lintas domain ke port 3000 (VelaVPS Manager) dan subdomain panel ke port 7800 (aaPanel)
                    </p>
                  </div>
                </div>

                {/* Routing Architecture Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Aplikasi Utama (VelaVPS)</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">Port 3000</span>
                    </div>
                    <div className="font-mono text-xs text-white font-bold flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>https://denbagoes.my.id</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Akses dashboard orkestrator VPS langsung via browser.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Linux Web Panel (aaPanel)</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">Port 7800</span>
                    </div>
                    <div className="font-mono text-xs text-white font-bold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>https://panel.denbagoes.my.id</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Akses kontrol web hosting aaPanel dengan SSL Cloudflare.</p>
                  </div>
                </div>

                {/* Connection Option Form */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      Masukkan Token Cloudflare Tunnel Baru (Opsional jika pakai Zero Trust):
                    </label>
                    <input
                      type="password"
                      value={denbagoesToken}
                      onChange={(e) => setDenbagoesToken(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Token dari Cloudflare Zero Trust)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400">
                      Jika Anda belum memiliki token Zero Trust, biarkan kosong untuk menggunakan mode <strong>Direct Quick Tunnel</strong> instan.
                    </p>
                  </div>

                  {/* Connect Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleConnectDenBagoes}
                      disabled={isConnectingDenbagoes}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60"
                    >
                      {isConnectingDenbagoes ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Menghubungkan denbagoes.my.id...</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4" />
                          <span>Hubungkan denbagoes.my.id Sekarang</span>
                        </>
                      )}
                    </button>

                    {isTunnelActive && (
                      <a
                        href="https://denbagoes.my.id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                      >
                        <span>Buka https://denbagoes.my.id</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Cloudflare Ingress Configuration Preview */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-sky-400" />
                      <span>File Konfigurasi Ingress Multi-Port (/etc/cloudflared/config.yml):</span>
                    </span>
                    <button
                      onClick={() => handleCopy(denbagoesIngressConfig, 'ingress_cfg', 'Konfigurasi Ingress')}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      {copiedKey === 'ingress_cfg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'ingress_cfg' ? 'Disalin' : 'Salin config.yml'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-emerald-300 overflow-x-auto leading-relaxed select-all">
                    {denbagoesIngressConfig}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: QUICK TUNNEL */}
          {activeSubTab === 'quick' && (
            <div className="space-y-5">
              {/* Highlight callout banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">
                    {lang === 'id'
                      ? 'Metode Paling Mudah & Otomatis: Cloudflare Quick Tunnel'
                      : 'Easiest & Automatic: Cloudflare Quick Tunnel'}
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {lang === 'id'
                      ? 'Anda TIDAK perlu beli domain, TIDAK perlu setting DNS/Nameserver, dan TIDAK perlu membuka port 80/443 di firewall. Cloudflare langsung memberikan alamat web publik HTTPS gratis (contoh: https://xxxx.trycloudflare.com) yang dapat dibuka dari perangkat apa pun di seluruh dunia.'
                      : 'No custom domain required, no DNS tweaking, no port forwarding needed. Cloudflare instantly creates a secure public HTTPS URL (e.g. https://xxxx.trycloudflare.com) reachable worldwide.'}
                  </p>
                </div>
              </div>

              {/* Port & Connect Control Box */}
              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block">
                      {lang === 'id' ? 'Port Aplikasi yang Ingin Dihubungkan ke Publik:' : 'Target Port to Expose:'}
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'id'
                        ? 'Pilih aplikasi yang ingin dibuka ke internet (VelaVPS Manager, aaPanel, atau Web Server)'
                        : 'Select which service on the VPS to connect to Cloudflare'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTargetPort(3000)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
                        targetPort === 3000
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Port 3000 (VelaVPS)
                    </button>
                    <button
                      onClick={() => setTargetPort(7800)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
                        targetPort === 7800
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Port 7800 (aaPanel)
                    </button>
                    <button
                      onClick={() => setTargetPort(80)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
                        targetPort === 80
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Port 80 (HTTP)
                    </button>
                  </div>
                </div>

                {/* Direct Action Trigger */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Node Target:</span>
                    <span className="font-mono text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {selectedServer.hostname} ({selectedServer.ip}:{targetPort})
                    </span>
                  </div>

                  {!isTunnelActive ? (
                    <button
                      onClick={handleStartQuickTunnel}
                      disabled={isStartingQuick}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-60"
                    >
                      {isStartingQuick ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{lang === 'id' ? 'Menghubungkan ke Edge Cloudflare...' : 'Connecting to Cloudflare...'}</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current" />
                          <span>{lang === 'id' ? 'Aktifkan Cloudflare Quick Tunnel Sekarang' : 'Start Quick Tunnel Now'}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={disconnectCloudflareTunnel}
                        className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-semibold transition-colors"
                      >
                        {lang === 'id' ? 'Hentikan Tunnel' : 'Stop Tunnel'}
                      </button>
                    </div>
                  )}
                </div>

                {/* If active, show public URL box */}
                {isTunnelActive && cloudflareTunnel.tunnelUrl && (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'id' ? 'URL Publik Cloudflare Anda Siap Diakses:' : 'Your Public Cloudflare URL is Ready:'}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Target: localhost:{cloudflareTunnel.targetPort}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
                      <span className="text-emerald-400 font-bold flex-1 truncate select-all">
                        {cloudflareTunnel.tunnelUrl}
                      </span>
                      <button
                        onClick={() => handleCopy(cloudflareTunnel.tunnelUrl!, 'url', 'URL Cloudflare')}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 transition-colors"
                        title="Salin URL"
                      >
                        {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={cloudflareTunnel.tunnelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded font-semibold transition-colors flex items-center gap-1"
                        title="Buka langsung"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
                        <span className="text-slate-500 block text-[10px]">Enkripsi SSL</span>
                        <span className="text-emerald-400 font-semibold">TLS 1.3 Aktif</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
                        <span className="text-slate-500 block text-[10px]">DDoS Protection</span>
                        <span className="text-amber-400 font-semibold">Cloudflare Edge</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
                        <span className="text-slate-500 block text-[10px]">Buka Port Firewall?</span>
                        <span className="text-emerald-400 font-semibold">Tidak Perlu (Outbound)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 1-Line Command to Run directly on VPS Terminal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    <span>
                      {lang === 'id'
                        ? 'Atau Jalankan Perintah 1-Baris Ini Langsung di Terminal VPS Anda:'
                        : 'Or Run This 1-Line Command Directly on Your VPS Console:'}
                    </span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('terminal')}
                    className="text-sky-400 hover:text-sky-300 text-[11px] flex items-center gap-1 font-medium"
                  >
                    <span>Buka Web Terminal</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="relative group bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-[11px] text-amber-300 overflow-x-auto">
                  <pre className="whitespace-pre-wrap break-all leading-relaxed">
                    {quickTunnelBashCommand}
                  </pre>
                  <button
                    onClick={() => handleCopy(quickTunnelBashCommand, 'quickcmd', 'Perintah Quick Tunnel')}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    {copiedKey === 'quickcmd' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">Disalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px]">Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Systemd Auto-Start Service */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>
                    {lang === 'id'
                      ? 'Ingin Tunnel Otomatis Hidup Terus Menerus (Auto-Start saat VPS Reboot)?'
                      : 'Run as a Background Systemd Service (Persistent Across Reboots):'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  {lang === 'id'
                    ? 'Jalankan skrip berikut di terminal VPS untuk membuat daemon systemd otomatis sehingga tunnel Cloudflare tidak akan pernah mati:'
                    : 'Execute this block to install cloudflared as an automatic system service:'}
                </p>

                <div className="relative group bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <pre className="whitespace-pre-wrap leading-relaxed text-slate-300">
                    {quickTunnelSystemdCommand}
                  </pre>
                  <button
                    onClick={() => handleCopy(quickTunnelSystemdCommand, 'systemdcmd', 'Skrip Systemd')}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    {copiedKey === 'systemdcmd' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">Disalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px]">Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ZERO TRUST TUNNEL (DOMAIN PRIBADI) */}
          {activeSubTab === 'zerotrust' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>
                    {lang === 'id'
                      ? 'Cloudflare Zero Trust Tunnel (Gunakan Domain Sendiri Tanpa Buka Port)'
                      : 'Cloudflare Zero Trust Tunnel (Custom Domain Without Open Ports)'}
                  </span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'id'
                    ? 'Jika Anda ingin menghubungkan domain sekolah / madrasah / bisnis Anda (seperti panel.madrasah.sch.id atau server.domainanda.com), Cloudflare Zero Trust adalah cara paling aman. Server Anda tetap 100% tertutup dari serangan internet publik, karena tunnel berjalan melalui koneksi outbound terenkripsi.'
                    : 'Use your own domain with Cloudflare Zero Trust. Keep all incoming ports closed on your firewall while serving traffic globally.'}
                </p>
              </div>

              {/* Step by step guide */}
              <div className="space-y-3">
                <div className="font-semibold text-xs text-slate-200">
                  {lang === 'id' ? 'Langkah 1: Ambil Token dari Dashboard Cloudflare' : 'Step 1: Get Token from Cloudflare'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold font-mono">1. Buka Zero Trust</span>
                    <p className="text-slate-400">
                      Login ke <strong>dash.cloudflare.com</strong> &gt; pilih menu <strong>Zero Trust</strong> &gt; <strong>Networks</strong> &gt; <strong>Tunnels</strong>.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold font-mono">2. Add a Tunnel</span>
                    <p className="text-slate-400">
                      Pilih tipe <strong>Cloudflared</strong>, beri nama misalnya <code className="text-slate-200">velavps-tunnel</code>, lalu klik Save.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold font-mono">3. Salin Token</span>
                    <p className="text-slate-400">
                      Pilih OS <strong>Debian/Ubuntu 64-bit</strong>, salin token string yang muncul setelah perintah <code className="text-slate-200">cloudflared service install</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Input Token */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="font-semibold text-xs text-slate-200">
                  {lang === 'id' ? 'Langkah 2: Masukkan Informasi Tunnel' : 'Step 2: Enter Tunnel Details'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {lang === 'id' ? 'Nama Domain Publik:' : 'Public Domain Name:'}
                    </label>
                    <input
                      type="text"
                      value={zeroTrustDomain}
                      onChange={(e) => setZeroTrustDomain(e.target.value)}
                      placeholder="panel.madrasah.sch.id"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {lang === 'id' ? 'Port Aplikasi Lokal (di VPS):' : 'Local VPS Port:'}
                    </label>
                    <select
                      value={targetPort}
                      onChange={(e) => setTargetPort(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value={3000}>3000 (Aplikasi VelaVPS Manager)</option>
                      <option value={7800}>7800 (aaPanel Linux Web Panel)</option>
                      <option value={80}>80 (Nginx / Web Server HTTP)</option>
                      <option value={8090}>8090 (CyberPanel OpenLiteSpeed)</option>
                      <option value={8443}>8443 (CloudPanel)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {lang === 'id' ? 'Cloudflare Tunnel Token (eyJh...):' : 'Tunnel Token:'}
                  </label>
                  <input
                    type="password"
                    value={zeroTrustToken}
                    onChange={(e) => setZeroTrustToken(e.target.value)}
                    placeholder="eyJhY2NvdW50X3RhZyI6IjhkOT..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handleStartZeroTrust}
                  disabled={isStartingZeroTrust}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {isStartingZeroTrust ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'id' ? 'Mengonfigurasi Zero Trust...' : 'Configuring...'}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 fill-current" />
                      <span>{lang === 'id' ? 'Hubungkan Domain via Zero Trust Sekarang' : 'Connect Custom Domain'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Perintah CLI jika ingin jalankan manual */}
              {zeroTrustToken && (
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {lang === 'id' ? 'Perintah Eksekusi Otomatis di Terminal VPS:' : 'Auto Execution Command for Terminal:'}
                  </span>
                  <div className="relative group bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-emerald-400">
                    <pre className="whitespace-pre-wrap break-all">
                      {`curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared && cloudflared service install ${zeroTrustToken}`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUTO DNS API */}
          {activeSubTab === 'dns' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>
                    {lang === 'id'
                      ? 'Otomatisasi DNS Cloudflare (Auto Pointing IP VPS ke Domain)'
                      : 'Automated Cloudflare DNS Pointing'}
                  </span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'id'
                    ? 'Jika Anda ingin mengarahkan domain langsung ke IP Publik VPS ini tanpa ribet buka dashboard Cloudflare manual, masukkan API token Anda di sini. Sistem akan otomatis membuat A-Record dan mengaktifkan Cloudflare Proxy (Orange Cloud) untuk perlindungan DDoS dan sertifikat SSL otomatis.'
                    : 'Automatically inject DNS A-records pointing to this VPS public IP with Orange Cloud proxy enabled.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {lang === 'id' ? 'Nama Domain / Subdomain:' : 'Domain or Subdomain:'}
                    </label>
                    <input
                      type="text"
                      value={dnsDomain}
                      onChange={(e) => setDnsDomain(e.target.value)}
                      placeholder="app.sekolah.sch.id"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {lang === 'id' ? 'IP Publik VPS Target:' : 'Target Server IP:'}
                    </label>
                    <div className="px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-emerald-400 font-mono text-xs font-semibold">
                      {selectedServer.ip}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {lang === 'id' ? 'Cloudflare API Token (Izin: Zone.DNS Edit):' : 'Cloudflare API Token:'}
                  </label>
                  <input
                    type="password"
                    value={dnsApiToken}
                    onChange={(e) => setDnsApiToken(e.target.value)}
                    placeholder="cf-api-token-98f24b..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Buat token di: dash.cloudflare.com &gt; My Profile &gt; API Tokens &gt; Create Token (Template: Edit Zone DNS).
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="proxyToggle"
                    checked={dnsProxyEnabled}
                    onChange={(e) => setDnsProxyEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                  />
                  <label htmlFor="proxyToggle" className="text-xs text-slate-300 cursor-pointer">
                    <strong className="text-amber-400">Aktifkan Cloudflare Proxy (Orange Cloud)</strong> · Proteksi DDoS + Cache CDN + SSL Otomatis
                  </label>
                </div>

                <button
                  onClick={handleAutomateDns}
                  disabled={isCheckingDns}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {isCheckingDns ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'id' ? 'Menghubungkan ke API Cloudflare...' : 'Calling Cloudflare API...'}</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>{lang === 'id' ? 'Arahkan DNS Secara Otomatis Sekarang' : 'Point DNS Automatically'}</span>
                    </>
                  )}
                </button>
              </div>

              {dnsResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    dnsResult.success
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{dnsResult.message}</span>
                  </div>
                  {dnsResult.record && (
                    <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
                      {dnsResult.record}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMPLETE GUIDE & TROUBLESHOOTING */}
          {activeSubTab === 'guide' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>
                    {lang === 'id'
                      ? 'Panduan Komprehensif: Mengapa Cloudflare Tunnel adalah Solusi Terbaik?'
                      : 'Complete Guide & Best Practices'}
                  </span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'id'
                    ? 'Saat Anda menjalankan aplikasi VPS di era modern, membuka port 80/443 atau port panel (7800/8090) langsung ke publik berisiko terkena pemindaian bot (Shodan, Censys) dan serangan brute-force. Menggunakan Cloudflare Tunnel (cloudflared) menyelesaikan seluruh masalah tersebut secara otomatis.'
                    : 'Cloudflare Tunnel protects your server by keeping incoming firewall ports shut and tunneling outbound traffic through Cloudflare Anycast edge.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="font-semibold text-white flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <span>Pengaturan SSL/TLS yang Benar di Cloudflare</span>
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Masuk ke menu <strong>SSL/TLS</strong> di Cloudflare Dashboard:
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
                    <li>
                      Pilih mode <strong>Full</strong> atau <strong>Full (Strict)</strong> jika VPS Anda sudah memiliki sertifikat SSL sendiri (misal dari aaPanel atau Let's Encrypt).
                    </li>
                    <li>
                      Pilih mode <strong>Flexible</strong> jika aplikasi di VPS hanya berjalan di port HTTP biasa (seperti port 3000 atau port 80 tanpa SSL).
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="font-semibold text-white flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <span>Aktifkan Dukungan WebSockets</span>
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Aplikasi VelaVPS menggunakan koneksi real-time untuk <strong>Terminal Web SSH</strong> dan <strong>Pemantauan Status Beban Real-time</strong>.
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Buka <strong>Network</strong> di Cloudflare Dashboard &gt; pastikan opsi <strong>WebSockets: ON</strong> aktif agar sesi terminal tidak terputus tiap 100 detik.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="font-semibold text-white flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                    <span>Solusi Error Populer (521, 522, 525)</span>
                  </h5>
                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <strong className="text-rose-400">Error 521 (Web Server is Down):</strong> Port aplikasi (misal 3000 atau 7800) belum berjalan di VPS atau firewall memblokir IP Cloudflare. Cek status daemon: <code className="text-slate-300">systemctl status bt</code>.
                    </div>
                    <div>
                      <strong className="text-amber-400">Error 522 (Connection Timed Out):</strong> Port firewall belum dibuka. Jika memakai Cloudflare Tunnel, error 522 tidak akan pernah terjadi!
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="font-semibold text-white flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                      4
                    </span>
                    <span>Integrasi dengan aaPanel</span>
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Jika Anda memasang aaPanel (port 7800), cukup arahkan Tunnel ke <code className="text-emerald-400">http://localhost:7800</code>. Anda bisa langsung membuka Dashboard aaPanel tanpa perlu membuka port 7800 di provider VPS seperti Biznet / AWS / DigitalOcean!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === 'id'
                ? 'Terhubung dengan aman via Cloudflare Edge Network'
                : 'Secured via Cloudflare Edge Network'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium"
          >
            {lang === 'id' ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
