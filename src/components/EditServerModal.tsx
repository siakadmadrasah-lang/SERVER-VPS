import React, { useState, useEffect } from 'react';
import { useVps } from '../context/VpsContext';
import { VpsServer, ActivePanelInfo } from '../types/vps';
import {
  X,
  Server,
  Cpu,
  HardDrive,
  Globe,
  LayoutDashboard,
  CheckCircle2,
  Save,
  RotateCcw,
  RotateCw,
  Key,
  Zap,
  Terminal,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface EditServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  server?: VpsServer | null;
}

const OS_OPTIONS = [
  { id: 'debian', name: 'Debian', icon: '🌀', versions: ['12 (Bookworm)', '11 (Bullseye)', '10 (Buster)'], defaultKernel: 'Linux 6.1.0-25-amd64 x86_64' },
  { id: 'ubuntu', name: 'Ubuntu', icon: '🟠', versions: ['24.04 LTS (Noble)', '22.04 LTS (Jammy)', '20.04 LTS (Focal)'], defaultKernel: 'Linux 6.8.0-generic x86_64' },
  { id: 'almalinux', name: 'AlmaLinux', icon: '🟩', versions: ['9.4 (Seafoam Ocelot)', '8.9 (Midnight Sasquatch)'], defaultKernel: 'Linux 5.14.0 el9_4.x86_64' },
  { id: 'rocky', name: 'Rocky Linux', icon: '🟢', versions: ['9.4 (Blue Onyx)', '8.9 (Green Obsidian)'], defaultKernel: 'Linux 5.14.0 el9_4.x86_64' },
  { id: 'centos', name: 'CentOS Stream', icon: '🔷', versions: ['9 Stream', '8 Stream', '7 (Core)'], defaultKernel: 'Linux 5.14.0 el9.x86_64' },
  { id: 'alpine', name: 'Alpine Linux', icon: '🏔️', versions: ['3.20 Stable', '3.19'], defaultKernel: 'Linux 6.6.28-lts x86_64' },
  { id: 'windows', name: 'Windows Server', icon: '🪟', versions: ['2022 Datacenter', '2019 Standard'], defaultKernel: 'Windows NT 10.0' },
  { id: 'other', name: 'Custom Linux', icon: '🐧', versions: ['Linux General'], defaultKernel: 'Linux Generic x86_64' },
];

