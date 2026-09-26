import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import {
  Globe,
  Database,
  ShieldCheck,
  Server,
  Zap,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Lock,
  User,
  Key,
  AlertTriangle,
  Terminal,
  Activity,
  Layers,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  Info,
  Code2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CyberPanelConsoleModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { selectedServer, addToast, lang, setIsReinstallModalOpen } = useVps();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'websites' | 'litespeed' | 'troubleshoot'>('dashboard');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Simulated website list in CyberPanel
  const [websites, setWebsites] = useState([
    {
      id: 'site-1',
      domain: selectedServer?.hostname || 'denbagoes.my.id',
      php: 'PHP 8.2',
      ssl: 'Let\'s Encrypt (Aktif)',
      lscache: true,
      cms: 'WordPress 6.7 + LSCache',
      diskUsedMb: 420,
    },
  ]);

  // Form to add website
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newPhp, setNewPhp] = useState('8.2');
  const [installWp, setInstallWp] = useState(true);

  if (!isOpen || !selectedServer) return null;

  const credentials = selectedServer.activePanel?.credentials || {
    user: 'admin',
    pass: 'Cyber#99Admin*Pass',
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    addToast(
      lang === 'id' ? 'Disalin' : 'Copied',
      `${label} ${lang === 'id' ? 'berhasil disalin ke clipboard.' : 'copied to clipboard.'}`,
      'info'
    );
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const handleCreateWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    const newSite = {
      id: 'site-' + Date.now(),
      domain: newDomain.trim().toLowerCase(),
      php: `PHP ${newPhp}`,
      ssl: 'Let\'s Encrypt (Otomatis)',
      lscache: true,
      cms: installWp ? 'WordPress 6.7 + LSCache' : 'PHP Native',
      diskUsedMb: installWp ? 310 : 45,
    };

    setWebsites((prev) => [...prev, newSite]);
    setNewDomain('');
    setIsAddingSite(false);
    addToast(
      lang === 'id' ? 'Website Dibuat' : 'Website Created',
      lang === 'id'
        ? `Website ${newSite.domain} berhasil didaftarkan di CyberPanel dengan LSCache aktif!`
        : `Website ${newSite.domain} created with LSCache enabled.`,
      'success'
    );
  };

  const handleRestartOls = () => {
    addToast(
      lang === 'id' ? 'Merestart OpenLiteSpeed' : 'Restarting OpenLiteSpeed',
      lang === 'id' ? 'Layanan lsws & lscpd sedang dimulai ulang...' : 'Restarting lsws and lscpd...',
      'info'
    );
    setTimeout(() => {
      addToast(
        lang === 'id' ? 'OpenLiteSpeed Aktif' : 'OpenLiteSpeed Running',
        lang === 'id' ? 'Server OpenLiteSpeed & LSCache Daemon berhasil direstart.' : 'Services restarted successfully.',
        'success'
      );
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#0c101d] border border-purple-500/30 shadow-2xl shadow-purple-950/40 overflow-hidden flex flex-col max-h-[94vh]">
        {/* CyberPanel Top Header Bar */}
        <div className="px-6 py-4 border-b border-purple-900/30 flex items-center justify-between bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-sm shadow-purple-500/20">
              <Zap className="w-5 h-5 fill-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>CyberPanel</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30 font-normal">
                    v2.3.5 Enterprise / OLS
                  </span>
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <span>{selectedServer.ip}:8090</span>
                <span>·</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> OpenLiteSpeed Active
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const url = `https://${selectedServer.ip}:8090`;
                window.open(url, '_blank');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer shadow-sm"
              title="Buka URL asli di tab baru"
            >
              <span>Buka di Browser</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CyberPanel Sub-navigation */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-b border-purple-900/20 flex items-center justify-between text-xs overflow-x-auto gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Dashboard & Server</span>
            </button>
            <button
              onClick={() => setActiveTab('websites')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'websites'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Websites & WordPress ({websites.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('litespeed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'litespeed'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>OpenLiteSpeed (Port 7080)</span>
            </button>
            <button
              onClick={() => setActiveTab('troubleshoot')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'troubleshoot'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Solusi Error Akses & SSL</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>User: <strong className="text-white">{credentials.user}</strong></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Credentials Box */}
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Kredensial Akses Panel Resmi CyberPanel</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Gunakan kredensial ini untuk login ke web dashboard port 8090.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-purple-500/20 flex items-center gap-2">
                    <span className="text-slate-400">USER:</span>
                    <span className="text-white font-bold">{credentials.user}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(credentials.user, 'Username')}
                      className="text-purple-400 hover:text-purple-300 cursor-pointer"
                    >
                      {copiedItem === 'Username' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-purple-500/20 flex items-center gap-2">
                    <span className="text-slate-400">PASS:</span>
                    <span className="text-amber-300 font-bold">{credentials.pass}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(credentials.pass, 'Password')}
                      className="text-purple-400 hover:text-purple-300 cursor-pointer"
                    >
                      {copiedItem === 'Password' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(`https://${selectedServer.ip}:8090`, 'URL 8090')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-sans font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Salin URL 8090</span>
                  </button>
                </div>
              </div>

              {/* Stats Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">Websites Aktif</span>
                  <span className="text-2xl font-bold font-mono text-purple-400">{websites.length}</span>
                  <span className="text-[10px] text-emerald-400 block">LSCache Ready</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">MariaDB Database</span>
                  <span className="text-2xl font-bold font-mono text-sky-400">1</span>
                  <span className="text-[10px] text-slate-500 block">Port 3306</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">Penggunaan RAM</span>
                  <span className="text-2xl font-bold font-mono text-amber-400">{selectedServer.metrics.ramPct}%</span>
                  <span className="text-[10px] text-slate-400 block">{((selectedServer.specs.ramGb * selectedServer.metrics.ramPct) / 100).toFixed(2)} GB / {selectedServer.specs.ramGb} GB</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">OpenLiteSpeed Status</span>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-400 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>RUNNING</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Port 7080 / 80 / 443</span>
                </div>
              </div>

              {/* Quick Actions & Features */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
                  Fitur Unggulan CyberPanel
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Akselerasi LiteSpeed Cache</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Kompatibel 100% dengan plugin LSCache resmi WordPress. Menghandle ribuan pengunjung bersamaan dengan konsumsi RAM rendah.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">SSL Let's Encrypt Gratis</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Penerbitan dan perpanjangan otomatis sertifikat SSL HTTPS untuk setiap domain dan subdomain tanpa repot konfirmasi manual.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Deploy WordPress 1-Klik</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Membuat database, user MySQL, menginstal core WordPress, dan menyetel konfigurasi cache secara instan dalam hitungan detik.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Management */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300">Daemon Layanan:</span>
                  <code className="px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-slate-800 font-mono">lscpd (GUI)</code>
                  <code className="px-2 py-0.5 rounded bg-slate-900 text-emerald-300 border border-slate-800 font-mono">lsws (Web)</code>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRestartOls}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                    <span>Restart OpenLiteSpeed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('troubleshoot')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Bantuan Masalah Akses</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEBSITES & WORDPRESS */}
          {activeTab === 'websites' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Daftar Website & Domain</h3>
                  <p className="text-xs text-slate-400">Kelola situs web dan instalasi WordPress berbasis OpenLiteSpeed</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingSite(!isAddingSite)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingSite ? 'Tutup Form' : 'Tambah Website Baru'}</span>
                </button>
              </div>

              {/* Add Website Form */}
              {isAddingSite && (
                <form onSubmit={handleCreateWebsite} className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-4 animate-in fade-in">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wide">Form Pembuatan Situs Baru</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Nama Domain / Subdomain:</label>
                      <input
                        type="text"
                        placeholder="contoh: app.denbagoes.my.id"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Versi PHP:</label>
                      <select
                        value={newPhp}
                        onChange={(e) => setNewPhp(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 text-xs"
                      >
                        <option value="8.3">PHP 8.3 (Terbaru & Tercepat)</option>
                        <option value="8.2">PHP 8.2 (Stabil & Recommended)</option>
                        <option value="8.1">PHP 8.1 (LTS)</option>
                        <option value="7.4">PHP 7.4 (Legacy)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="installWpCheck"
                      checked={installWp}
                      onChange={(e) => setInstallWp(e.target.checked)}
                      className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="installWpCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
                      Otomatis Pasang WordPress 6.7 + Plugin LiteSpeed Cache (LSCache)
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingSite(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Buat Website Sekarang</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Websites Table */}
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">DOMAIN</th>
                      <th className="py-2.5 px-4">ENGINE / CMS</th>
                      <th className="py-2.5 px-4">PHP</th>
                      <th className="py-2.5 px-4">SSL HTTPS</th>
                      <th className="py-2.5 px-4 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {websites.map((site) => (
                      <tr key={site.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-purple-400" />
                            <span className="font-bold text-white font-mono">{site.domain}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>{site.cms}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">{site.php}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                            {site.ssl}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`https://${site.domain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                          >
                            <span>Buka Situs</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: OPENLITESPEED */}
          {activeTab === 'litespeed' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">OpenLiteSpeed Web Server Console</h4>
                      <p className="text-xs text-slate-400">WebAdmin GUI port 7080 untuk fine-tuning cache & HTTP/3</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `https://${selectedServer.ip}:7080`;
                      window.open(url, '_blank');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors cursor-pointer"
                  >
                    <span>Buka WebAdmin (Port 7080)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Protokol Modern</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">HTTP/3 & QUIC Active</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Worker Threads</span>
                    <span className="font-bold text-white font-mono text-sm">4 Workers (Auto-Scaled)</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Cache Hit Rate Rata-rata</span>
                    <span className="font-bold text-purple-300 font-mono text-sm">96.4% Terlayani dari RAM</span>
                  </div>
                </div>
              </div>

              {/* Password for WebAdmin */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-white">Kredensial Default OpenLiteSpeed WebAdmin:</h4>
                <p className="text-slate-400 text-[11px]">
                  Jika saat membuka port 7080 diminta login OpenLiteSpeed WebAdmin terpisah:
                </p>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] flex items-center justify-between">
                  <span className="text-slate-300">User: <strong className="text-white">admin</strong> · Pass: <strong className="text-amber-300">{credentials.pass}</strong></span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`admin / ${credentials.pass}`, 'Kredensial OLS')}
                    className="text-purple-400 hover:text-purple-300 text-xs cursor-pointer"
                  >
                    Salin
                  </button>
                </div>
                <p className="text-slate-500 text-[10px]">
                  Perintah setel password baru OpenLiteSpeed via terminal SSH: <code className="text-slate-300">/usr/local/lsws/admin/misc/admpass.sh</code>
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TROUBLESHOOTING & ACCESS PROBLEMS */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Mengapa CyberPanel Tidak Bisa Diakses di Browser Setelah Diinstal?</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  CyberPanel menggunakan sertifikat SSL mandiri (Self-Signed SSL) dan berjalan pada port khusus <strong>8090</strong>. Berikut 4 langkah praktis agar Anda bisa mengaksesnya 100% tanpa hambatan:
                </p>
              </div>

              {/* Step 0: Real execution check */}
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[11px] font-bold">0</span>
                    <span>PENTING: Apakah CyberPanel Sudah Benar-Benar Terpasang di VPS Fisik Anda?</span>
                  </h4>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">Pemeriksaan Utama</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Jika VPS Anda belum dihubungkan dengan IP dan Password root SSH di dashboard, perintah belum dieksekusi ke mesin fisik Anda. Anda dapat memasang langsung ke server fisik dengan menjalankan perintah instalasi resmi ini di terminal PuTTY / Termius / SSH Anda:
                </p>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] flex items-center justify-between">
                  <code className="text-emerald-300 break-all select-all">
                    bash &lt;(curl -s https://cyberpanel.net/install.sh || wget -q -O - https://cyberpanel.net/install.sh)
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('bash <(curl -s https://cyberpanel.net/install.sh || wget -q -O - https://cyberpanel.net/install.sh)', 'Skrip CyberPanel')}
                    className="ml-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-sans text-xs cursor-pointer shrink-0"
                  >
                    Salin
                  </button>
                </div>
                <p className="text-slate-400 text-[10px]">
                  ⏱️ Catatan: Di server fisik, proses instalasi CyberPanel membutuhkan waktu sekitar <strong>5 - 15 menit</strong> untuk mengunduh paket OpenLiteSpeed, MariaDB, PowerDNS, dan daemon Python.
                </p>
              </div>

              {/* Step 1: Bypass Self-Signed SSL */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[11px] font-bold">1</span>
                    <span>Bypass Peringatan Browser "Koneksi Anda Tidak Privat" (SSL Self-Signed)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Wajib Dilakukan</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Saat membuka <code className="text-purple-300 font-mono">https://{selectedServer.ip}:8090</code>, Chrome/Edge akan menampilkan layar merah/abu-abu bertuliskan <em>"Your connection is not private / NET::ERR_CERT_AUTHORITY_INVALID"</em>.
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <p>Cara membukanya sangat mudah:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Klik tombol <strong>"Lanjutan / Advanced"</strong> di bagian bawah halaman browser Anda.</li>
                    <li>Klik tautan <strong>"Lanjutkan ke {selectedServer.ip} (tidak aman) / Proceed to unsafe"</strong>.</li>
                    <li>Halaman login CyberPanel akan langsung terbuka secara normal!</li>
                  </ol>
                </div>
              </div>

              {/* Step 2: Open Firewall Ports */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[11px] font-bold">2</span>
                    <span>Buka Port 8090 & 7080 di Firewall VPS Fisik</span>
                  </h4>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Jika Browser Blank / Timeout</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Jika browser menampilkan <em>"This site can't be reached / Connection timed out"</em>, port 8090 belum dibuka di firewall UFW VPS atau Security Group provider Anda. Jalankan perintah ini di terminal:
                </p>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] flex items-center justify-between">
                  <code className="text-emerald-300 break-all select-all">
                    sudo ufw allow 8090/tcp && sudo ufw allow 7080/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw reload
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('sudo ufw allow 8090/tcp && sudo ufw allow 7080/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw reload', 'Perintah Firewall')}
                    className="ml-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-sans text-xs cursor-pointer shrink-0"
                  >
                    Salin
                  </button>
                </div>
              </div>

              {/* Step 3: Check OS Compatibility */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[11px] font-bold">3</span>
                    <span>PENTING: Dukungan Sistem Operasi (Kompatibilitas CyberPanel)</span>
                  </h4>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Skrip resmi CyberPanel <strong>TIDAK MENDUKUNG Debian</strong> dan <strong>Ubuntu 24.04</strong>. Developer CyberPanel hanya mendukung secara resmi di:
                  <br />
                  <strong className="text-emerald-400 font-mono">✅ Ubuntu 22.04 LTS (Jammy)</strong> atau <strong className="text-emerald-400 font-mono">Ubuntu 20.04 LTS (Focal)</strong>.
                </p>

                <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-500/30 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white">Ingin Mengubah OS ke Ubuntu 22.04 LTS?</span>
                    <p className="text-[11px] text-slate-400">Instal ulang bersih ke Ubuntu 22.04 LTS agar CyberPanel berjalan 100% tanpa error dependensi.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setIsReinstallModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Instal Ubuntu 22.04
                  </button>
                </div>
              </div>

              {/* Step 4: Reset Password Command */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[11px] font-bold">4</span>
                    <span>Cara Reset Kata Sandi Admin CyberPanel via SSH Terminal</span>
                  </h4>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Jika Anda lupa kata sandi admin atau ditolak saat login, jalankan perintah ini di terminal root:
                </p>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] flex items-center justify-between">
                  <code className="text-amber-300 select-all">sudo cyberpanel resetPassword</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('sudo cyberpanel resetPassword', 'Reset Password')}
                    className="ml-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-sans text-xs cursor-pointer"
                  >
                    Salin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-purple-900/30 bg-slate-950/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Port 8090 (CyberPanel) · Port 7080 (OpenLiteSpeed)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Tutup Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
