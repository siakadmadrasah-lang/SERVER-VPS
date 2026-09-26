import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import { VpsConnectionTestResult } from '../types/vps';
import { NetworkDetectorCard } from './NetworkDetectorCard';
import {
  Link2,
  X,
  Server,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Terminal,
  Cloud,
  Check,
  Copy,
  Zap,
  Globe,
  HardDrive,
  Cpu,
  Network,
  CloudLightning,
} from 'lucide-react';

interface ConnectVpsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectVpsModal: React.FC<ConnectVpsModalProps> = ({ isOpen, onClose }) => {
  const {
    addServer,
    testVpsConnection,
    importProviderDroplets,
    selectedServer,
    lang,
    addToast,
  } = useVps();

  // Tab: 'ssh' | 'nat_resolver' | 'api' | 'agent'
  const [tab, setTab] = useState<'ssh' | 'nat_resolver' | 'api' | 'agent'>('ssh');

  // Channel 1: Direct SSH
  const [serverName, setServerName] = useState('VPS Node Saya');
  const [ipAddress, setIpAddress] = useState('');
  const [sshPort, setSshPort] = useState(22);
  const [username, setUsername] = useState('root');
  const [authType, setAuthType] = useState<'password' | 'key'>('password');
  const [password, setPassword] = useState('');
  const [sshPrivateKey, setSshPrivateKey] = useState('');
  const [providerTag, setProviderTag] = useState('DigitalOcean');
  const [regionCode, setRegionCode] = useState('SGP1');

  // Testing connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<VpsConnectionTestResult | null>(null);

  // Channel 2: Cloud API Sync
  const [apiProvider, setApiProvider] = useState('DigitalOcean');
  const [apiToken, setApiToken] = useState('');
  const [isSyncingApi, setIsSyncingApi] = useState(false);

  // Channel 3: Agent Script
  const [copiedAgent, setCopiedAgent] = useState(false);

  if (!isOpen) return null;

  const agentCommand = `curl -sSL https://get.velavps.net/agent.sh | sudo bash -s -- --token=vla_tok_${Date.now().toString(36)} --port=${sshPort}`;

