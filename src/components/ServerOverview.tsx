import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import { analyzeIpAddress } from '../utils/networkUtils';
import {
  Server,
  Power,
  RotateCw,
  RefreshCcw,
  Terminal,
  ShieldCheck,
  Layers,
  Cpu,
  HardDrive,
  Activity,
  Globe,
  Lock,
  Copy,
  Check,
  Eye,
  EyeOff,
  Flame,
  ArrowUpRight,
  Clock,
  Network,
  Trash2,
  LayoutDashboard,
  Zap,
  CheckCircle2,
  Box,
  Plus,
  Sliders,
  AlertTriangle,
  Key,
  Link2,
} from 'lucide-react';

export const ServerOverview: React.FC = () => {
  const {
    selectedServer,
    softwareList,
    updateServerPower,
    setIsReinstallModalOpen,
    setIsUbuntuBypassModalOpen,
    setIsDomainSetupModalOpen,
    setIsConnectVpsModalOpen,
    setIsCloudflareModalOpen,
    cloudflareTunnel,
    probeSystemRealtime,
    syncRealServerMetrics,
    isRealSshActive,
    setActiveTab,
    deleteServer,
    openDeleteServerModal,
    openEditServerModal,
    lang,
    addToast,
  } = useVps();

  const [isProbingOverview, setIsProbingOverview] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!selectedServer) return null;

  const isRunning = selectedServer.status === 'running';
  const isReinstalling = selectedServer.status === 'reinstalling';

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    addToast(
      lang === 'id' ? 'Disalin' : 'Copied',
      `${fieldName} ${lang === 'id' ? 'berhasil disalin ke clipboard' : 'copied to clipboard'}`,
      'info'
    );
    setTimeout(() => setCopiedField(null), 2000);
  };

  const sshCommand = `ssh ${selectedServer.connection.username}@${selectedServer.ip} -p ${selectedServer.connection.sshPort}`;
  const netAnalysis = analyzeIpAddress(selectedServer.ip, selectedServer.connection.sshPort);

  return (
    <div className="space-y-6">
      {/* Primary Server Hero Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Node Identity */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none" title={selectedServer.region.country}>
                {selectedServer.region.flag}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {selectedServer.name}
              </h1>
              {/* Status indicator (Zero-pill text) */}
              <div className="flex items-center gap-1.5 text-xs font-mono ml-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isReinstalling
                      ? 'bg-amber-400 animate-spin'
                      : isRunning
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span
                  className={`${
                    isReinstalling
                      ? 'text-amber-400 font-semibold'
                      : isRunning
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  } font-mono`}
                >
                  {isReinstalling
                    ? lang === 'id'
                      ? 'SEDANG INSTAL ULANG'
                      : 'REINSTALLING OS'
                    : isRunning
                    ? 'ONLINE'
                    : 'STOPPED'}
                </span>
              </div>
            </div>

            {/* Subtitle Metadata (Clean typographic separators) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-slate-300">{selectedServer.hostname}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{selectedServer.provider}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{selectedServer.region.city}, {selectedServer.region.country} ({selectedServer.region.code})</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{selectedServer.metrics.uptime}</span>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              {netAnalysis.isNat || selectedServer.networkType === 'private_nat' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Zap className="w-3 h-3 text-amber-400 fill-current" />
                  <span>NAT Bypassed</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>IP Publik Langsung</span>
                </span>
              )}
            </div>
          </div>

          {/* Power Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {isRunning ? (
              <>
                <button
                  onClick={() => updateServerPower(selectedServer.id, 'reboot')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'id' ? 'Mulai Ulang' : 'Reboot'}</span>
                </button>
                <button
                  onClick={() => updateServerPower(selectedServer.id, 'stop')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 rounded-lg transition-colors"
                >
                  <Power className="w-3.5 h-3.5 text-rose-400" />
                  <span>{lang === 'id' ? 'Matikan' : 'Power Off'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => updateServerPower(selectedServer.id, 'start')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
              >
                <Power className="w-4 h-4 stroke-[2.5]" />
                <span>{lang === 'id' ? 'Nyalakan Server' : 'Boot Server'}</span>
              </button>
            )}

            {/* Primary Action Button: Sesuaikan Detail VPS */}
            <button
              onClick={() => openEditServerModal(selectedServer)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/40 rounded-lg transition-colors shadow-sm"
              title="Sesuaikan OS, CPU, RAM, Disk, dan status Panel agar akurat"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'id' ? 'Sesuaikan Detail VPS' : 'Edit Specs'}</span>
            </button>

            {/* Primary Action Button: Reinstall OS */}
            <button
              onClick={() => setIsReinstallModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 rounded-lg transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>{lang === 'id' ? 'Instal Ulang OS' : 'Reinstall OS'}</span>
            </button>

            {/* Launch SSH Web Terminal */}
            <button
              onClick={() => setActiveTab('terminal')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors font-mono"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>SSH Web</span>
            </button>
          </div>
        </div>

        {/* SSH Quick Access Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* SSH Command */}
          <div className="lg:col-span-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-mono text-emerald-400 select-none">$</span>
              <code className="text-xs font-mono text-slate-200 truncate select-all">{sshCommand}</code>
            </div>
            <button
              onClick={() => copyToClipboard(sshCommand, 'Perintah SSH')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors shrink-0 self-end sm:self-auto"
            >
              {copiedField === 'Perintah SSH' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{lang === 'id' ? 'Disalin' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'id' ? 'Salin Perintah' : 'Copy Command'}</span>
                </>
              )}
            </button>
          </div>

          {/* Root Password Reveal */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400">
                {lang === 'id' ? 'Kata Sandi Root' : 'Root Password'}
              </div>
              <div className="text-xs font-mono text-slate-200 mt-0.5 truncate">
                {isPasswordVisible
                  ? selectedServer.connection.rootPassword || 'Tidak ada kata sandi'
                  : '••••••••••••••••'}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded transition-colors"
                title={isPasswordVisible ? 'Sembunyikan' : 'Tampilkan'}
              >
                {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              {selectedServer.connection.rootPassword && (
                <button
                  onClick={() =>
                    copyToClipboard(selectedServer.connection.rootPassword!, 'Kata sandi root')
                  }
                  className="p-1 text-slate-400 hover:text-slate-200 rounded transition-colors"
                  title="Salin kata sandi"
                >
                  {copiedField === 'Kata sandi root' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Sync Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-slate-200">
              {lang === 'id' ? 'Detail VPS Belum Sesuai?' : 'Need Accurate Specs?'}
            </span>{' '}
            <span className="text-slate-400">
              {lang === 'id'
                ? 'Klik untuk mengubah OS (Debian/Ubuntu/CentOS), CPU Core, RAM, Disk, dan status Panel asli server Anda.'
                : 'Customize OS (Debian/Ubuntu), vCPU, RAM, Disk, and Panel to match your real VPS node.'}
            </span>
          </div>
        </div>
        <button
          onClick={() => openEditServerModal(selectedServer)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shrink-0 shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{lang === 'id' ? 'Sesuaikan Detail Akurat' : 'Customize Now'}</span>
        </button>
      </div>

      {/* Special Feature Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Banner 1: VPS Provider Doesn't Support Ubuntu? */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <span>{lang === 'id' ? 'VPS Tidak Support Ubuntu?' : 'Host No Ubuntu?'}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Netboot DD
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {lang === 'id'
                  ? 'Paksa instal resmi Ubuntu 24.04 LTS dari Canonical via in-memory netboot streaming.'
                  : 'Bypass provider lockout and install official Ubuntu 24.04.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUbuntuBypassModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shrink-0 shadow-sm self-start"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{lang === 'id' ? 'Pasang Ubuntu' : 'Install Ubuntu'}</span>
          </button>
        </div>

        {/* Banner 2: Domain Access Setup */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border border-sky-500/30 flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <span>{lang === 'id' ? 'Akses via Domain Kustom' : 'Custom Domain'}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Nginx + SSL
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {lang === 'id'
                  ? 'Panduan konfigurasi DNS A Record, reverse proxy Nginx, dan SSL Let\'s Encrypt gratis.'
                  : 'Guide to setup DNS A records, reverse proxy, and free Let\'s Encrypt SSL.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('domains')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-colors shrink-0 shadow-sm self-start cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Buka Menu Domain' : 'Open Domains Menu'}</span>
          </button>
        </div>

        {/* Banner 3: Auto-Detect & NAT Resolver */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <span>{lang === 'id' ? 'Deteksi IP & Resolver NAT' : 'Auto NAT Resolver'}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Otomatis
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {lang === 'id'
                  ? 'Deteksi otomatis apakah IP server berupa IP Publik atau di balik NAT / CGNAT, serta penyelesaian rute otomatis.'
                  : 'Automatic classification of public vs NAT/CGNAT with automated 1-click resolver bridge.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsConnectVpsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shrink-0 shadow-sm self-start"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Buka Auto-Resolver' : 'Open Auto-Resolver'}</span>
          </button>
        </div>
      </div>

      {/* 5 Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* Card 1: Reinstall OS */}
        <div
          onClick={() => setIsReinstallModalOpen(true)}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <RefreshCcw className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <h3 className="text-xs font-semibold text-slate-100 mt-3 group-hover:text-amber-300 transition-colors">
              {lang === 'id' ? 'Instal Ulang OS' : 'Reinstall OS'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {lang === 'id'
                ? 'Ganti OS ke Debian 12, AlmaLinux, Rocky, Alpine, atau Windows.'
                : 'Clean distributions with custom filesystem, swap, and SSH key.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
            {selectedServer.os.distro} {selectedServer.os.version}
          </div>
        </div>

        {/* Card 2: Control Panels (aaPanel, FastPanel, CyberPanel) */}
        <div
          onClick={() => setActiveTab('panels')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-xs font-semibold text-slate-100 mt-3 group-hover:text-emerald-300 transition-colors">
              {lang === 'id' ? 'Hosting Panel (aaPanel)' : 'Web Panels'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {lang === 'id'
                ? 'Instal otomatis aaPanel, FastPanel, CyberPanel, CloudPanel.'
                : 'One-click aaPanel, FastPanel, CyberPanel, and CloudPanel.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-emerald-400">
            5 Panel Siap Pakai
          </div>
        </div>

        {/* Card 3: Software App Store */}
        <div
          onClick={() => setActiveTab('apps')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
            </div>
            <h3 className="text-xs font-semibold text-slate-100 mt-3 group-hover:text-sky-300 transition-colors">
              {lang === 'id' ? 'Pusat Aplikasi 1-Klik' : '1-Click App Store'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {lang === 'id'
                ? 'Docker, Nginx, PostgreSQL, Node.js PM2, Redis, Portainer.'
                : 'Runtimes, databases, reverse proxies, and containers.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
            30+ Paket Software
          </div>
        </div>

        {/* Card 4: Firewall & Security */}
        <div
          onClick={() => setActiveTab('config')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <h3 className="text-xs font-semibold text-slate-100 mt-3 group-hover:text-indigo-300 transition-colors">
              {lang === 'id' ? 'Firewall & Keamanan' : 'Firewall & Security'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {lang === 'id'
                ? 'Aturan port UFW, buka blokir Fail2ban, dan SSL Let\'s Encrypt.'
                : 'UFW port rules, Fail2ban jails, and SSL certificates.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
            UFW Aktif · Fail2ban On
          </div>
        </div>

        {/* Card 5: Web Console */}
        <div
          onClick={() => setActiveTab('terminal')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Terminal className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-xs font-semibold text-slate-100 mt-3 group-hover:text-purple-300 transition-colors">
              {lang === 'id' ? 'Terminal SSH Web' : 'Live Web Terminal'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {lang === 'id'
                ? 'Akses console shell root langsung dari browser kapan saja.'
                : 'Direct browser SSH terminal with full bash autocompletion.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 truncate">
            root@{selectedServer.ip}
          </div>
        </div>
      </div>

      {/* Live System Telemetry Metrics */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'id' ? 'Status Beban Sistem Real-time' : 'Real-Time Hardware Telemetry'}</span>
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="font-mono">
                Load: <strong className="text-slate-200">{selectedServer.metrics.loadAvg.join(', ')}</strong>
              </span>
              <span>·</span>
              <span className="font-mono">
                Uptime: <strong className="text-slate-200">{selectedServer.metrics.uptime}</strong>
              </span>
            </div>
          </div>

          {/* Real-time OS, Active Panel, Cloudflare & Probe Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Real-time Verified OS Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs shadow-sm">
              <span className="text-base">
                {selectedServer.os.distro.toLowerCase().includes('debian')
                  ? '🌀'
                  : selectedServer.os.distro.toLowerCase().includes('ubuntu')
                  ? '🟠'
                  : selectedServer.os.distro.toLowerCase().includes('almalinux')
                  ? '🟩'
                  : '🐧'}
              </span>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-[10px] block leading-none">OS Aktif Akurat</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Terverifikasi via /etc/os-release" />
                </div>
                <span className="font-mono font-semibold text-slate-200 text-xs">
                  {selectedServer.os.distro} {selectedServer.os.version}
                </span>
              </div>
            </div>

            {/* Real-time Active Panel Badge (e.g. aaPanel) */}
            {selectedServer.activePanel ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs shadow-sm">
                <div className="w-5 h-5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <LayoutDashboard className="w-3 h-3" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-400 text-[10px] block leading-none font-semibold">
                      Panel Aktif Real-time
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white text-xs">
                      {selectedServer.activePanel.name.split(' ')[0]} (Port {selectedServer.activePanel.port})
                    </span>
                    {selectedServer.activePanel.adminUrl && (
                      <a
                        href={selectedServer.activePanel.adminUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 ml-0.5"
                        title="Buka Panel Web"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('panels')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 text-xs transition-colors cursor-pointer"
                title="Pasang CyberPanel atau aaPanel untuk manajemen web"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                <div className="text-left">
                  <span className="text-slate-400 text-[10px] block leading-none">Panel Hosting</span>
                  <span className="font-mono text-emerald-400 text-xs font-semibold">+ Pasang CyberPanel / aaPanel</span>
                </div>
              </button>
            )}

            {/* Cloudflare Quick Tunnel Badge */}
            <button
              onClick={() => setIsCloudflareModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-xs text-amber-300 transition-colors shadow-sm"
              title="Akses aplikasi via Cloudflare tanpa ribet"
            >
              <svg className="w-3.5 h-3.5 fill-current text-amber-400" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
              </svg>
              <div className="text-left">
                <span className="text-amber-400/80 text-[10px] block leading-none">Koneksi Cloudflare</span>
                <span className="font-mono font-semibold text-xs">
                  {cloudflareTunnel.status === 'connected' ? 'Tunnel Online' : 'Hubungkan'}
                </span>
              </div>
            </button>

            {/* Live Probe Trigger */}
            <button
              onClick={async () => {
                setIsProbingOverview(true);
                try {
                  await probeSystemRealtime(selectedServer.id);
                } finally {
                  setIsProbingOverview(false);
                }
              }}
              disabled={isProbingOverview}
              className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Periksa ulang OS & Panel VPS secara real-time"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isProbingOverview ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Real Physical VPS Connection Status Notice */}
        {selectedServer.isRealSshConnected || (selectedServer.connection?.rootPassword && selectedServer.connection?.isRealSshVerified) ? (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg shadow-emerald-950/20 animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                    Live SSH Terhubung ke Akun Server Fisik
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Host: <strong className="font-mono text-white">{selectedServer.ip}</strong> · User: <strong className="font-mono text-white">{selectedServer.connection?.username || 'root'}</strong> · Port: <strong className="font-mono text-white">{selectedServer.connection?.sshPort}</strong> · Latensi: <strong className="font-mono text-emerald-400">{selectedServer.realProbeData?.pingMs || 15}ms</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  const ok = await syncRealServerMetrics(selectedServer.id);
                  if (ok) {
                    addToast(
                      lang === 'id' ? 'Metrik RAM Fisik Sinkron' : 'Real Metrics Synced',
                      lang === 'id' ? 'Penggunaan RAM dan CPU diambil langsung dari kernel Linux server fisik Anda.' : 'Updated from kernel.',
                      'success'
                    );
                  } else {
                    addToast(lang === 'id' ? 'Gagal Sinkronisasi' : 'Sync Failed', 'Periksa koneksi SSH ke server.', 'error');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Sinkronkan RAM Fisik</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('terminal')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Terminal SSH Langsung</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg shadow-amber-950/20 animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Mode Simulasi Lokal (Belum Terhubung ke Akun VPS Fisik)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    Perlu Kredensial SSH
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Perubahan RAM, instal ulang OS, dan instalasi CyberPanel saat ini masih berjalan di state simulasi lokal browser. Agar CyberPanel benar-benar terpasang di VPS Anda dan penggunaan memori fisik berubah riil, masukkan IP asli dan kata sandi root SSH VPS Anda.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openEditServerModal(selectedServer)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Hubungkan Akun VPS Fisik (SSH)</span>
              </button>
            </div>
          </div>
        )}

        {/* Real-time Hardware Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CPU Gauge */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Cpu className="w-4 h-4 text-slate-500" />
                <span>CPU ({selectedServer.specs.vcpu} vCPU)</span>
              </span>
              <span className="font-mono tabular-nums text-slate-200 font-semibold">{selectedServer.metrics.cpuPct}%</span>
            </div>
            <div className="mt-3 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  selectedServer.metrics.cpuPct > 80
                    ? 'bg-rose-500'
                    : selectedServer.metrics.cpuPct > 50
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${selectedServer.metrics.cpuPct}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-mono">
              Freq: ~2.80 GHz · KVM Hardware Virt
            </div>
          </div>

          {/* RAM Gauge */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <HardDrive className="w-4 h-4 text-slate-500" />
                <span>RAM ({selectedServer.specs.ramGb} GB)</span>
              </span>
              <span className="font-mono tabular-nums text-slate-200 font-semibold">{selectedServer.metrics.ramPct}%</span>
            </div>
            <div className="mt-3 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-all duration-500"
                style={{ width: `${selectedServer.metrics.ramPct}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-mono">
              Terpakai: {((selectedServer.specs.ramGb * selectedServer.metrics.ramPct) / 100).toFixed(2)} GB / {selectedServer.specs.ramGb} GB
            </div>
          </div>

          {/* Disk Gauge */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Server className="w-4 h-4 text-slate-500" />
                <span>Disk ({selectedServer.specs.diskGb} GB {selectedServer.specs.diskType.split(' ')[0]})</span>
              </span>
              <span className="font-mono tabular-nums text-slate-200 font-semibold">{selectedServer.metrics.diskPct}%</span>
            </div>
            <div className="mt-3 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-400 transition-all duration-500"
                style={{ width: `${selectedServer.metrics.diskPct}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-mono">
              Terpakai: {((selectedServer.specs.diskGb * selectedServer.metrics.diskPct) / 100).toFixed(1)} GB / {selectedServer.specs.diskGb} GB
            </div>
          </div>

          {/* Network Gauge */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Network className="w-4 h-4 text-slate-500" />
                <span>Bandwidth I/O</span>
              </span>
              <span className="font-mono tabular-nums text-emerald-400 text-xs">
                ↓{selectedServer.metrics.netInKb} KB/s
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-300">
              <span>Upload: ↑{selectedServer.metrics.netOutKb} KB/s</span>
              <span>Kouta: {selectedServer.specs.usedBandwidthGb} GB / {selectedServer.specs.bandwidthTb * 1000} GB</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-mono">
              Port Link Speed: 10 Gbps Duplex
            </div>
          </div>
        </div>

        {/* Dedicated Section: Aplikasi & Layanan Terinstal yang Berjalan di VPS Ini */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">
                {lang === 'id' ? 'Aplikasi & Layanan Aktif di VPS Ini:' : 'Active Installed Software & Daemons:'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {softwareList.filter((s) => s.status === 'installed').length} Berjalan
              </span>
            </div>
            <button
              onClick={() => setActiveTab('apps')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>+ Kelola / Pasang Aplikasi Lain</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {softwareList
              .filter((s) => s.status === 'installed')
              .map((app) => (
                <div
                  key={app.id}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-xs truncate max-w-[100px]" title={app.name}>
                      {app.name}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Aktif / Running" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-medium">v{app.version}</span>
                    <span>{app.port ? `:${app.port}` : `${app.memoryUsageMb || 35}MB`}</span>
                  </div>
                  {app.serviceName && (
                    <div className="text-[9px] font-mono text-slate-500 truncate mt-1">
                      {app.serviceName}
                    </div>
                  )}
                </div>
              ))}

            {/* Quick Add App Card */}
            <button
              onClick={() => setActiveTab('apps')}
              className="p-2.5 rounded-xl border border-dashed border-slate-800 hover:border-emerald-500/40 hover:bg-slate-950/40 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-emerald-300 group"
            >
              <Plus className="w-4 h-4 mb-1 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              <span className="text-[10px] font-medium">Tambah App</span>
            </button>
          </div>
        </div>
      </div>

      {/* Technical Specifications Summary Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-base font-semibold text-white tracking-tight">
            {lang === 'id' ? 'Detail Spesifikasi & Sistem Operasi' : 'System & Network Details'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReinstallModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCcw className="w-3 h-3" />
              <span>{lang === 'id' ? 'Instal Ulang OS' : 'Reinstall OS'}</span>
            </button>
            <button
              onClick={() => openEditServerModal(selectedServer)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>{lang === 'id' ? 'Ubah Spesifikasi' : 'Customize Specs'}</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
          <div>
            <div className="text-slate-400">{lang === 'id' ? 'Distribusi Linux' : 'Linux Distribution'}</div>
            <div className="text-slate-200 font-medium mt-1 font-mono">{selectedServer.os.distro} {selectedServer.os.version} ({selectedServer.os.codename})</div>
          </div>
          <div>
            <div className="text-slate-400">{lang === 'id' ? 'Versi Kernel' : 'Kernel Version'}</div>
            <div className="text-slate-200 font-medium mt-1 font-mono truncate">{selectedServer.os.kernel}</div>
          </div>
          <div>
            <div className="text-slate-400">{lang === 'id' ? 'Arsitektur CPU' : 'Architecture'}</div>
            <div className="text-slate-200 font-medium mt-1 font-mono">{selectedServer.os.arch}</div>
          </div>
          <div>
            <div className="text-slate-400">{lang === 'id' ? 'Alamat IPv4 Publik' : 'Public IPv4 Address'}</div>
            <div className="text-slate-200 font-medium mt-1 font-mono flex items-center gap-1.5">
              <span>{selectedServer.ip}</span>
              <button
                onClick={() => copyToClipboard(selectedServer.ip, 'IPv4')}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div>
            <div className="text-slate-400">{lang === 'id' ? 'Alamat IPv6' : 'IPv6 Address'}</div>
            <div className="text-slate-200 font-medium mt-1 font-mono truncate flex items-center gap-1.5">
              <span className="truncate">{selectedServer.ipv6}</span>
              <button
                onClick={() => copyToClipboard(selectedServer.ipv6, 'IPv6')}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div>
            <div className="text-slate-400">{lang === 'id' ? 'Terakhir Dipasang' : 'Installed At'}</div>
            <div className="text-slate-200 font-medium mt-1 font-mono">{selectedServer.os.installedAt}</div>
          </div>
        </div>

        {/* Delete Server Option */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'id' ? 'Zona Bahaya: Hapus Server VPS' : 'Danger Zone: Delete VPS Server'}</span>
            </span>
            <p className="text-[11px] text-slate-500">
              {lang === 'id'
                ? 'Hapus node server ini dari dashboard dan putuskan seluruh koneksi aktif.'
                : 'Remove this server instance from your orchestrator dashboard.'}
            </p>
          </div>
          <button
            onClick={() => openDeleteServerModal(selectedServer)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-900 border border-rose-800/50 rounded-xl transition-all shadow-sm shadow-rose-950/40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === 'id' ? 'Hapus Node VPS Ini' : 'Delete This VPS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
