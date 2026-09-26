import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import { OS_DISTRIBUTIONS } from '../data/mockData';
import { NetworkDetectorCard } from './NetworkDetectorCard';
import {
  Server,
  X,
  Plus,
  Key,
  Globe,
  HardDrive,
  Cpu,
} from 'lucide-react';

export const AddServerModal: React.FC = () => {
  const {
    isAddServerModalOpen,
    setIsAddServerModalOpen,
    addServer,
    lang,
  } = useVps();

  const [name, setName] = useState('');
  const [hostname, setHostname] = useState('');
  const [ip, setIp] = useState('');
  const [provider, setProvider] = useState('DigitalOcean Droplet');
  const [regionCode, setRegionCode] = useState('SGP1');
  const [vcpu, setVcpu] = useState(2);
  const [ramGb, setRamGb] = useState(4);
  const [diskGb, setDiskGb] = useState(80);
  const [sshPort, setSshPort] = useState(22);
  const [rootPassword, setRootPassword] = useState('');
  const [selectedDistro, setSelectedDistro] = useState('Ubuntu');
  const [selectedVer, setSelectedVer] = useState('24.04 LTS');

  if (!isAddServerModalOpen) return null;

  const regions: Record<string, { city: string; country: string; flag: string }> = {
    SGP1: { city: 'Singapore', country: 'Singapore', flag: '🇸🇬' },
    JKT: { city: 'Jakarta', country: 'Indonesia', flag: '🇮🇩' },
    FSN1: { city: 'Frankfurt', country: 'Germany', flag: '🇩🇪' },
    TYO: { city: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
    NYC1: { city: 'New York', country: 'United States', flag: '🇺🇸' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ip.trim()) return;

    const reg = regions[regionCode] || regions['SGP1'];

    addServer({
      name: name.trim(),
      hostname: hostname.trim() || `${name.toLowerCase().replace(/\s+/g, '-')}.local`,
      ip: ip.trim(),
      provider,
      region: {
        code: regionCode,
        city: reg.city,
        country: reg.country,
        flag: reg.flag,
      },
      specs: {
        vcpu: Number(vcpu),
        ramGb: Number(ramGb),
        diskGb: Number(diskGb),
        diskType: 'NVMe SSD',
        bandwidthTb: 4,
        usedBandwidthGb: 10,
      },
      os: {
        distro: selectedDistro,
        version: selectedVer,
        kernel: 'Linux 6.8.0-generic x86_64',
        arch: 'x86_64 (64-bit)',
        icon: selectedDistro.toLowerCase(),
        installedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      },
      connection: {
        sshPort: Number(sshPort),
        username: 'root',
        rootPassword: rootPassword.trim() || 'vpsPass#' + Math.floor(Math.random() * 9000 + 1000),
        lastLoginIp: ip.trim(),
        lastLoginTime: 'Baru saja',
      },
    });

    setIsAddServerModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                {lang === 'id' ? 'Tambah Node VPS Baru' : 'Add New VPS Node'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'id' ? 'Hubungkan server yang sudah ada atau daftarkan node baru' : 'Connect existing VPS or register cloud instance'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddServerModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Server Name & Hostname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'id' ? 'Nama Server' : 'Server Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Production API 02"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Hostname (FQDN)
              </label>
              <input
                type="text"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="api-prod.domain.com"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* IP & SSH Port */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'id' ? 'Alamat IP VPS (IPv4 / Hostname)' : 'VPS IPv4 / Hostname'}
              </label>
              <input
                type="text"
                required
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="198.51.100.42 atau 192.168.1.10"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
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
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Automatic Network & NAT Detector Live Card */}
          <NetworkDetectorCard
            ip={ip}
            port={Number(sshPort)}
            onResolvedSuccess={() => setIsAddServerModalOpen(false)}
          />

          {/* Provider & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Provider Cloud / Host
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value="DigitalOcean Droplet">DigitalOcean Droplet</option>
                <option value="Hetzner Cloud">Hetzner Cloud</option>
                <option value="Biznet GIO Cloud IDC">Biznet GIO Cloud (Indonesia)</option>
                <option value="AWS EC2">Amazon Web Services (EC2)</option>
                <option value="Vultr Cloud Compute">Vultr Cloud Compute</option>
                <option value="Linode Akamai">Linode Akamai</option>
                <option value="Custom KVM VPS">Custom KVM / Proxmox</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Lokasi Data Center
              </label>
              <select
                value={regionCode}
                onChange={(e) => setRegionCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value="SGP1">🇸🇬 Singapore (SGP1)</option>
                <option value="JKT">🇮🇩 Jakarta IDC (JKT)</option>
                <option value="FSN1">🇩🇪 Frankfurt (FSN1)</option>
                <option value="TYO">🇯🇵 Tokyo (TYO)</option>
                <option value="NYC1">🇺🇸 New York (NYC1)</option>
              </select>
            </div>
          </div>

          {/* Hardware Specs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">vCPU Core</label>
              <select
                value={vcpu}
                onChange={(e) => setVcpu(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value={1}>1 vCPU</option>
                <option value={2}>2 vCPU</option>
                <option value={4}>4 vCPU</option>
                <option value={8}>8 vCPU</option>
                <option value={16}>16 vCPU</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">RAM (GB)</label>
              <select
                value={ramGb}
                onChange={(e) => setRamGb(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value={1}>1 GB</option>
                <option value={2}>2 GB</option>
                <option value={4}>4 GB</option>
                <option value={8}>8 GB</option>
                <option value={16}>16 GB</option>
                <option value={32}>32 GB</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">NVMe Disk</label>
              <select
                value={diskGb}
                onChange={(e) => setDiskGb(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value={25}>25 GB</option>
                <option value={50}>50 GB</option>
                <option value={80}>80 GB</option>
                <option value={160}>160 GB</option>
                <option value={320}>320 GB</option>
              </select>
            </div>
          </div>

          {/* Root Password & Initial OS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'id' ? 'Kata Sandi Root' : 'Root Password'}
              </label>
              <input
                type="password"
                value={rootPassword}
                onChange={(e) => setRootPassword(e.target.value)}
                placeholder="Biarkan kosong untuk auto-generate"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'id' ? 'Sistem Operasi Terpasang' : 'Installed OS'}
              </label>
              <select
                value={selectedDistro}
                onChange={(e) => setSelectedDistro(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value="Ubuntu">Ubuntu 24.04 LTS</option>
                <option value="Debian">Debian 12 Bookworm</option>
                <option value="AlmaLinux">AlmaLinux 9.4</option>
                <option value="Rocky">Rocky Linux 9.4</option>
                <option value="Alpine">Alpine Linux 3.20</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsAddServerModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            {lang === 'id' ? 'Batal' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{lang === 'id' ? 'Daftarkan Node' : 'Register Node'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
