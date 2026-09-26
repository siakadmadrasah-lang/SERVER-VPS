import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import { SoftwareApp } from '../types/vps';
import {
  LayoutDashboard,
  ExternalLink,
  Download,
  RotateCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  Trash2,
  Shield,
  Layers,
  Server,
  Sparkles,
  AlertTriangle,
  X,
  Info,
} from 'lucide-react';
import { CyberPanelConsoleModal } from './CyberPanelConsoleModal';

export const ControlPanelInstaller: React.FC = () => {
  const {
    softwareList,
    installSoftware,
    uninstallSoftware,
    restartSoftwareService,
    selectedServer,
    setIsUbuntuBypassModalOpen,
    firewallRules,
    lang,
    addToast,
  } = useVps();

  const [selectedPanel, setSelectedPanel] = useState<SoftwareApp | null>(null);
  const [adminUser, setAdminUser] = useState<string>('admin');
  const [adminPass, setAdminPass] = useState<string>('PanelPass#2026@Secure');
  const [isPassVisible, setIsPassVisible] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isDebianWorkaroundOpen, setIsDebianWorkaroundOpen] = useState<boolean>(false);
  const [copiedDebianScript, setCopiedDebianScript] = useState<boolean>(false);
  const [isCyberPanelConsoleOpen, setIsCyberPanelConsoleOpen] = useState<boolean>(false);

  if (!selectedServer) return null;

  // Filter control panel items
  const panelApps = softwareList.filter((app) => app.category === 'panel');

  const panelHighlights: Record<
    string,
    { bestFor: string; engine: string; minRam: string; badge: string; color: string }
  > = {
    aapanel: {
      bestFor: 'Pemula & Webmaster Serba Visual (File Manager, Database, SSL, PHP/Node)',
      engine: 'Nginx / Apache + MySQL + PureFTPd',
      minRam: '1 GB RAM',
      badge: 'Paling Populer',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20',
    },
    fastpanel: {
      bestFor: 'Multi-domain cepat, Mail Server, DNS Clustering, dan Backup Cloud',
      engine: 'Nginx FastCGI + PHP Multi-Version',
      minRam: '1 GB RAM',
      badge: 'Sangat Cepat',
      color: 'border-sky-500/40 text-sky-400 bg-sky-950/20',
    },
    cyberpanel: {
      bestFor: 'WordPress Berkecepatan Maksimal dengan OpenLiteSpeed LSCache',
      engine: 'OpenLiteSpeed High-Performance',
      minRam: '2 GB RAM',
      badge: 'Kecepatan WordPress',
      color: 'border-purple-500/40 text-purple-400 bg-purple-950/20',
    },
    cloudpanel: {
      bestFor: 'Aplikasi Modern PHP, Laravel, WordPress, dan Node.js / React',
      engine: 'Nginx + MySQL 8.0 Minimalist',
      minRam: '1 GB RAM',
      badge: 'Modern & Bersih',
      color: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
    },
    hestiacp: {
      bestFor: 'Pengganti cPanel Open Source dengan Mail Server & DNS bawaan',
      engine: 'Nginx Reverse Proxy + Apache / PHP-FPM',
      minRam: '1 GB RAM',
      badge: 'Full Hosting',
      color: 'border-rose-500/40 text-rose-400 bg-rose-950/20',
    },
  };

  const getFullPanelUrl = (app: SoftwareApp) => {
    const port = app.port || 80;
    const protocol = port === 8090 || port === 8888 || port === 8443 || port === 8083 ? 'https' : 'http';
    const path = app.adminPath || '';
    return `${protocol}://${selectedServer.ip}:${port}${path}`;
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    addToast(
      lang === 'id' ? 'Disalin' : 'Copied',
      `${label} ${lang === 'id' ? 'berhasil disalin' : 'copied'}`,
      'info'
    );
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const openInstallWizard = (panel: SoftwareApp) => {
    setSelectedPanel(panel);
    setAdminUser(panel.defaultCredentials?.user || 'admin');
    setAdminPass(panel.defaultCredentials?.pass || 'AdminPass#' + Math.floor(Math.random() * 9000 + 1000));
    setIsInstalling(false);
    setInstallLogs([]);
  };

  const handleStartPanelInstall = async () => {
    if (!selectedPanel) return;
    setIsInstalling(true);
    setInstallLogs([
      `[INIT] Mengunduh skrip instalasi resmi untuk ${selectedPanel.name}...`,
      `[SCRIPT] ${selectedPanel.installCommand || 'bash install.sh'}`,
    ]);

    setTimeout(() => {
      setInstallLogs((prev) => [
        ...prev,
        `[DEPS] Menyiapkan dependensi Python 3, OpenSSL, curl, dan compiler build-essential...`,
        `[CORE] Menginstal runtime panel dan modul web visual...`,
        `[UFW] Membuka port ${selectedPanel.port} pada firewall agar dapat diakses dari browser...`,
      ]);
    }, 1200);

    setTimeout(() => {
      setInstallLogs((prev) => [
        ...prev,
        `[CONFIG] Menyetel akun admin: User '${adminUser}'...`,
        `[SECURITY] Menginisiasi token keamanan dan pintu masuk dashboard...`,
        `[SYSTEMD] Menjalankan layanan 'systemctl enable --now ${selectedPanel.serviceName || selectedPanel.id}'...`,
      ]);
    }, 2400);

    await installSoftware(selectedPanel.id, selectedPanel.version, { user: adminUser, pass: adminPass });

    setTimeout(() => {
      setInstallLogs((prev) => [
        ...prev,
        `[READY] Pemasangan ${selectedPanel.name} selesai! URL Akses: ${getFullPanelUrl(selectedPanel)}`,
      ]);
      setTimeout(() => {
        setSelectedPanel(null);
        setIsInstalling(false);
      }, 1200);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                {lang === 'id'
                  ? 'Instalasi Otomatis Web Hosting Control Panel'
                  : 'Automated Web Hosting Control Panel Installer'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'id'
                ? 'Pasang aaPanel, FastPanel, CyberPanel, CloudPanel, atau HestiaCP secara otomatis dalam 1 klik. Sistem akan mengunduh repositori resmi, mengonfigurasi port dan firewall, serta membuat akun admin login siap pakai.'
                : 'Deploy aaPanel, FastPanel, CyberPanel, CloudPanel, or HestiaCP in one click with automated firewall configuration and instant admin credentials.'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <Server className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-slate-500 block text-[10px]">TARGET NODE:</span>
              <span className="text-slate-200 font-semibold">{selectedServer.hostname} ({selectedServer.ip})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panels Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {panelApps.map((panel) => {
          const isInstalled = panel.status === 'installed';
          const isPanelInstalling = panel.status === 'installing';
          const highlight = panelHighlights[panel.id] || {
            bestFor: panel.descriptionId,
            engine: 'Nginx + PHP/MySQL',
            minRam: '1 GB',
            badge: 'Control Panel',
            color: 'border-slate-700 text-slate-300 bg-slate-800/40',
          };
          const panelUrl = getFullPanelUrl(panel);

          return (
            <div
              key={panel.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isInstalled
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">{panel.name}</h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${highlight.color}`}>
                        {highlight.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                      <span>Port {panel.port}</span>
                      <span aria-hidden="true">·</span>
                      <span>Min {highlight.minRam}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500">{highlight.engine}</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isPanelInstalling
                          ? 'bg-amber-400 animate-spin'
                          : isInstalled
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-slate-600'
                      }`}
                    />
                    <span
                      className={`${
                        isPanelInstalling
                          ? 'text-amber-400'
                          : isInstalled
                          ? 'text-emerald-400 font-semibold'
                          : 'text-slate-500'
                      }`}
                    >
                      {isPanelInstalling
                        ? lang === 'id'
                          ? 'Sedang Memasang...'
                          : 'Installing...'
                        : isInstalled
                        ? lang === 'id'
                          ? 'TERPASANG (AKTIF)'
                          : 'INSTALLED'
                        : lang === 'id'
                        ? 'Siap Pasang'
                        : 'Ready to Install'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'id' ? panel.descriptionId : panel.description}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300 block mb-0.5">Kelebihan Utama:</span>
                  <span>{highlight.bestFor}</span>
                </div>

                {/* Special Debian Notice for CyberPanel */}
                {panel.id === 'cyberpanel' && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Catatan Khusus Pengguna Debian:</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Skrip resmi CyberPanel menampilkan pesan error <code className="text-amber-300 font-mono">"not support debian"</code> karena developer hanya menargetkan Ubuntu & AlmaLinux.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsUbuntuBypassModalOpen(true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-semibold text-[11px] hover:bg-amber-300 transition-colors"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Ganti ke Ubuntu (Solusi 100% Bersih)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDebianWorkaroundOpen(true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-[11px] hover:bg-slate-700 transition-colors"
                      >
                        <Info className="w-3 h-3 text-sky-400" />
                        <span>Cara Pasang di Debian</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* If Installed: Credentials Box & Direct Link */}
                {isInstalled && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2.5 animate-in fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Akses Web Dashboard {panel.name.split(' ')[0]}:</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {panel.id === 'cyberpanel' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setIsCyberPanelConsoleOpen(true)}
                              className="flex items-center gap-1 text-xs text-white bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded-lg font-semibold transition-colors shadow-sm cursor-pointer"
                            >
                              <Zap className="w-3 h-3 fill-current" />
                              <span>Buka Console In-App</span>
                            </button>
                            <a
                              href={panelUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
                              title="Buka link fisik (Port 8090)"
                            >
                              <span>Buka di Browser</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          </>
                        ) : (
                          <a
                            href={panelUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-2.5 py-1 rounded font-semibold transition-colors"
                          >
                            <span>Buka Panel</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                      <div className="flex items-center justify-between py-1 px-2 bg-slate-900 rounded border border-slate-800">
                        <span className="text-slate-500">URL:</span>
                        <div className="flex items-center gap-1.5 truncate max-w-[260px]">
                          <span className="text-emerald-400 truncate">{panelUrl}</span>
                          <button
                            onClick={() => copyText(panelUrl, 'URL Panel')}
                            className="text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                          <span className="text-slate-500">USER:</span>
                          <span className="text-slate-200">{panel.defaultCredentials?.user || 'admin'}</span>
                        </div>
                        <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                          <span className="text-slate-500">PASS:</span>
                          <span className="text-amber-300">{panel.defaultCredentials?.pass || 'AdminPass'}</span>
                        </div>
                      </div>
                    </div>

                    {panel.id === 'cyberpanel' && (
                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
                        <span>Peringatan SSL di Browser?</span>
                        <button
                          type="button"
                          onClick={() => setIsCyberPanelConsoleOpen(true)}
                          className="text-amber-400 hover:text-amber-300 font-sans font-semibold underline cursor-pointer"
                        >
                          Lihat Solusi Akses Port 8090 →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                {isInstalled ? (
                  <>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => restartSoftwareService(panel.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-mono cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lang === 'id' ? 'Restart Service' : 'Restart Service'}</span>
                      </button>
                      {panel.id === 'cyberpanel' && (
                        <button
                          type="button"
                          onClick={() => setIsCyberPanelConsoleOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg transition-colors cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-purple-400 fill-current" />
                          <span>Console Visual</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            lang === 'id'
                              ? `Copot pemasangan ${panel.name}? Website yang di-hosting tetap ada di disk.`
                              : `Uninstall ${panel.name}?`
                          )
                        ) {
                          uninstallSoftware(panel.id);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'id' ? 'Copot Panel' : 'Uninstall'}</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full flex items-center gap-2">
                    <button
                      onClick={() => openInstallWizard(panel)}
                      disabled={isPanelInstalling}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>{lang === 'id' ? `Pasang ${panel.name.split(' ')[0]}` : `Install ${panel.name.split(' ')[0]}`}</span>
                    </button>
                    {panel.id === 'cyberpanel' && (
                      <button
                        type="button"
                        onClick={() => setIsCyberPanelConsoleOpen(true)}
                        className="px-3 py-2 text-xs font-medium text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                        title="Buka preview & panduan"
                      >
                        <span>Preview & Bantuan</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Automated Installation Wizard Modal */}
      {selectedPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {lang === 'id' ? 'Pemasangan Otomatis' : 'Automated Installation'} · {selectedPanel.name}
                  </h3>
                  <p className="text-xs text-slate-400">Node: {selectedServer.hostname} ({selectedServer.ip})</p>
                </div>
              </div>
              {!isInstalling && (
                <button
                  onClick={() => setSelectedPanel(null)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <span className="sr-only">Tutup</span>
                  ✕
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {!isInstalling ? (
                <>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-mono text-[11px]">Skrip Resmi yang Akan Dijalankan:</div>
                    <code className="text-slate-200 font-mono text-[11px] block break-all">
                      {selectedPanel.installCommand}
                    </code>
                  </div>

                  {/* Username & Password configuration */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Username Administrator
                      </label>
                      <input
                        type="text"
                        value={adminUser}
                        onChange={(e) => setAdminUser(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Kata Sandi Administrator Baru
                      </label>
                      <input
                        type="text"
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-amber-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
                      <Shield className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>
                        Port firewall <strong className="font-mono">{selectedPanel.port}</strong> akan dibuka otomatis pada sistem UFW agar panel bisa langsung diakses.
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sedang mengeksekusi instalasi otomatis di background...</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 max-h-52 overflow-y-auto">
                    {installLogs.map((log, index) => (
                      <div key={index} className="leading-relaxed">
                        <span className="text-emerald-400 select-none mr-2">›</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
              {!isInstalling ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedPanel(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleStartPanelInstall}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Mulai Pemasangan</span>
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-500 font-mono">
                  Mengompilasi dan mengonfigurasi komponen...
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CyberPanel on Debian Workaround Modal */}
      {isDebianWorkaroundOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    Solusi: CyberPanel Warning "Not Support Debian"
                  </h3>
                  <p className="text-xs text-slate-400">
                    Penjelasan teknis dan 3 opsi solusi untuk memasang CyberPanel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDebianWorkaroundOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs leading-relaxed">
              {/* Why does this happen? */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-white text-xs flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  <span>Mengapa Muncul Warning Ini di Debian?</span>
                </h4>
                <p className="text-slate-300">
                  Developer CyberPanel sengaja mengunci skrip instalasi (<code className="text-amber-300 font-mono">install.sh</code>) dengan pengecekan baris:
                </p>
                <code className="block p-2 bg-slate-900 rounded font-mono text-[11px] text-rose-300">
                  if [ "$SERVER_OS" != "Ubuntu" ] && [ "$SERVER_OS" != "AlmaLinux" ] ... then exit
                </code>
                <p className="text-slate-400 text-[11px]">
                  CyberPanel dikompilasi khusus untuk repositori Ubuntu dan AlmaLinux. Meskipun Debian memiliki basis yang hampir sama dengan Ubuntu, developer belum merilis paket build resmi untuk Debian.
                </p>
              </div>

              {/* Solusi 1 (Rekomendasi Utama) */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-400 text-xs">
                    Solusi 1 (100% Berhasil & Paling Bersih): Ubah VPS ke Ubuntu 22.04 LTS
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Rekomendasi Resmi
                  </span>
                </div>
                <p className="text-slate-300 text-xs">
                  Gunakan tombol <strong>"Bypass & Pasang Ubuntu"</strong> di aplikasi ini. Dalam ~3 menit, VPS Debian Anda akan berubah menjadi <strong>Ubuntu 22.04 LTS murni</strong>. Setelah itu, jalankan CyberPanel — instalasi dijamin 100% lancar tanpa error atau warning apapun.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsDebianWorkaroundOpen(false);
                    setIsUbuntuBypassModalOpen(true);
                  }}
                  className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Buka Alat Pasang Ubuntu Sekarang</span>
                </button>
              </div>

              {/* Solusi 2: OS Release Spoofing Script */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-white text-xs">
                  Solusi 2: Memaksa Installer CyberPanel di Debian (Trik Spoofing OS)
                </h4>
                <p className="text-slate-300 text-[11px]">
                  Jika Anda tetap ingin berada di Debian, Anda bisa memalsukan identitas OS sementara menjadi Ubuntu Jammy saat menjalankan installer:
                </p>

                <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Skrip Bash Spoofing Debian ke Ubuntu:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const script = `sudo cp /etc/os-release /etc/os-release.bak && cat << 'EOF' | sudo tee /etc/os-release\nNAME="Ubuntu"\nVERSION="22.04.4 LTS (Jammy Jellyfish)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 22.04.4 LTS"\nVERSION_ID="22.04"\nUBUNTU_CODENAME=jammy\nEOF\nbash <(curl -s https://cyberpanel.net/install.sh || wget -q -O - https://cyberpanel.net/install.sh)\nsudo cp /etc/os-release.bak /etc/os-release`;
                        navigator.clipboard.writeText(script);
                        setCopiedDebianScript(true);
                        addToast('Skrip Disalin', 'Skrip spoofing siap di-paste di terminal SSH Anda', 'info');
                        setTimeout(() => setCopiedDebianScript(false), 2500);
                      }}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-sans text-xs"
                    >
                      {copiedDebianScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDebianScript ? 'Tersalin' : 'Salin Skrip'}</span>
                    </button>
                  </div>
                  <pre className="text-slate-200 overflow-x-auto whitespace-pre leading-relaxed select-all">
{`# 1. Cadangkan file identitas OS asli
sudo cp /etc/os-release /etc/os-release.bak

# 2. Palsukan identitas sementara menjadi Ubuntu 22.04 LTS
cat << 'EOF' | sudo tee /etc/os-release
NAME="Ubuntu"
VERSION="22.04.4 LTS (Jammy Jellyfish)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 22.04.4 LTS"
VERSION_ID="22.04"
UBUNTU_CODENAME=jammy
EOF

# 3. Jalankan skrip installer CyberPanel dengan Bash
bash <(curl -s https://cyberpanel.net/install.sh || wget -q -O - https://cyberpanel.net/install.sh)

# 4. Kembalikan identitas Debian asli setelah selesai
sudo cp /etc/os-release.bak /etc/os-release`}
                  </pre>
                </div>
              </div>

              {/* Solusi 3: Alternatif Native Debian */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-semibold text-white text-xs">
                  Solusi 3: Alternatif yang 100% Native Mendukung Debian Tanpa Trik
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <strong className="text-emerald-400 block mb-0.5">aaPanel (Bisa Pakai OpenLiteSpeed)</strong>
                    <span className="text-slate-400">
                      Mendukung Debian 10, 11, dan 12 secara resmi. Anda juga bisa memilih web server OpenLiteSpeed sama seperti CyberPanel.
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <strong className="text-sky-400 block mb-0.5">CloudPanel atau FastPanel</strong>
                    <span className="text-slate-400">
                      Sangat cepat dan resmi direkomendasikan berjalan di atas Debian tanpa error dependensi.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsDebianWorkaroundOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App CyberPanel Visual Console Modal */}
      <CyberPanelConsoleModal
        isOpen={isCyberPanelConsoleOpen}
        onClose={() => setIsCyberPanelConsoleOpen(false)}
      />
    </div>
  );
};