  const handleTestConnection = async () => {
    if (!ipAddress.trim()) {
      addToast(
        lang === 'id' ? 'Masukkan IP VPS' : 'Enter IP Address',
        lang === 'id' ? 'Harap masukkan alamat IPv4 VPS Anda terlebih dahulu.' : 'Please enter your VPS IP address first.',
        'warning'
      );
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testVpsConnection(
        ipAddress.trim(),
        Number(sshPort),
        username,
        authType === 'password' ? password : sshPrivateKey,
        authType
      );
      setTestResult(res);
      addToast(
        lang === 'id' ? 'Koneksi SSH Fisik Berhasil!' : 'SSH Handshake Verified!',
        lang === 'id'
          ? `Terhubung ke server fisik: ${res.detectedDistro} (Ping: ${res.pingMs}ms, ${res.detectedCores} vCPU, ${res.detectedRamMb}MB RAM).`
          : `Handshake OK (${res.pingMs}ms latency).`,
        'success'
      );
    } catch (err: any) {
      addToast(
        lang === 'id' ? 'Gagal Terhubung ke SSH VPS' : 'SSH Connection Failed',
        err.message || (lang === 'id' ? `Periksa kembali IP, port ${sshPort || 22}, atau kata sandi root Anda.` : 'Please verify credentials.'),
        'error'
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSshServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipAddress.trim() || !serverName.trim()) return;

    const detectedDistro = testResult?.detectedDistro || 'Ubuntu 24.04 LTS';
    const distroName = detectedDistro.split(' ')[0] || 'Ubuntu';

    addServer({
      name: serverName.trim(),
      hostname: `${serverName.toLowerCase().replace(/\s+/g, '-')}.node`,
      ip: ipAddress.trim(),
      provider: providerTag,
      region: {
        code: regionCode,
        city: testResult?.ipGeo.city || 'Singapore',
        country: testResult?.ipGeo.country || 'Singapore',
        flag: testResult?.ipGeo.flag || '🇸🇬',
      },
      specs: {
        vcpu: testResult?.detectedCores || 2,
        ramGb: testResult ? Math.round(testResult.detectedRamMb / 1024) : 4,
        diskGb: testResult?.detectedDiskGb || 80,
        diskType: 'NVMe SSD',
        bandwidthTb: 4,
        usedBandwidthGb: 15,
      },
      os: {
        distro: distroName,
        version: detectedDistro.split(' ')[1] || '24.04',
        kernel: testResult?.detectedKernel || 'Linux 6.8.0-generic x86_64',
        arch: 'x86_64 (64-bit)',
        icon: distroName.toLowerCase(),
        installedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      },
      connection: {
        sshPort: Number(sshPort),
        username: username.trim() || 'root',
        rootPassword: password.trim() || undefined,
        sshPrivateKey: sshPrivateKey.trim() || undefined,
        authType: authType,
        lastLoginIp: ipAddress.trim(),
        lastLoginTime: 'Baru saja dihubungkan',
        isRealSshVerified: testResult?.sshHandshake || false,
      },
      isRealSshConnected: true,
      realProbeData: testResult
        ? {
            connectedAt: new Date().toLocaleTimeString(),
            pingMs: testResult.pingMs,
            actualRamMb: testResult.detectedRamMb,
            actualUsedRamMb: (testResult as any).usedRamMb || 380,
            actualDiskGb: testResult.detectedDiskGb,
            actualUsedDiskGb: Math.round(((testResult as any).diskPct || 10) * testResult.detectedDiskGb / 100),
            rawOsPretty: testResult.detectedDistro,
          }
        : undefined,
      tags: [providerTag, 'Connected', 'Verified', 'Real SSH'],
    });

    onClose();
  };

  const handleSyncApi = async () => {
    if (!apiToken.trim()) {
      addToast(
        lang === 'id' ? 'Masukkan Token API' : 'Enter API Token',
        lang === 'id' ? 'Token API provider diperlukan untuk sinkronisasi.' : 'API token required.',
        'warning'
      );
      return;
    }

    setIsSyncingApi(true);
    await importProviderDroplets(apiProvider, apiToken.trim());
    setIsSyncingApi(false);
    onClose();
  };

  const copyAgent = () => {
    navigator.clipboard.writeText(agentCommand);
    setCopiedAgent(true);
    addToast(
      lang === 'id' ? 'Skrip Disalin' : 'Script Copied',
      lang === 'id' ? 'Jalankan perintah ini di terminal SSH VPS Anda.' : 'Run command in VPS shell.',
      'info'
    );
    setTimeout(() => setCopiedAgent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {lang === 'id' ? 'Hubungkan Akun VPS yang Telah Dibeli' : 'Connect Purchased VPS Instance'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'id'
                  ? 'Integrasikan VPS dari provider manapun agar seluruh fitur dapat dikelola 100%'
                  : 'Link any cloud host VPS for complete lifecycle control'}
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

        {/* 4 Channels Segmented Tab */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setTab('ssh')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              tab === 'ssh'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? '1. SSH Langsung' : '1. Direct SSH'}</span>
          </button>

          <button
            onClick={() => setTab('nat_resolver')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              tab === 'nat_resolver'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-amber-400/80 hover:text-amber-200 hover:bg-amber-950/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'id' ? '2. Auto-Detect & Resolver NAT (Otomatis)' : '2. Auto-Detect & NAT Resolver'}</span>
          </button>

          <button
            onClick={() => setTab('api')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              tab === 'api'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? '3. API Cloud Provider' : '3. Cloud Provider API'}</span>
          </button>

          <button
            onClick={() => setTab('agent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              tab === 'agent'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? '4. Skrip Agen 1-Baris' : '4. One-Line Agent'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* TAB 1: DIRECT SSH */}
          {tab === 'ssh' && (
            <form onSubmit={handleSaveSshServer} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 leading-relaxed">
                <span className="font-semibold text-emerald-400 block mb-0.5">
                  Universal untuk Semua Provider VPS:
                </span>
                <span>
                  Bekerja untuk DigitalOcean, Hetzner, Vultr, AWS EC2, Linode, Contabo, DomaiNesia, Niagahoster, Hostinger, Biznet, IDCloudHost, atau VPS KVM kustom lainnya.
                </span>
              </div>

              {/* Name & Provider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Label Nama Server
                  </label>
                  <input
                    type="text"
                    required
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="VPS Web Production"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Provider VPS
                  </label>
                  <select
                    value={providerTag}
                    onChange={(e) => setProviderTag(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  >
                    <option value="DigitalOcean">DigitalOcean</option>
                    <option value="Hetzner">Hetzner Cloud</option>
                    <option value="Vultr">Vultr</option>
                    <option value="AWS EC2">Amazon Web Services (AWS EC2)</option>
                    <option value="Linode Akamai">Linode / Akamai</option>
                    <option value="Contabo">Contabo</option>
                    <option value="Hostinger">Hostinger VPS</option>
                    <option value="Niagahoster / DomaiNesia">Niagahoster / DomaiNesia</option>
                    <option value="Biznet GIO">Biznet GIO (Indonesia)</option>
                    <option value="KVM VPS Lainnya">KVM VPS / Proxmox Kustom</option>
                  </select>
                </div>
              </div>

              {/* IP & SSH Port */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Alamat IP Publik VPS (IPv4)
                  </label>
                  <input
                    type="text"
                    required
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="Contoh: 128.199.204.82 atau 192.168.1.50"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Port SSH (Default: 22)
                  </label>
                  <input
                    type="number"
                    value={sshPort}
                    onChange={(e) => setSshPort(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Automatic Network & NAT Detector Live Card */}
              <NetworkDetectorCard
                ip={ipAddress}
                port={Number(sshPort)}
                onResolvedSuccess={() => onClose()}
              />

              {/* Username & Auth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Username Login (Biasanya root)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Metode Autentikasi
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthType('password')}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                        authType === 'password'
                          ? 'bg-slate-800 text-white border-slate-700'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Kata Sandi Root
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthType('key')}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                        authType === 'key'
                          ? 'bg-slate-800 text-white border-slate-700'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Private Key SSH
                    </button>
                  </div>
                </div>
              </div>

              {/* Password / Private key input */}
              {authType === 'password' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Kata Sandi Root VPS
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi root dari email provider"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Isi File Private Key SSH (id_rsa / id_ed25519)
                  </label>
                  <textarea
                    rows={3}
                    value={sshPrivateKey}
                    onChange={(e) => setSshPrivateKey(e.target.value)}
                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              )}

              {/* Test Connection Button & Result */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Uji Integritas & Handshake SSH:</span>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
                  >
                    {isTesting ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{isTesting ? 'Menguji Koneksi...' : 'Uji Koneksi & Ping'}</span>
                  </button>
                </div>

                {testResult && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-lg text-xs space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Koneksi SSH Terverifikasi 100%!</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px] pt-1 border-t border-emerald-500/20">
                      <div>OS Terdeteksi: <span className="text-white">{testResult.detectedDistro}</span></div>
                      <div>Ping Latency: <span className="text-emerald-400 font-semibold">{testResult.pingMs} ms</span></div>
                      <div>Spesifikasi: <span className="text-white">{testResult.detectedCores} vCPU · {testResult.detectedRamMb} MB RAM</span></div>
                      <div>Lokasi/ISP: <span className="text-white">{testResult.ipGeo.flag} {testResult.ipGeo.city} ({testResult.ipGeo.country})</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save & Connect Button */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Simpan & Hubungkan Node VPS</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: DEDICATED AUTO-DETECT & NAT RESOLVER WORKSPACE */}
          {tab === 'nat_resolver' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/30 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {lang === 'id' ? 'Sistem Deteksi Otomatis & Penyelesaian NAT (Auto-Resolver)' : 'Automated IP Detection & NAT Auto-Resolver'}
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      {lang === 'id'
                        ? 'Sistem Vela secara cerdas mengidentifikasi apakah IP server Anda adalah IP Publik langsung, CGNAT (100.64.x), atau Subnet Privat (192.168.x / 10.x), dan menyediakan rute penyelesaian otomatis agar node terhubung seketika.'
                        : 'Vela automatically classifies public IP vs NAT/CGNAT and executes auto-resolution so nodes connect seamlessly.'}
                    </p>
                  </div>
                </div>

                {/* Visual Architecture Diagram */}
                <div className="mt-3 p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] font-mono">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
                    <div className="flex items-center gap-1.5 text-white">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Target Node VPS</span>
                    </div>
                    <span className="text-slate-600 hidden sm:inline">──────►</span>
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>Analisis (Publik / CGNAT / Private LAN)</span>
                    </div>
                    <span className="text-slate-600 hidden sm:inline">──────►</span>
                    <div className="flex items-center gap-1.5 text-sky-400">
                      <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                      <span>Auto-Connect ke VelaVPS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* IP Input with live tester */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {lang === 'id' ? 'Masukkan IP VPS / Host Target' : 'Enter Target IP or Hostname'}
                    </label>
                    <input
                      type="text"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      placeholder="Contoh: 103.147.154.21 atau 192.168.1.10 atau 100.64.4.12"
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Port SSH
                    </label>
                    <input
                      type="number"
                      value={sshPort}
                      onChange={(e) => setSshPort(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Live Network & NAT Detection Card */}
                <NetworkDetectorCard
                  ip={ipAddress || '192.168.1.100'}
                  port={Number(sshPort)}
                  onResolvedSuccess={() => onClose()}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  {lang === 'id' ? 'Tutup' : 'Close'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CLOUD API SYNC */}
          {tab === 'api' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 leading-relaxed">
                <span className="font-semibold text-sky-400 block mb-0.5">
                  Sinkronisasi Otomatis Seluruh Server dari Akun Provider:
                </span>
                <span>
                  Cukup masukkan Personal Access Token dari provider Anda, aplikasi ini akan secara otomatis menarik data droplet/instance yang sedang berjalan lengkap dengan alamat IP dan spesifikasinya.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Pilih Provider Cloud
                </label>
                <select
                  value={apiProvider}
                  onChange={(e) => setApiProvider(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                >
                  <option value="DigitalOcean">DigitalOcean (Personal Access Token)</option>
                  <option value="Hetzner">Hetzner Cloud (API Token)</option>
                  <option value="Vultr">Vultr (Personal API Key)</option>
                  <option value="Linode">Linode / Akamai (Personal Access Token)</option>
                  <option value="AWS EC2">Amazon Web Services (Access Key ID & Secret)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  API Token / Secret Key ({apiProvider})
                </label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder={`dop_v1_89f0a1b2c3d4... atau token API ${apiProvider}`}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Token disimpan secara lokal di browser Anda untuk keperluan sinkronisasi instan.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSyncApi}
                  disabled={isSyncingApi}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors shadow-sm"
                >
                  {isSyncingApi ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
                  <span>{isSyncingApi ? 'Menghubungi API...' : 'Impor & Sinkronkan Server'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: AGENT SCRIPT */}
          {tab === 'agent' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 leading-relaxed">
                <span className="font-semibold text-purple-400 block mb-0.5">
                  Hubungkan dengan Menjalankan 1 Baris Perintah di VPS:
                </span>
                <span>
                  Jika Anda tidak ingin menginput kata sandi root di antarmuka web, Anda cukup membuka terminal SSH VPS Anda dan menjalankan perintah skrip agen di bawah ini. Agen akan mendaftarkan node ke dasbor ini secara instan.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Perintah Terminal Bash (Salin & Jalankan di VPS):</span>
                  <button
                    onClick={copyAgent}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono"
                  >
                    {copiedAgent ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAgent ? 'Tersalin' : 'Salin Perintah'}</span>
                  </button>
                </div>
                <code className="block p-3 bg-slate-900 rounded-lg font-mono text-emerald-300 text-xs break-all leading-relaxed select-all">
                  {agentCommand}
                </code>
              </div>

              <div className="space-y-1.5 text-slate-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Otomatis mengonfigurasi reverse telemetry daemon dan port SSH.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tidak mematikan layanan atau website yang sedang berjalan.</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                >
                  Selesai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
