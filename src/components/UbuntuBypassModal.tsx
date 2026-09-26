/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import {
  Zap,
  X,
  AlertTriangle,
  Check,
  Copy,
  Terminal,
  Box,
  Layers,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  Cpu,
  ShieldAlert,
} from 'lucide-react';

export const UbuntuBypassModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { selectedServer, executeRemoteCommand, addToast, lang } = useVps();

  // 3 Solusi Alternatif Tanpa Akses Provider
  const [selectedMode, setSelectedMode] = useState<'reinstall_dd' | 'docker_isolated' | 'distrobox_native'>('docker_isolated');
  const [targetDistro, setTargetDistro] = useState<'ubuntu' | 'debian' | 'alpine' | 'rocky'>('ubuntu');
  const [targetVersion, setTargetVersion] = useState('22.04');
  const [newPassword, setNewPassword] = useState('VelaVPS#2026@Root');
  const [isExecuting, setIsExecuting] = useState(false);
  const [execLogs, setExecLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !selectedServer) return null;

  // Generate perintah sesuai mode yang dipilih
  const getCommand = () => {
    if (selectedMode === 'docker_isolated') {
      return `which docker >/dev/null 2>&1 || (apt-get update && apt-get install -y docker.io) && docker run -it -d --name ${targetDistro}-env --restart=always -p 2222:22 ${targetDistro}:${targetVersion} bash`;
    }
    if (selectedMode === 'distrobox_native') {
      return `curl -s https://raw.githubusercontent.com/89luca89/distrobox/main/install | sh && distrobox create -i ${targetDistro}:${targetVersion} -n ${targetDistro}-env -Y && distrobox enter ${targetDistro}-env`;
    }
    // Netboot Reinstall DD in-memory
    return `curl -O https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh || curl -O https://github.com/leitbogioro/Tools/releases/download/OS_Reinstall/InstallNET.sh ; bash reinstall.sh ${targetDistro} ${targetVersion} --password "${newPassword}"`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    if (selectedMode === 'reinstall_dd') {
      const confirmText = lang === 'id' 
        ? 'PERINGATAN KERAS: Hard disk akan diformat ulang total via RAM! Semua data saat ini (termasuk FastPanel/file website) akan diganti bersih ke OS baru. Lanjutkan?'
        : 'CRITICAL WARNING: Hard drive will be completely wiped and reinstalled via RAM. Continue?';
      if (!window.confirm(confirmText)) return;
    }

    setIsExecuting(true);
    setExecLogs([`[1/3] Menyiapkan target ${targetDistro.toUpperCase()} ${targetVersion}...`]);

    try {
      const cmd = getCommand();
      setExecLogs((prev) => [...prev, `[2/3] Mengirim instruksi ke server: ${cmd.substring(0, 60)}...`]);
      
      const res = await executeRemoteCommand(cmd);
      if (res.success || selectedMode === 'reinstall_dd') {
        setExecLogs((prev) => [
          ...prev,
          `[3/3] Selesai! Instruksi berhasil dijalankan.`,
          selectedMode === 'reinstall_dd'
            ? 'Server sedang mengunduh kernel ke RAM & otomatis reboot. Tunggu 5-10 menit, lalu login SSH dengan password baru.'
            : 'Container / Environment baru sudah aktif dan siap digunakan!',
        ]);
        addToast(
          lang === 'id' ? 'Proses Berhasil Dijalankan' : 'Execution Started',
          lang === 'id' ? 'Perintah telah dieksekusi di server VPS Anda.' : 'Command executed successfully.',
          'success'
        );
      } else {
        setExecLogs((prev) => [...prev, `[Error] ${res.stderr || 'Gagal mengeksekusi perintah. Pastikan SSH terhubung.'}`]);
      }
    } catch (err: any) {
      setExecLogs((prev) => [...prev, `[Error] Terjadi kendala: ${err.message}`]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Bypass & Instalasi OS Tanpa Akses Provider
              </h3>
              <p className="text-xs text-slate-400">
                Pilih metode instalasi OS saat dashboard panel provider terkunci
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* 3 Pilihan Metode */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              1. Pilih Solusi / Arsitektur
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Option 1: Docker (Aman, Tanpa Format) */}
              <div
                onClick={() => setSelectedMode('docker_isolated')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedMode === 'docker_isolated'
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Box className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Paling Aman
                  </span>
                </div>
                <div className="font-bold text-xs text-white">Container / Docker</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Jalankan Ubuntu di dalam Debian. FastPanel & web Anda tetap aman 100%!
                </p>
              </div>

              {/* Option 2: Native Distrobox */}
              <div
                onClick={() => setSelectedMode('distrobox_native')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedMode === 'distrobox_native'
                    ? 'bg-sky-500/10 border-sky-500/50 shadow-md shadow-sky-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                    Native Dev
                  </span>
                </div>
                <div className="font-bold text-xs text-white">Distrobox Native</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Gunakan package manager distro lain langsung di terminal shell tanpa format.
                </p>
              </div>

              {/* Option 3: Wipe & Reinstall DD in-memory */}
              <div
                onClick={() => setSelectedMode('reinstall_dd')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedMode === 'reinstall_dd'
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    Wipe Total
                  </span>
                </div>
                <div className="font-bold text-xs text-white">Netboot DD in-RAM</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Format ulang disk server fisik langsung dari RAM tanpa butuh ISO provider.
                </p>
              </div>
            </div>
          </div>

          {/* Target Distro & Version */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                2. Pilih Distro Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ubuntu', name: 'Ubuntu' },
                  { id: 'debian', name: 'Debian' },
                  { id: 'alpine', name: 'Alpine' },
                  { id: 'rocky', name: 'Rocky Linux' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setTargetDistro(d.id as any);
                      if (d.id === 'ubuntu') setTargetVersion('22.04');
                      if (d.id === 'debian') setTargetVersion('12');
                      if (d.id === 'alpine') setTargetVersion('latest');
                      if (d.id === 'rocky') setTargetVersion('9');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-left transition-all ${
                      targetDistro === d.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                3. Versi Distro
              </label>
              {targetDistro === 'ubuntu' ? (
                <select
                  value={targetVersion}
                  onChange={(e) => setTargetVersion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="24.04">Ubuntu 24.04 LTS (Noble Numbat)</option>
                  <option value="22.04">Ubuntu 22.04 LTS (Jammy Jellyfish)</option>
                  <option value="20.04">Ubuntu 20.04 LTS (Focal Fossa)</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={targetVersion}
                  onChange={(e) => setTargetVersion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              )}

              {selectedMode === 'reinstall_dd' && (
                <div className="mt-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Password Root Baru:
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Command Preview */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Perintah Eksekusi Otomatis:</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Perintah'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-900/90 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap break-all border border-slate-800">
              {getCommand()}
            </pre>
          </div>

          {/* Execution Output */}
          {execLogs.length > 0 && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1 max-h-36 overflow-y-auto">
              {execLogs.map((log, i) => (
                <div key={i} className="text-slate-300">
                  <span className="text-emerald-400 mr-1.5">❯</span>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Batal
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExecute}
              disabled={isExecuting}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer ${
                selectedMode === 'reinstall_dd'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/50'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
              }`}
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengeksekusi...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {selectedMode === 'reinstall_dd' ? 'Eksekusi Reinstall (Format)' : 'Pasang & Aktifkan OS'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
