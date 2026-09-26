import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import {
  Globe,
  Plus,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  RotateCw,
  Copy,
  Check,
  Zap,
  Server,
  Terminal,
  Lock,
  ArrowRight,
  Radio,
  FileCode,
} from 'lucide-react';

export const DomainManager: React.FC = () => {
  const {
    selectedServer,
    domainProxies,
    addDomainProxy,
    deleteDomainProxy,
    toggleDomainProxy,
    requestSslCertificate,
    checkDomainDns,
    setIsCloudflareModalOpen,
    executeRemoteCommand,
    lang,
    addToast,
  } = useVps();

  // Form states
  const [newDomain, setNewDomain] = useState('server.denbagoes.my.id');
  const [targetPort, setTargetPort] = useState<number>(3000);
  const [customPortInput, setCustomPortInput] = useState<string>('3000');
  const [servicePreset, setServicePreset] = useState<'vela' | 'aapanel' | 'cyberpanel' | 'custom'>('vela');
  const [forceHttps, setForceHttps] = useState(true);
  const [enableWebSocket, setEnableWebSocket] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // DNS Check states
  const [isCheckingDns, setIsCheckingDns] = useState(false);
  const [dnsCheckDomain, setDnsCheckDomain] = useState('server.denbagoes.my.id');
  const [dnsResult, setDnsResult] = useState<{
    domain: string;
    isMatch: boolean;
    targetIp: string;
    resolvedIp?: string;
  } | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!selectedServer) return null;

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

  const handlePresetChange = (preset: 'vela' | 'aapanel' | 'cyberpanel' | 'custom') => {
    setServicePreset(preset);
    if (preset === 'vela') {
      setTargetPort(3000);
      setCustomPortInput('3000');
    } else if (preset === 'aapanel') {
      setTargetPort(7800);
      setCustomPortInput('7800');
    } else if (preset === 'cyberpanel') {
      setTargetPort(8090);
      setCustomPortInput('8090');
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!cleanDomain) {
      addToast(
        lang === 'id' ? 'Nama Domain Wajib Diisi' : 'Domain Name Required',
        lang === 'id' ? 'Silakan masukkan nama domain (misal: server.denbagoes.my.id)' : 'Please enter a valid domain name.',
        'warning'
      );
      return;
    }

    const finalPort = servicePreset === 'custom' ? parseInt(customPortInput, 10) || 3000 : targetPort;

    setIsAdding(true);
    try {
      addDomainProxy({
        domain: cleanDomain,
        targetPort: finalPort,
        sslStatus: 'active',
        forceHttps,
        websocket: enableWebSocket,
        active: true,
      });

      // If VPS has real SSH credentials, deploy Nginx reverse proxy configuration automatically
      if (selectedServer.connection?.rootPassword || selectedServer.connection?.sshPrivateKey) {
        const nginxConf = `cat << 'EOF' > /etc/nginx/sites-available/${cleanDomain}
server {
    listen 80;
    listen [::]:80;
    server_name ${cleanDomain};

    location / {
        proxy_pass http://127.0.0.1:${finalPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
ln -sf /etc/nginx/sites-available/${cleanDomain} /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
`;
        executeRemoteCommand(nginxConf, selectedServer.id).catch(() => {});
      }

      addToast(
        lang === 'id' ? 'Domain Berhasil Dihubungkan!' : 'Domain Configured Successfully!',
        lang === 'id'
          ? `Domain https://${cleanDomain} telah di-proxy ke port ${finalPort} (${selectedServer.ip}).`
          : `Domain https://${cleanDomain} mapped to port ${finalPort}.`,
        'success'
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleLiveDnsCheck = async () => {
    if (!dnsCheckDomain.trim()) return;
    setIsCheckingDns(true);
    try {
      const res = await checkDomainDns(dnsCheckDomain.trim(), selectedServer.ip);
      setDnsResult(res);
      addToast(
        lang === 'id' ? 'Pengecekan DNS Selesai' : 'DNS Check Finished',
        res.isMatch
          ? `Domain ${res.domain} telah mengarah ke IP ${selectedServer.ip}.`
          : `Domain ${res.domain} belum mengarah ke IP ${selectedServer.ip}.`,
        res.isMatch ? 'success' : 'warning'
      );
    } finally {
      setIsCheckingDns(false);
    }
  };

  // Nginx Config Script snippet for user copy-paste
  const cleanDomainName = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '') || 'server.denbagoes.my.id';
  const currentPort = servicePreset === 'custom' ? parseInt(customPortInput, 10) || 3000 : targetPort;

  const nginxScriptSnippet = `cat << 'EOF' > /etc/nginx/sites-available/${cleanDomainName}
server {
    listen 80;
    listen [::]:80;
    server_name ${cleanDomainName};

    location / {
        proxy_pass http://127.0.0.1:${currentPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
ln -sf /etc/nginx/sites-available/${cleanDomainName} /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d ${cleanDomainName} --non-interactive --agree-tos -m admin@${cleanDomainName} --redirect`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>{lang === 'id' ? 'Manajemen Domain Kustom & SSL' : 'Custom Domains & SSL Management'}</span>
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">
              Nginx + Let's Encrypt
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'id'
              ? `Hubungkan nama domain Anda (misal server.denbagoes.my.id) langsung ke VelaVPS atau aplikasi di node ${selectedServer.hostname}`
              : `Map your custom domain to VelaVPS or applications running on ${selectedServer.hostname}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCloudflareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 rounded-xl transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span>{lang === 'id' ? 'Koneksi Cloudflare Tunnel' : 'Cloudflare Tunnel'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Add Domain Form & DNS Checker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Form Masukkan Domain Baru */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {lang === 'id' ? 'Masukkan & Hubungkan Domain Baru' : 'Add & Map New Domain'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'id' ? 'Akses aplikasi Anda dengan URL domain resmi ber-SSL' : 'Access your service via clean HTTPS URL'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAddDomain} className="space-y-4">
            {/* Input Nama Domain */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                {lang === 'id' ? 'Nama Domain / Subdomain' : 'Domain / Subdomain Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => {
                    setNewDomain(e.target.value);
                    setDnsCheckDomain(e.target.value);
                  }}
                  placeholder="server.denbagoes.my.id"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'id'
                  ? `Pastikan A Record domain mengarah ke IP Server Anda: `
                  : `Ensure DNS A Record points to Server IP: `}
                <strong className="text-emerald-400 font-mono">{selectedServer.ip}</strong>
              </p>
            </div>

            {/* Target Layanan / Port Preset */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                {lang === 'id' ? 'Pilih Target Layanan / Port yang Diarahkan' : 'Target Service / Port to Proxy'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetChange('vela')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    servicePreset === 'vela'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">VelaVPS Panel</div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">Port 3000</div>
                  <div className="text-[10px] text-slate-500 mt-1">Orchestrator Utama</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetChange('aapanel')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    servicePreset === 'aapanel'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">aaPanel GUI</div>
                  <div className="text-[11px] font-mono text-amber-400 mt-0.5">Port 7800</div>
                  <div className="text-[10px] text-slate-500 mt-1">Hosting Control Panel</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetChange('cyberpanel')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    servicePreset === 'cyberpanel'
                      ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">CyberPanel</div>
                  <div className="text-[11px] font-mono text-sky-400 mt-0.5">Port 8090</div>
                  <div className="text-[10px] text-slate-500 mt-1">OpenLiteSpeed</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetChange('custom')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    servicePreset === 'custom'
                      ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">Port Kustom</div>
                  <div className="text-[11px] font-mono text-purple-400 mt-0.5">Input Manual</div>
                  <div className="text-[10px] text-slate-500 mt-1">App Node/Python/Go</div>
                </button>
              </div>

              {servicePreset === 'custom' && (
                <div className="mt-2.5">
                  <label className="block text-[11px] text-slate-300 mb-1">
                    {lang === 'id' ? 'Masukkan Nomor Port Lokal VPS (contoh: 8080, 5000):' : 'Enter Local VPS Port:'}
                  </label>
                  <input
                    type="number"
                    value={customPortInput}
                    onChange={(e) => setCustomPortInput(e.target.value)}
                    placeholder="3000"
                    className="w-full sm:w-48 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono text-white"
                  />
                </div>
              )}
            </div>

            {/* Checkboxes: Force HTTPS & WebSockets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceHttps}
                  onChange={(e) => setForceHttps(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-0 focus:outline-none"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    {lang === 'id' ? 'Aktifkan Otomatis SSL HTTPS' : 'Force SSL HTTPS'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Let's Encrypt TLS 1.3 gratis (Auto-redirect 80 -&gt; 443)
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableWebSocket}
                  onChange={(e) => setEnableWebSocket(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0 focus:outline-none"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    {lang === 'id' ? 'Dukungan WebSocket (WSS)' : 'Enable WebSocket (WSS)'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Dibutuhkan untuk Web SSH Terminal & real-time telemetri
                  </span>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAdding}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-950/40 disabled:opacity-50 cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>
                {isAdding
                  ? (lang === 'id' ? 'Menghubungkan...' : 'Mapping...')
                  : (lang === 'id' ? `Hubungkan Domain ${newDomain} Sekarang` : `Map Domain ${newDomain} Now`)}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column (1 Col): Live DNS Diagnostic & Quick Steps */}
        <div className="space-y-4">
          {/* DNS Lookup Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-sm">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 text-sky-400" />
              <span>{lang === 'id' ? 'Uji Propagasi DNS Domain' : 'Test DNS Propagation'}</span>
            </h3>

            <div className="space-y-2">
              <input
                type="text"
                value={dnsCheckDomain}
                onChange={(e) => setDnsCheckDomain(e.target.value)}
                placeholder="server.denbagoes.my.id"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white"
              />
              <button
                type="button"
                onClick={handleLiveDnsCheck}
                disabled={isCheckingDns}
                className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCw className={`w-3 h-3 ${isCheckingDns ? 'animate-spin' : ''}`} />
                <span>{isCheckingDns ? 'Memeriksa DNS...' : 'Cek Status DNS'}</span>
              </button>
            </div>

            {dnsResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                  dnsResult.isMatch
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {dnsResult.isMatch ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{dnsResult.isMatch ? 'DNS Telah Mengarah (OK)' : 'DNS Belum Mengarah'}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Target IP VPS: <strong className="text-white">{selectedServer.ip}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Quick DNS Configuration Guide */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-sm text-xs">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'id' ? 'Pengaturan DNS Anda' : 'Your DNS Record'}</span>
            </h4>
            <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 space-y-1">
              <div>Type: <span className="text-amber-400 font-bold">A</span></div>
              <div>Name / Host: <span className="text-sky-300 font-bold">server</span> (atau @)</div>
              <div>Points to: <span className="text-emerald-400 font-bold">{selectedServer.ip}</span></div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lang === 'id'
                ? 'Tambahkan A record tersebut di penyedia DNS domain Anda (Cloudflare, Niagahoster, Rumahweb, dsb).'
                : 'Add this A record to your domain DNS provider.'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Configured Domains Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">
              {lang === 'id' ? 'Daftar Domain Aktif & Reverse Proxy' : 'Active Domain Proxies'}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
              {domainProxies.length} Domain
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-medium">Domain</th>
                <th className="pb-3 font-medium">Target Port</th>
                <th className="pb-3 font-medium">Status SSL</th>
                <th className="pb-3 font-medium">Protokol</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {domainProxies.map((proxy) => (
                <tr key={proxy.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 font-bold text-white flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{proxy.domain}</span>
                    <a
                      href={`https://${proxy.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-sky-300 transition-colors"
                      title="Buka di tab baru"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-3 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
                      http://127.0.0.1:{proxy.targetPort}
                    </span>
                  </td>
                  <td className="py-3">
                    {proxy.sslStatus === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Lock className="w-2.5 h-2.5 text-emerald-400" />
                        <span>SSL Aktif (TLS 1.3)</span>
                      </span>
                    ) : proxy.sslStatus === 'generating' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                        <RotateCw className="w-2.5 h-2.5 animate-spin" />
                        <span>Menerbitkan SSL...</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => requestSslCertificate(proxy.id)}
                        className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-sans font-semibold transition-colors"
                      >
                        Pasang SSL
                      </button>
                    )}
                  </td>
                  <td className="py-3 text-slate-400">
                    {proxy.forceHttps ? 'HTTPS (443)' : 'HTTP (80)'}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleDomainProxy(proxy.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold font-sans transition-colors ${
                        proxy.active
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {proxy.active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => requestSslCertificate(proxy.id)}
                        className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Perbarui Sertifikat SSL Let's Encrypt"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteDomainProxy(proxy.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Hapus Konfigurasi Domain"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Script Konfigurasi Nginx Otomatis */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              {lang === 'id' ? 'Script Konfigurasi Nginx Otomatis di VPS' : 'Automated Nginx Script'}
            </h3>
          </div>
          <button
            onClick={() => handleCopy(nginxScriptSnippet, 'nginx_script', 'Script Nginx')}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors"
          >
            {copiedKey === 'nginx_script' ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Salin Script Bash</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-400">
          {lang === 'id'
            ? `Jika Anda ingin menerapkan konfigurasi secara manual di terminal VPS Anda untuk domain ${cleanDomainName}:`
            : `Run this 1-step bash script on your VPS terminal:`}
        </p>
        <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre">
          {nginxScriptSnippet}
        </pre>
      </div>
    </div>
  );
};