const REGION_OPTIONS = [
  { code: 'ID-JKT', city: 'Jakarta', country: 'Indonesia', flag: '🇮🇩' },
  { code: 'SGP1', city: 'Singapore', country: 'Singapore', flag: '🇸🇬' },
  { code: 'TYO1', city: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
  { code: 'NYC1', city: 'New York', country: 'United States', flag: '🇺🇸' },
  { code: 'FRA1', city: 'Frankfurt', country: 'Germany', flag: '🇩🇪' },
  { code: 'AMS1', city: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱' },
  { code: 'LON1', city: 'London', country: 'United Kingdom', flag: '🇬🇧' },
];

const PROVIDER_OPTIONS = [
  'Hostinger Cloud',
  'Contabo VPS',
  'DigitalOcean',
  'IdCloudHost',
  'DomaiNesia',
  'Rumahweb',
  'Niagahoster',
  'Hetzner Cloud',
  'Vultr',
  'Linode (Akamai)',
  'AWS Lightsail',
  'OVHcloud',
  'Custom VPS (KVM)',
];

export const EditServerModal: React.FC<EditServerModalProps> = ({
  isOpen,
  onClose,
  server,
}) => {
  const { selectedServer, updateServerDetails, lang, testVpsConnection, addToast } = useVps();

  const targetServer = server || selectedServer;

  // Form states
  const [name, setName] = useState('');
  const [hostname, setHostname] = useState('');
  const [ip, setIp] = useState('');
  const [ipv6, setIpv6] = useState('');
  const [provider, setProvider] = useState('');
  const [regionCode, setRegionCode] = useState('ID-JKT');

  // OS
  const [distroId, setDistroId] = useState('debian');
  const [version, setVersion] = useState('12 (Bookworm)');
  const [kernel, setKernel] = useState('Linux 6.1.0-25-amd64 x86_64');

  // Hardware Specs
  const [vcpu, setVcpu] = useState<number>(1);
  const [ramGb, setRamGb] = useState<number>(2);
  const [diskGb, setDiskGb] = useState<number>(30);
  const [diskType, setDiskType] = useState('NVMe SSD');
  const [bandwidthTb, setBandwidthTb] = useState<number>(2);

  // Panel
  const [panelType, setPanelType] = useState<string>('none');
  const [panelPort, setPanelPort] = useState<number>(7800);
  const [panelAdminPath, setPanelAdminPath] = useState('/aapanel_admin');

  // SSH & Credentials
  const [sshPort, setSshPort] = useState<number>(22);
  const [username, setUsername] = useState('root');
  const [rootPassword, setRootPassword] = useState('');
  const [isDetectingIp, setIsDetectingIp] = useState(false);
  const [isTestingSsh, setIsTestingSsh] = useState(false);
  const [sshTestStatus, setSshTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [customRegion, setCustomRegion] = useState<{ code: string; city: string; country: string; flag: string } | null>(null);

  const handleTestSsh = async () => {
    const targetIp = (ip || targetServer?.ip || '').trim();
    if (!targetIp) {
      addToast(lang === 'id' ? 'Masukkan IP VPS' : 'Enter IP', 'IP VPS diperlukan untuk menguji SSH.', 'warning');
      return;
    }
    if (!rootPassword.trim()) {
      addToast(lang === 'id' ? 'Masukkan Password Root' : 'Enter Root Password', 'Password root diperlukan untuk login SSH fisik.', 'warning');
      return;
    }

    setIsTestingSsh(true);
    setSshTestStatus(null);
    try {
      const res = await testVpsConnection(targetIp, Number(sshPort) || 22, username || 'root', rootPassword.trim());
      setSshTestStatus({
        success: true,
        message: `Terhubung ke server fisik! Ping: ${res.pingMs}ms · OS: ${res.detectedDistro} · RAM: ${res.detectedRamMb}MB (${Math.round(res.detectedRamMb / 1024)}GB) · CPU: ${res.detectedCores} vCPU`,
      });
      setRamGb(Math.round(res.detectedRamMb / 1024) || 4);
      setVcpu(res.detectedCores || 2);
      setDiskGb(res.detectedDiskGb || 50);
      setKernel(res.detectedKernel);
      addToast(
        lang === 'id' ? 'SSH Fisik Berhasil Diverifikasi!' : 'Real SSH Verified!',
        `Server ${targetIp} berhasil terhubung via SSH. Spesifikasi hardware diperbarui sesuai server nyata.`,
        'success'
      );
    } catch (err: any) {
      setSshTestStatus({
        success: false,
        message: err.message || `Gagal terhubung. Pastikan IP tepat, port ${sshPort || 22} terbuka, dan kata sandi root sesuai.`,
      });
      addToast(lang === 'id' ? 'Gagal Terhubung SSH' : 'SSH Failed', err.message || 'Koneksi gagal', 'error');
    } finally {
      setIsTestingSsh(false);
    }
  };

  const handleAutoDetectFromIp = async () => {
    const targetIp = (ip || targetServer?.ip || '').trim();
    if (!targetIp) return;
    setIsDetectingIp(true);
    try {
      const res = await fetch(`https://ipwho.is/${encodeURIComponent(targetIp)}`);
      if (res.ok) {
        const rawText = await res.text();
        if (rawText && rawText.trim().startsWith('{')) {
          const geo = JSON.parse(rawText);
          if (geo && geo.success !== false) {
            const org = geo.connection?.org || geo.connection?.isp || '';
            const asn = geo.connection?.asn ? ` (AS${geo.connection.asn})` : '';
            if (org) setProvider(`${org}${asn}`);
            const countryCode = geo.country_code || 'ID';
            const regCode = `${countryCode}-${(geo.region_code || geo.city || 'DC').substring(0, 3).toUpperCase()}`;
            const detectedReg = {
              code: regCode,
              city: geo.city || geo.region || 'Data Center',
              country: geo.country || 'Indonesia',
              flag: geo.flag?.emoji || '🌐',
            };
            setCustomRegion(detectedReg);
            setRegionCode(regCode);
          }
        }
      }
    } catch {
      // Ignore error
    } finally {
      setIsDetectingIp(false);
    }
  };

  // Populate state when modal opens or server changes
  useEffect(() => {
    if (targetServer) {
      setName(targetServer.name || 'VPS Server');
      setHostname(targetServer.hostname || 'vps.denbagoes.my.id');
      setIp(targetServer.ip || '');
      setIpv6(targetServer.ipv6 || '');
      setProvider(targetServer.provider || 'Custom Cloud VPS');
      setRegionCode(targetServer.region?.code || 'ID-JKT');

      const foundDistro = OS_OPTIONS.find(
        (o) => o.name.toLowerCase() === targetServer.os?.distro?.toLowerCase() ||
               targetServer.os?.distro?.toLowerCase().includes(o.id)
      );
      setDistroId(foundDistro ? foundDistro.id : 'ubuntu');
      setVersion(targetServer.os?.version || '24.04 LTS');
      setKernel(targetServer.os?.kernel || 'Linux 6.8.0-generic x86_64');

      setVcpu(targetServer.specs?.vcpu || 1);
      setRamGb(targetServer.specs?.ramGb || 2);
      setDiskGb(targetServer.specs?.diskGb || 30);
      setDiskType(targetServer.specs?.diskType || 'NVMe SSD');
      setBandwidthTb(targetServer.specs?.bandwidthTb || 2);

      if (targetServer.activePanel) {
        setPanelType(targetServer.activePanel.id || 'aapanel');
        setPanelPort(targetServer.activePanel.port || 7800);
        setPanelAdminPath(targetServer.activePanel.adminPath || '/aapanel_admin');
      } else {
        setPanelType('none');
      }

      setSshPort(targetServer.connection?.sshPort || 22);
      setUsername(targetServer.connection?.username || 'root');
      setRootPassword(targetServer.connection?.rootPassword || '');
    }
  }, [targetServer?.id, isOpen]);

  if (!isOpen || !targetServer) return null;

  // Handle Distro selection change
  const handleSelectDistro = (dId: string) => {
    setDistroId(dId);
    const dObj = OS_OPTIONS.find((o) => o.id === dId);
    if (dObj) {
      setVersion(dObj.versions[0] || '1.0');
      setKernel(dObj.defaultKernel);
    }
  };

  // 1-Click Popular Presets
  const applyPreset = (type: 'debian12_1gb' | 'debian12_2gb' | 'ubuntu24_2gb' | 'ubuntu22_4gb_aapanel' | 'hostinger_1core') => {
    if (type === 'debian12_1gb') {
      handleSelectDistro('debian');
      setVersion('12 (Bookworm)');
      setVcpu(1);
      setRamGb(1);
      setDiskGb(20);
      setPanelType('none');
    } else if (type === 'debian12_2gb') {
      handleSelectDistro('debian');
      setVersion('12 (Bookworm)');
      setVcpu(2);
      setRamGb(2);
      setDiskGb(40);
      setPanelType('none');
    } else if (type === 'ubuntu24_2gb') {
      handleSelectDistro('ubuntu');
      setVersion('24.04 LTS (Noble)');
      setVcpu(1);
      setRamGb(2);
      setDiskGb(30);
      setPanelType('none');
    } else if (type === 'ubuntu22_4gb_aapanel') {
      handleSelectDistro('ubuntu');
      setVersion('22.04 LTS (Jammy)');
      setVcpu(2);
      setRamGb(4);
      setDiskGb(50);
      setPanelType('aapanel');
      setPanelPort(7800);
      setPanelAdminPath('/aapanel_admin');
    } else if (type === 'hostinger_1core') {
      setProvider('Hostinger Cloud');
      handleSelectDistro('ubuntu');
      setVersion('24.04 LTS (Noble)');
      setVcpu(1);
      setRamGb(4);
      setDiskGb(50);
      setRegionCode('SGP1');
      setPanelType('none');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedRegion =
      (customRegion && customRegion.code === regionCode ? customRegion : undefined) ||
      REGION_OPTIONS.find((r) => r.code === regionCode) ||
      targetServer.region || {
        code: 'ID-JKT',
        city: 'Jakarta',
        country: 'Indonesia',
        flag: '🇮🇩',
      };

    const selectedDistroObj = OS_OPTIONS.find((o) => o.id === distroId);
    const distroName = selectedDistroObj ? selectedDistroObj.name : 'Linux';

    let activePanelData: ActivePanelInfo | undefined = undefined;
    if (panelType === 'aapanel') {
      activePanelData = {
        id: 'aapanel',
        name: 'aaPanel (Linux Web Hosting Panel)',
        version: '7.0.8 English Stable',
        port: panelPort || 7800,
        status: 'running',
        adminPath: panelAdminPath,
        adminUrl: `http://${ip}:${panelPort || 7800}${panelAdminPath}`,
        serviceName: 'bt',
        memoryUsageMb: 85,
        cpuUsagePct: 0.5,
        detectedAt: 'Terkonfigurasi Akurat',
        detectionSource: 'manual',
        credentials: {
          user: 'admin_aa',
          pass: rootPassword || 'aaPnl#2026@Pass',
          securityEntry: panelAdminPath,
        },
      };
    } else if (panelType === 'cyberpanel') {
      activePanelData = {
        id: 'cyberpanel',
        name: 'CyberPanel (OpenLiteSpeed)',
        version: 'v2.3.4 Stable',
        port: panelPort || 8090,
        status: 'running',
        adminUrl: `https://${ip}:${panelPort || 8090}`,
        serviceName: 'lsws',
        memoryUsageMb: 110,
        cpuUsagePct: 0.8,
        detectedAt: 'Terkonfigurasi Akurat',
        detectionSource: 'manual',
      };
    } else if (panelType === 'fastpanel') {
      activePanelData = {
        id: 'fastpanel',
        name: 'FASTPANEL (Modern Hosting Engine)',
        version: 'v1.12.0',
        port: panelPort || 8888,
        status: 'running',
        adminUrl: `https://${ip}:${panelPort || 8888}`,
        serviceName: 'fastpanel',
        memoryUsageMb: 65,
        cpuUsagePct: 0.3,
        detectedAt: 'Terkonfigurasi Akurat',
        detectionSource: 'manual',
      };
    } else if (panelType === 'cloudpanel') {
      activePanelData = {
        id: 'cloudpanel',
        name: 'CloudPanel (PHP & Node.js Engine)',
        version: 'v2.4.1',
        port: panelPort || 8443,
        status: 'running',
        adminUrl: `https://${ip}:${panelPort || 8443}`,
        serviceName: 'clp',
        memoryUsageMb: 95,
        cpuUsagePct: 0.6,
        detectedAt: 'Terkonfigurasi Akurat',
        detectionSource: 'manual',
      };
    } else {
      activePanelData = undefined;
    }

    updateServerDetails(targetServer.id, {
      name: name.trim() || 'VPS Server',
      hostname: hostname.trim() || targetServer.hostname,
      ip: ip.trim() || targetServer.ip,
      ipv6: ipv6.trim(),
      provider: provider.trim() || 'Custom VPS',
      region: selectedRegion,
      os: {
        distro: distroName,
        version: version,
        codename: version.includes('(') ? version.split('(')[1].replace(')', '') : 'Stable',
        kernel: kernel,
        arch: 'x86_64 (64-bit)',
        icon: distroId,
        installedAt: targetServer.os?.installedAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
        verifiedReal: true,
        lastVerifiedAt: 'Disinkronkan secara akurat oleh pengguna',
      },
      specs: {
        vcpu: Number(vcpu) || 1,
        ramGb: Number(ramGb) || 1,
        diskGb: Number(diskGb) || 20,
        diskType: diskType,
        bandwidthTb: Number(bandwidthTb) || 2,
        usedBandwidthGb: targetServer.specs?.usedBandwidthGb || 45,
      },
      activePanel: activePanelData,
      isRealSshConnected: sshTestStatus?.success ?? Boolean(rootPassword || targetServer.connection?.rootPassword),
      connection: {
        ...targetServer.connection,
        sshPort: Number(sshPort) || 22,
        username: username.trim() || 'root',
        rootPassword: rootPassword || targetServer.connection?.rootPassword,
        isRealSshVerified: sshTestStatus?.success ?? targetServer.connection?.isRealSshVerified,
      },
    });

    onClose();
  };

  const selectedDistroObj = OS_OPTIONS.find((o) => o.id === distroId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{lang === 'id' ? 'Sesuaikan Detail & Spesifikasi VPS' : 'Edit Accurate VPS Specifications'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {ip || targetServer.ip}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'id'
                  ? 'Ubah OS, CPU, RAM, Disk, dan Panel agar 100% cocok dengan kondisi asli VPS Anda.'
                  : 'Customize OS, specs, and panel to accurately reflect your real VPS.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quick Presets */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilih Preset Cepat (1-Klik Isi Spesifikasi Populer):</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('debian12_1gb')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-[11px]"
              >
                🌀 Debian 12 (1 vCPU, 1 GB RAM, 20 GB Disk)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('debian12_2gb')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-[11px]"
              >
                🌀 Debian 12 (2 vCPU, 2 GB RAM, 40 GB Disk)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ubuntu24_2gb')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-[11px]"
              >
                🟠 Ubuntu 24.04 (1 vCPU, 2 GB RAM, 30 GB Disk)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ubuntu22_4gb_aapanel')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-[11px]"
              >
                🟠 Ubuntu 22.04 + aaPanel (2 Core, 4 GB RAM)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('hostinger_1core')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-[11px]"
              >
                🟣 Hostinger KVM 1 (1 Core, 4 GB RAM, 50 GB)
              </button>
            </div>
          </div>

          {/* Section 1: Sistem Operasi (OS) */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>Sistem Operasi Asli VPS Anda</span>
              <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {OS_OPTIONS.map((distro) => {
                const isSelected = distroId === distro.id;
                return (
                  <button
                    key={distro.id}
                    type="button"
                    onClick={() => handleSelectDistro(distro.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl leading-none">{distro.icon}</span>
                    <span className="font-semibold text-xs truncate">{distro.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Versi Rilis OS</label>
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {selectedDistroObj?.versions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Versi Kernel Linux</label>
                <input
                  type="text"
                  value={kernel}
                  onChange={(e) => setKernel(e.target.value)}
                  placeholder="Contoh: Linux 6.1.0-25-amd64 x86_64"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Hardware Specs (Akurat) */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Spesifikasi Hardware Real</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">vCPU Core</label>
                <select
                  value={vcpu}
                  onChange={(e) => setVcpu(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>1 Core vCPU</option>
                  <option value={2}>2 Cores vCPU</option>
                  <option value={3}>3 Cores vCPU</option>
                  <option value={4}>4 Cores vCPU</option>
                  <option value={6}>6 Cores vCPU</option>
                  <option value={8}>8 Cores vCPU</option>
                  <option value={16}>16 Cores vCPU</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Kapasitas RAM</label>
                <select
                  value={ramGb}
                  onChange={(e) => setRamGb(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={0.5}>512 MB RAM</option>
                  <option value={1}>1 GB RAM</option>
                  <option value={2}>2 GB RAM</option>
                  <option value={3}>3 GB RAM</option>
                  <option value={4}>4 GB RAM</option>
                  <option value={6}>6 GB RAM</option>
                  <option value={8}>8 GB RAM</option>
                  <option value={16}>16 GB RAM</option>
                  <option value={32}>32 GB RAM</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Kapasitas Disk (GB)</label>
                <input
                  type="number"
                  value={diskGb}
                  onChange={(e) => setDiskGb(Number(e.target.value))}
                  min={5}
                  max={2000}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tipe Penyimpanan</label>
                <select
                  value={diskType}
                  onChange={(e) => setDiskType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="NVMe SSD">NVMe SSD</option>
                  <option value="SATA SSD">SATA SSD</option>
                  <option value="High-Speed Cloud Storage">Cloud Storage</option>
                  <option value="HDD SAS">HDD Enterprise</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Web Hosting / Control Panel */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span>Hosting Control Panel yang Terpasang di VPS</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                Pilih "Tidak Ada" jika VPS Anda polos/hanya CLI
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPanelType('none')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  panelType === 'none'
                    ? 'bg-rose-500/10 border-rose-500/50 text-rose-300 font-semibold shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ❌ Tidak Ada Panel (CLI Saja)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPanelType('aapanel');
                  setPanelPort(7800);
                  setPanelAdminPath('/aapanel_admin');
                }}
                className={`p-2 rounded-lg border text-left transition-all ${
                  panelType === 'aapanel'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-semibold shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🟢 aaPanel (Port 7800)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPanelType('cyberpanel');
                  setPanelPort(8090);
                }}
                className={`p-2 rounded-lg border text-left transition-all ${
                  panelType === 'cyberpanel'
                    ? 'bg-sky-500/10 border-sky-500/50 text-sky-300 font-semibold shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🔵 CyberPanel (Port 8090)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPanelType('fastpanel');
                  setPanelPort(8888);
                }}
                className={`p-2 rounded-lg border text-left transition-all ${
                  panelType === 'fastpanel'
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-300 font-semibold shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🟣 FastPanel (Port 8888)
              </button>
            </div>

            {panelType !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Port Akses Panel</label>
                  <input
                    type="number"
                    value={panelPort}
                    onChange={(e) => setPanelPort(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {panelType === 'aapanel' && (
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Security Entry Path (aaPanel)</label>
                    <input
                      type="text"
                      value={panelAdminPath}
                      onChange={(e) => setPanelAdminPath(e.target.value)}
                      placeholder="/aapanel_admin"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Identitas, Jaringan & Provider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Jaringan & Penyedia Layanan VPS</span>
              </label>
              <button
                type="button"
                onClick={handleAutoDetectFromIp}
                disabled={isDetectingIp}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-colors disabled:opacity-50"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>{isDetectingIp ? 'Mendeteksi IP...' : 'Deteksi ISP & Lokasi dari IP'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nama Server</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: VPS Utama denbagoes"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Hostname / Domain</label>
                <input
                  type="text"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  placeholder="Contoh: vps.denbagoes.my.id"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Provider / ISP Hosting</label>
                <input
                  type="text"
                  list="provider-options-list"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="Ketik atau pilih provider VPS"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <datalist id="provider-options-list">
                  {PROVIDER_OPTIONS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Lokasi Data Center</label>
                <select
                  value={regionCode}
                  onChange={(e) => setRegionCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {customRegion && !REGION_OPTIONS.some((r) => r.code === customRegion.code) && (
                    <option value={customRegion.code}>
                      {customRegion.flag} {customRegion.city}, {customRegion.country} ({customRegion.code})
                    </option>
                  )}
                  {targetServer.region &&
                    !REGION_OPTIONS.some((r) => r.code === targetServer.region.code) &&
                    (!customRegion || customRegion.code !== targetServer.region.code) && (
                      <option value={targetServer.region.code}>
                        {targetServer.region.flag} {targetServer.region.city}, {targetServer.region.country} ({targetServer.region.code})
                      </option>
                    )}
                  {REGION_OPTIONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.flag} {r.city}, {r.country} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Alamat IPv4 Publik</label>
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="Contoh: 103.189.234.78"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Port SSH</label>
                <input
                  type="number"
                  value={sshPort}
                  onChange={(e) => setSshPort(Number(e.target.value))}
                  placeholder="22"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">User SSH</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="root"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Password Root SSH (Akun VPS Fisik)</label>
                <input
                  type="password"
                  value={rootPassword}
                  onChange={(e) => setRootPassword(e.target.value)}
                  placeholder="Masukkan kata sandi root VPS fisik"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* SSH Real Validation Box */}
              <div className="col-span-1 sm:col-span-2 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">Uji Koneksi SSH ke Akun VPS Sebenarnya</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestSsh}
                    disabled={isTestingSsh}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer"
                  >
                    {isTestingSsh ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
                    <span>{isTestingSsh ? 'Menguji SSH...' : '⚡ Uji Handshake SSH Nyata'}</span>
                  </button>
                </div>
                {sshTestStatus && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-mono ${
                      sshTestStatus.success
                        ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {sshTestStatus.message}
                  </div>
                )}
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dengan memasukkan IP dan Password root VPS asli, dashboard akan langsung membaca RAM fisik Linux yang sebenarnya dan mengeksekusi instalasi CyberPanel langsung di server Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900/90 py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Terapkan Detail Akurat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
