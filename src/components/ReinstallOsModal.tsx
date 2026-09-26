import React, { useState, useEffect } from 'react';
import { useVps } from '../context/VpsContext';
import { OS_DISTRIBUTIONS } from '../data/mockData';
import {
  RefreshCcw,
  X,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Key,
  Shield,
  HardDrive,
  Copy,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Server,
  Zap,
} from 'lucide-react';

export const ReinstallOsModal: React.FC = () => {
  const {
    isReinstallModalOpen,
    setIsReinstallModalOpen,
    selectedServer,
    reinstallOs,
    setActiveTab,
    lang,
    addToast,
  } = useVps();

  // Wizard Step: 1 = Distro, 2 = Config, 3 = Confirm, 4 = Executing
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedDistroId, setSelectedDistroId] = useState<string>('ubuntu');
  const [selectedVersion, setSelectedVersion] = useState<string>('24.04 LTS');
  const [filesystem, setFilesystem] = useState<string>('ext4');
  const [swapGb, setSwapGb] = useState<number>(4);
  const [rootPassword, setRootPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [sshKey, setSshKey] = useState<string>('');
  const [preinstallPackages, setPreinstallPackages] = useState<string[]>([
    'docker',
    'ufw',
    'fail2ban',
  ]);
  const [timezone, setTimezone] = useState<string>('Asia/Jakarta');
  const [confirmText, setConfirmText] = useState<string>('');
  const [copiedPass, setCopiedPass] = useState(false);

  // Execution state
  const [progressPct, setProgressPct] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Generate a random secure root password on open
  useEffect(() => {
    if (isReinstallModalOpen) {
      setStep(1);
      setIsFinished(false);
      setProgressPct(0);
      setLogs([]);
      setConfirmText('');
      generatePassword();

      // If the current server is running Debian or user requested Debian, pre-select Debian
      if (selectedServer?.os.distro.toLowerCase().includes('debian')) {
        setSelectedDistroId('debian');
        setSelectedVersion('12');
      }
    }
  }, [isReinstallModalOpen, selectedServer?.id]);

  // Copied debian script helper state
  const [copiedDebianScript, setCopiedDebianScript] = useState(false);

  // When distro changes, set default version
  useEffect(() => {
    const distro = OS_DISTRIBUTIONS.find((d) => d.id === selectedDistroId);
    if (distro && distro.versions.length > 0) {
      setSelectedVersion(distro.versions[0].version);
    }
  }, [selectedDistroId]);

  if (!isReinstallModalOpen || !selectedServer) return null;

  const generatePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRootPassword(pass);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(rootPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const togglePackage = (pkgId: string) => {
    setPreinstallPackages((prev) =>
      prev.includes(pkgId) ? prev.filter((p) => p !== pkgId) : [...prev, pkgId]
    );
  };

  const selectedDistro = OS_DISTRIBUTIONS.find((d) => d.id === selectedDistroId);

  // Start execution simulation
  const handleStartReinstall = async () => {
    setStep(4);
    setProgressPct(5);
    setLogs([
      `[INIT] Menerima sinyal permintaan instal ulang OS pada ${selectedServer.hostname}...`,
      `[TASK] Target: ${selectedDistro?.name} ${selectedVersion} (${filesystem}, ${swapGb}GB Swap)`,
    ]);

    const steps = [
      { pct: 15, msg: '[ACPI] Mengirim sinyal shutdown dan melepas mount partisi aktif (/dev/vda1, /dev/vda2)...' },
      { pct: 30, msg: `[DISK] Menghapus tabel partisi lama dan membuat skema GPT baru (EFI + Root + Swap)...` },
      { pct: 45, msg: `[FS] Memformat partisi dengan filesystem ${filesystem} dan mengalokasikan ${swapGb}GB swap partition...` },
      { pct: 60, msg: `[STREAM] Mengunduh dan mengekstrak image ${selectedDistro?.name} ${selectedVersion} dari mirror internal...` },
      { pct: 75, msg: '[AUTH] Menginjeksi authorized_keys, netplan konfigurasi IP statis, dan kata sandi root baru...' },
      { pct: 88, msg: `[CLOUD-INIT] Menerapkan paket bawaan: [${preinstallPackages.join(', ')}]...` },
      { pct: 95, msg: '[GRUB] Menginstal UEFI bootloader pada master boot record dan melakukan reboot server...' },
      { pct: 100, msg: '[READY] Server telah berhasil boot! OpenSSH daemon port 22 aktif dan merespon koneksi.' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const item = steps[currentStep];
        setProgressPct(item.pct);
        setLogs((prev) => [...prev, item.msg]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsFinished(true);
      }
    }, 750);

    // Call context reinstall
    await reinstallOs(selectedServer.id, {
      distroId: selectedDistroId,
      version: selectedVersion,
      filesystem,
      swapGb,
      rootPassword,
      sshKey,
      preinstallPackages,
      hostname: selectedServer.hostname,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <RefreshCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                {lang === 'id' ? 'Instal Ulang Sistem Operasi (OS Reinstall)' : 'Reinstall Operating System'}
              </h2>
              <p className="text-xs text-slate-400">
                {selectedServer.name} · {selectedServer.ip}
              </p>
            </div>
          </div>
          {step !== 4 && (
            <button
              onClick={() => setIsReinstallModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Step Indicator (Zero-pill text) */}
        {step !== 4 && (
          <div className="px-6 py-3 bg-slate-950/30 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${step >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>
                1. {lang === 'id' ? 'Pilih Distribusi' : 'Choose Distro'}
              </span>
              <span aria-hidden="true" className="text-slate-600">/</span>
              <span className={`font-semibold ${step >= 2 ? 'text-amber-400' : 'text-slate-500'}`}>
                2. {lang === 'id' ? 'Konfigurasi & Akses' : 'Config & Access'}
              </span>
              <span aria-hidden="true" className="text-slate-600">/</span>
              <span className={`font-semibold ${step >= 3 ? 'text-rose-400' : 'text-slate-500'}`}>
                3. {lang === 'id' ? 'Konfirmasi' : 'Confirm'}
              </span>
            </div>
            <span className="text-slate-500 font-mono">
              {lang === 'id' ? 'Langkah' : 'Step'} {step} / 3
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Select Distribution */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Legality & Safety Reassurance Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'id' ? 'Apakah Melakukan Reinstal / Bypass OS Melanggar Aturan Provider?' : 'Is Reinstalling OS Compliant with Provider ToS?'}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    100% Legal & Aman
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {lang === 'id'
                    ? 'TIDAK melanggar. Sebagai penyewa VPS berbasis KVM, Anda memiliki hak penuh (root access privilege) untuk memformat partisi disk Anda sendiri. Provider hanya melarang aktivitas berbahaya seperti spam, DDoS, atau mining. Namun, jika Anda ingin 100% tenang dan tetap menggunakan OS resmi bawaan VPS Anda, kami telah menyediakan Debian 12 (Bookworm) & Debian 11 (Bullseye) murni di bawah ini.'
                    : 'Reinstalling or custom booting does not violate VPS Terms of Service. KVM provides full virtual disk rights. For total compliance with your host template, official Debian 12 and 11 are ready below.'}
                </p>

                {/* Quick 1-Click Debian Selector */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDistroId('debian');
                      setSelectedVersion('12');
                      addToast('Debian 12 Dipilih', 'Debian 12 (Bookworm) bawaan resmi VPS dipilih', 'success');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedDistroId === 'debian' && selectedVersion === '12'
                        ? 'bg-emerald-400 text-slate-950 shadow-sm ring-1 ring-emerald-300'
                        : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50'
                    }`}
                  >
                    <span>🌀</span>
                    <span>Reinstal Debian 12 (Bookworm) - Bawaan VPS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDistroId('debian');
                      setSelectedVersion('11');
                      addToast('Debian 11 Dipilih', 'Debian 11 (Bullseye) dipilih', 'info');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedDistroId === 'debian' && selectedVersion === '11'
                        ? 'bg-emerald-400 text-slate-950 shadow-sm ring-1 ring-emerald-300'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span>🌀</span>
                    <span>Debian 11 (Bullseye)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-200">
                  {lang === 'id' ? 'Pilih Distribusi Linux / OS' : 'Select Linux / OS Distribution'}
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'id'
                    ? 'Semua image telah dioptimasi dengan driver virtio KVM untuk performa I/O maksimal.'
                    : 'All cloud images are pre-tuned with KVM virtio drivers for ultra-fast I/O.'}
                </p>
              </div>

              {/* Distro Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {OS_DISTRIBUTIONS.map((distro) => {
                  const isSelected = distro.id === selectedDistroId;
                  const isDebian = distro.id === 'debian';
                  return (
                    <div
                      key={distro.id}
                      onClick={() => setSelectedDistroId(distro.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? isDebian
                            ? 'bg-emerald-950/20 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                            : 'bg-amber-950/20 border-amber-500/50 shadow-md'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{distro.logo}</span>
                        <div className="flex items-center gap-1.5">
                          {isDebian && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                              Resmi VPS
                            </span>
                          )}
                          {isSelected && <Check className={`w-4 h-4 ${isDebian ? 'text-emerald-400' : 'text-amber-400'}`} />}
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200 mt-2">{distro.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {distro.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Version Selector for chosen distro */}
              {selectedDistro && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      {lang === 'id' ? 'Versi Rilis' : 'Release Version'} ({selectedDistro.name})
                    </label>
                    {selectedDistro.id === 'debian' && (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sesuai Template Bawaan Provider</span>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDistro.versions.map((ver) => {
                      const isVerSelected = ver.version === selectedVersion;
                      return (
                        <div
                          key={ver.version}
                          onClick={() => setSelectedVersion(ver.version)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors text-xs font-mono flex items-center justify-between ${
                            isVerSelected
                              ? selectedDistro.id === 'debian'
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                                : 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>{ver.label}</span>
                          {isVerSelected && (
                            <Check className={`w-3.5 h-3.5 shrink-0 ${selectedDistro.id === 'debian' ? 'text-emerald-400' : 'text-amber-400'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Kernel Bawaan: <span className="text-slate-400 font-mono">{selectedDistro.versions.find(v => v.version === selectedVersion)?.defaultKernel || 'Linux Generic'}</span>
                  </div>

                  {/* Direct Bash Script for Any Selected Distro */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>{lang === 'id' ? `Perintah Bash Eksekusi Langsung ke VPS Fisik (${selectedDistro.name}):` : `Direct Bash Command for Physical VPS (${selectedDistro.name}):`}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const distroSlug = selectedDistro.id === 'rocky' ? 'rocky' : selectedDistro.id === 'alma' ? 'almalinux' : selectedDistro.id;
                            const verSlug = selectedVersion.split(' ')[0];
                            const cmd = `curl -fLO https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh && bash reinstall.sh ${distroSlug} ${verSlug} --password "${rootPassword || 'PasswordBaruAnda123!'}"`;
                            navigator.clipboard.writeText(cmd);
                            setCopiedDebianScript(true);
                            addToast(lang === 'id' ? 'Perintah Disalin' : 'Command Copied', lang === 'id' ? 'Siap dijalankan langsung di terminal SSH VPS Anda' : 'Ready to run in your VPS SSH terminal', 'info');
                            setTimeout(() => setCopiedDebianScript(false), 2500);
                          }}
                          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-sans cursor-pointer"
                        >
                          {copiedDebianScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedDebianScript ? (lang === 'id' ? 'Tersalin' : 'Copied') : (lang === 'id' ? 'Salin Perintah' : 'Copy Script')}</span>
                        </button>
                      </div>
                      <code className="block text-emerald-300 text-[11px] break-all select-all">
                        {`curl -fLO https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh && bash reinstall.sh ${selectedDistro.id === 'rocky' ? 'rocky' : selectedDistro.id === 'alma' ? 'almalinux' : selectedDistro.id} ${selectedVersion.split(' ')[0]} --password "${rootPassword || 'PasswordBaruAnda123!'}"`}
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Configuration & Credentials */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Target Distro Banner */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedDistro?.logo}</span>
                  <div>
                    <span className="font-semibold text-white">{selectedDistro?.name} {selectedVersion}</span>
                    <span className="text-slate-400 block text-[11px]">Server: {selectedServer.hostname} ({selectedServer.specs.diskGb} GB NVMe)</span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  {lang === 'id' ? 'Ganti Distro' : 'Change Distro'}
                </button>
              </div>

              {/* Filesystem & Swap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    {lang === 'id' ? 'Sistem Berkas (Filesystem)' : 'Root Filesystem'}
                  </label>
                  <select
                    value={filesystem}
                    onChange={(e) => setFilesystem(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="ext4">ext4 (Standar Linux Stabil & Cepat)</option>
                    <option value="btrfs">btrfs (Dukungan Snapshot & CoW)</option>
                    <option value="xfs">xfs (Performa Tinggi Database Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    {lang === 'id' ? 'Alokasi Partisi Swap' : 'Swap Memory Allocation'}
                  </label>
                  <select
                    value={swapGb}
                    onChange={(e) => setSwapGb(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value={0}>Tidak Ada Swap (Hanya RAM Fisik)</option>
                    <option value={2}>2 GB Swap File</option>
                    <option value={4}>4 GB Swap File (Rekomendasi)</option>
                    <option value={8}>8 GB Swap File</option>
                  </select>
                </div>
              </div>

              {/* Root Password Setup */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === 'id' ? 'Kata Sandi Root Baru (Wajib Disimpan)' : 'New Root Password'}
                  </label>
                  <button
                    onClick={generatePassword}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                  >
                    <Zap className="w-3 h-3" />
                    <span>{lang === 'id' ? 'Acak Ulang' : 'Regenerate'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={isPasswordVisible ? 'text' : 'password'}
                      value={rootPassword}
                      onChange={(e) => setRootPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-white pr-10 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors font-mono"
                  >
                    {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPass ? (lang === 'id' ? 'Tersalin' : 'Copied') : (lang === 'id' ? 'Salin' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* SSH Public Key */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {lang === 'id' ? 'Injeksi Kunci Publik SSH (Opsional)' : 'SSH Public Key Injection (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={sshKey}
                  onChange={(e) => setSshKey(e.target.value)}
                  placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... admin@macbook"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Preinstall Cloud-Init Packages */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {lang === 'id' ? 'Paket Bawaan Cloud-Init (Instal Otomatis)' : 'Cloud-Init Pre-installed Packages'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'docker', label: 'Docker Engine & Compose' },
                    { id: 'ufw', label: 'UFW Firewall Aktif' },
                    { id: 'fail2ban', label: 'Fail2ban SSH Protection' },
                    { id: 'nginx', label: 'Nginx Web Server' },
                    { id: 'nodejs', label: 'Node.js LTS & PM2' },
                    { id: 'certbot', label: 'Certbot Let\'s Encrypt' },
                  ].map((pkg) => {
                    const isChecked = preinstallPackages.includes(pkg.id);
                    return (
                      <label
                        key={pkg.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePackage(pkg.id)}
                          className="rounded border-slate-700 text-amber-500 focus:ring-0"
                        />
                        <span className="truncate">{pkg.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm Danger Zone */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 text-rose-200">
                  <h4 className="font-bold text-rose-300 text-sm">
                    {lang === 'id' ? 'Peringatan: Seluruh Data Akan Diformat!' : 'Warning: Complete Data Destruction!'}
                  </h4>
                  <p className="leading-relaxed">
                    {lang === 'id'
                      ? `Instal ulang OS akan memformat total partisi disk pada node ${selectedServer.name} (${selectedServer.ip}). Semua file di direktori /, database, dan konfigurasi lama akan dihapus permanen.`
                      : `Reinstalling OS will wipe all filesystem blocks on ${selectedServer.name} (${selectedServer.ip}). All files, databases, and local configurations will be permanently erased.`}
                  </p>
                </div>
              </div>

              {/* Execution Summary Table */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">{lang === 'id' ? 'Target Node' : 'Target Node'}:</span>
                  <span className="font-mono text-slate-200">{selectedServer.hostname} ({selectedServer.ip})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">{lang === 'id' ? 'OS Baru' : 'New OS'}:</span>
                  <span className="font-mono text-amber-400 font-semibold">{selectedDistro?.name} {selectedVersion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">{lang === 'id' ? 'Format & Filesystem' : 'Filesystem'}:</span>
                  <span className="font-mono text-slate-200">{filesystem} · {swapGb} GB Swap</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">{lang === 'id' ? 'Paket Otomatis' : 'Auto Packages'}:</span>
                  <span className="font-mono text-slate-200">{preinstallPackages.join(', ') || 'Minimal Base'}</span>
                </div>
              </div>

              {/* Confirmation Input Guard */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 block">
                    {lang === 'id' ? 'Ketik "REINSTALL" untuk mengonfirmasi:' : 'Type "REINSTALL" to confirm:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setConfirmText('REINSTALL')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {lang === 'id' ? 'Klik isi otomatis "REINSTALL"' : 'Auto-fill "REINSTALL"'}
                  </button>
                </div>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="REINSTALL"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-rose-500 tracking-wider uppercase"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Execution Progress & Live Terminal */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    {!isFinished && <RefreshCcw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isFinished ? (lang === 'id' ? 'Instalasi Selesai!' : 'Provisioning Succeeded!') : (lang === 'id' ? 'Sedang Memproses Instal Ulang...' : 'Provisioning Cloud Image...')}</span>
                  </span>
                  <span className="text-slate-300 tabular-nums">{progressPct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isFinished ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Terminal Log Console */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 max-h-60 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-emerald-400 select-none mr-2">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              {/* Post-Completion Summary Card */}
              {isFinished && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{lang === 'id' ? 'OS Baru Bersih Siap Digunakan!' : 'Fresh OS is Ready!'}</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      RAM Idle Bersih
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
                    <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">MEMORI RAM:</span>
                      <span className="text-emerald-400 font-bold">{selectedServer.metrics.ramPct}%</span>
                      <span className="text-slate-400 text-[10px] block">
                        {((selectedServer.specs.ramGb * selectedServer.metrics.ramPct) / 100).toFixed(2)} GB / {selectedServer.specs.ramGb} GB
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">DISTRIBUSI OS:</span>
                      <span className="text-white font-bold">{selectedDistro?.name}</span>
                      <span className="text-slate-400 text-[10px] block">{selectedVersion}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">SSH HOST:</span>
                      <span className="text-slate-200">{selectedServer.ip}:22</span>
                      <span className="text-emerald-400 text-[10px] block">Listening</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">PASSWORD ROOT:</span>
                      <span className="text-amber-300 truncate block">{rootPassword}</span>
                      <span className="text-slate-500 text-[10px] block">Tersimpan</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
                    <span>
                      {lang === 'id'
                        ? 'Seluruh partisi dan panel lama telah diformat bersih. Penggunaan RAM turun ke status idle OS murni.'
                        : 'Previous panels and partitions wiped. RAM dropped to fresh OS idle state.'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReinstallModalOpen(false);
                        setActiveTab('panels');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold underline text-[11px] ml-2 shrink-0 cursor-pointer"
                    >
                      {lang === 'id' ? 'Pasang Panel Hosting →' : 'Install Panel →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={() => setIsReinstallModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              >
                <span>{lang === 'id' ? 'Lanjut ke Konfigurasi' : 'Continue to Config'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Kembali' : 'Back'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              >
                <span>{lang === 'id' ? 'Lanjut ke Konfirmasi' : 'Proceed to Confirm'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Kembali' : 'Back'}</span>
              </button>
              <button
                type="button"
                disabled={confirmText.trim().toUpperCase() !== 'REINSTALL'}
                onClick={handleStartReinstall}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  confirmText.trim().toUpperCase() === 'REINSTALL'
                    ? 'text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-950/40 cursor-pointer'
                    : 'text-slate-500 bg-slate-800 cursor-not-allowed'
                }`}
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Format Disk & Instal Ulang Sekarang' : 'Wipe Disk & Reinstall Now'}</span>
              </button>
            </>
          )}

          {step === 4 && (
            <div className="w-full flex items-center justify-end gap-2">
              {isFinished ? (
                <>
                  <button
                    onClick={() => {
                      setIsReinstallModalOpen(false);
                      setActiveTab('terminal');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors font-mono"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{lang === 'id' ? 'Buka Terminal SSH' : 'Open SSH Terminal'}</span>
                  </button>
                  <button
                    onClick={() => setIsReinstallModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {lang === 'id' ? 'Tutup' : 'Close'}
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-500 font-mono">
                  {lang === 'id' ? 'Jangan tutup jendela ini...' : 'Please do not close this window...'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
