import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import { SoftwareApp } from '../types/vps';
import {
  Layers,
  Search,
  CheckCircle2,
  Download,
  RotateCw,
  Trash2,
  ExternalLink,
  Shield,
  Server,
  Database,
  Cpu,
  Box,
  Wrench,
  X,
  Play,
  Check,
  LayoutDashboard,
} from 'lucide-react';

export const SoftwareInstaller: React.FC = () => {
  const {
    softwareList,
    installSoftware,
    uninstallSoftware,
    restartSoftwareService,
    selectedServer,
    lang,
    addToast,
  } = useVps();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Install modal state
  const [selectedAppToInstall, setSelectedAppToInstall] = useState<SoftwareApp | null>(null);
  const [installVersion, setInstallVersion] = useState<string>('');
  const [installPort, setInstallPort] = useState<number | undefined>(undefined);
  const [autoStart, setAutoStart] = useState<boolean>(true);
  const [allowFirewall, setAllowFirewall] = useState<boolean>(true);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [installLogs, setInstallLogs] = useState<string[]>([]);

  const categories = [
    { id: 'all', labelId: 'Semua Aplikasi', labelEn: 'All Apps' },
    { id: 'panel', labelId: 'Control Panel (aaPanel dll)', labelEn: 'Hosting Panels' },
    { id: 'webserver', labelId: 'Web Server & Proxy', labelEn: 'Web & Proxy' },
    { id: 'container', labelId: 'Kontainer & Docker', labelEn: 'Containers' },
    { id: 'database', labelId: 'Basis Data (Database)', labelEn: 'Databases' },
    { id: 'runtime', labelId: 'Runtime & Bahasa', labelEn: 'Runtimes' },
    { id: 'security', labelId: 'Keamanan & SSL', labelEn: 'Security & SSL' },
    { id: 'tool', labelId: 'Alat & Utilitas', labelEn: 'Tools & Utilities' },
  ];

  const filteredApps = softwareList.filter((app) => {
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.descriptionId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openInstallModal = (app: SoftwareApp) => {
    setSelectedAppToInstall(app);
    setInstallVersion(app.availableVersions[0] || app.version);
    setInstallPort(app.port);
    setAutoStart(app.autoStart);
    setAllowFirewall(!!app.port);
    setIsInstalling(false);
    setInstallLogs([]);
  };

  const handleExecuteInstall = async () => {
    if (!selectedAppToInstall) return;

    setIsInstalling(true);
    setInstallLogs([
      `[APT] Memeriksa dependensi sistem untuk ${selectedAppToInstall.name}...`,
      `[REPO] Menambahkan repositori resmi upstream (${installVersion})...`,
    ]);

    setTimeout(() => {
      setInstallLogs((prev) => [
        ...prev,
        `[DOWNLOAD] Mengunduh paket biner ${selectedAppToInstall.id}-${installVersion}...`,
        `[EXTRACT] Mengekstrak file dan mengatur izin permission...`,
      ]);
    }, 800);

    setTimeout(() => {
      setInstallLogs((prev) => [
        ...prev,
        `[CONFIG] Menyiapkan konfigurasi bawaan di /etc/${selectedAppToInstall.serviceName || selectedAppToInstall.id}/...`,
        autoStart ? `[SYSTEMD] Menjalankan 'systemctl enable --now ${selectedAppToInstall.serviceName || selectedAppToInstall.id}'...` : '[SYSTEMD] Auto-start dinonaktifkan.',
        allowFirewall && installPort ? `[UFW] Membuka port ${installPort}/TCP pada firewall...` : '[UFW] Tidak ada modifikasi firewall.',
      ]);
    }, 1600);

    await installSoftware(selectedAppToInstall.id, installVersion);

    setTimeout(() => {
      setInstallLogs((prev) => [
        ...prev,
        `[SUCCESS] ${selectedAppToInstall.name} berhasil dipasang dan siap digunakan!`,
      ]);
      setTimeout(() => {
        setSelectedAppToInstall(null);
        setIsInstalling(false);
      }, 1000);
    }, 2500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'webserver':
        return <Server className="w-4 h-4 text-emerald-400" />;
      case 'panel':
        return <LayoutDashboard className="w-4 h-4 text-emerald-400" />;
      case 'container':
        return <Box className="w-4 h-4 text-sky-400" />;
      case 'database':
        return <Database className="w-4 h-4 text-amber-400" />;
      case 'runtime':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'security':
        return <Shield className="w-4 h-4 text-indigo-400" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'id' ? 'Pusat Aplikasi & Software 1-Klik' : '1-Click App & Software Store'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'id'
              ? `Instal web server, runtime, database, dan alat keamanan di node ${selectedServer?.hostname}`
              : `Deploy web servers, runtime stacks, databases, and monitoring tools to ${selectedServer?.hostname}`}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'id' ? 'Cari software (Docker, Nginx, DB)...' : 'Search software...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Segmented Filter Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {lang === 'id' ? cat.labelId : cat.labelEn}
            </button>
          );
        })}
      </div>

      {/* Software App Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredApps.map((app) => {
          const isInstalled = app.status === 'installed';
          const isAppInstalling = app.status === 'installing';

          return (
            <div
              key={app.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                isInstalled
                  ? 'bg-slate-900/80 border-slate-800 shadow-md'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Icon, Name, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                      {getCategoryIcon(app.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">{app.name}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                        <span>{isInstalled ? `v${app.installedVersion}` : `v${app.version}`}</span>
                        {app.port && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Port {app.port}</span>
                          </>
                        )}
                        {app.memoryUsageMb && isInstalled && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-400">~{app.memoryUsageMb} MB RAM</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Tag (Zero-pill text) */}
                  <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAppInstalling
                          ? 'bg-amber-400 animate-spin'
                          : isInstalled
                          ? 'bg-emerald-400'
                          : 'bg-slate-600'
                      }`}
                    />
                    <span
                      className={`text-[11px] ${
                        isAppInstalling
                          ? 'text-amber-400'
                          : isInstalled
                          ? 'text-emerald-400 font-medium'
                          : 'text-slate-500'
                      }`}
                    >
                      {isAppInstalling
                        ? lang === 'id'
                          ? 'Menginstal...'
                          : 'Installing...'
                        : isInstalled
                        ? lang === 'id'
                          ? 'Terpasang'
                          : 'Installed'
                        : lang === 'id'
                        ? 'Tersedia'
                        : 'Available'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 mt-3 leading-relaxed line-clamp-2">
                  {lang === 'id' ? app.descriptionId : app.description}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {isInstalled ? (
                  <>
                    <button
                      onClick={() => restartSoftwareService(app.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-mono"
                      title={lang === 'id' ? 'Muat ulang service daemon' : 'Reload systemd service'}
                    >
                      <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'id' ? 'Restart' : 'Restart'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            lang === 'id'
                              ? `Apakah Anda yakin ingin mencopot ${app.name}?`
                              : `Uninstall ${app.name}?`
                          )
                        ) {
                          uninstallSoftware(app.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title={lang === 'id' ? 'Hapus software' : 'Uninstall'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openInstallModal(app)}
                    disabled={isAppInstalling}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'id' ? 'Instal Sekarang' : 'Install Now'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Install Software Interactive Modal */}
      {selectedAppToInstall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  {getCategoryIcon(selectedAppToInstall.category)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {lang === 'id' ? 'Instalasi' : 'Install'} {selectedAppToInstall.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Node: {selectedServer?.hostname}
                  </p>
                </div>
              </div>
              {!isInstalling && (
                <button
                  onClick={() => setSelectedAppToInstall(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {!isInstalling ? (
                <>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'id'
                      ? selectedAppToInstall.descriptionId
                      : selectedAppToInstall.description}
                  </p>

                  {/* Version Picker */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      {lang === 'id' ? 'Pilih Versi' : 'Select Version'}
                    </label>
                    <select
                      value={installVersion}
                      onChange={(e) => setInstallVersion(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      {selectedAppToInstall.availableVersions.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Port Setup if applicable */}
                  {selectedAppToInstall.port && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        {lang === 'id' ? 'Port Layanan (TCP Port)' : 'Service Port'}
                      </label>
                      <input
                        type="number"
                        value={installPort ?? selectedAppToInstall.port}
                        onChange={(e) => setInstallPort(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Checkbox Options */}
                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={autoStart}
                        onChange={(e) => setAutoStart(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span>
                        {lang === 'id'
                          ? 'Aktifkan otomatis saat server boot (systemctl enable)'
                          : 'Enable service on system boot'}
                      </span>
                    </label>

                    {selectedAppToInstall.port && (
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={allowFirewall}
                          onChange={(e) => setAllowFirewall(e.target.checked)}
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <span>
                          {lang === 'id'
                            ? `Buka port ${installPort || selectedAppToInstall.port} pada firewall UFW`
                            : `Allow port ${installPort || selectedAppToInstall.port} in UFW firewall`}
                        </span>
                      </label>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'id' ? 'Sedang menginstal dan mengonfigurasi paket...' : 'Installing and configuring package...'}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
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
                    onClick={() => setSelectedAppToInstall(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    {lang === 'id' ? 'Batal' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteInstall}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'id' ? 'Mulai Pemasangan' : 'Start Installation'}</span>
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-500 font-mono">
                  {lang === 'id' ? 'Sedang memproses script shell...' : 'Processing shell scripts...'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
