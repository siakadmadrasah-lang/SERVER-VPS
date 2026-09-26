import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import { UBUNTU_BYPASS_METHODS } from '../data/mockData';
import {
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  Zap,
  ShieldAlert,
  ArrowRight,
  Info,
  Server,
} from 'lucide-react';

interface UbuntuBypassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UbuntuBypassModal: React.FC<UbuntuBypassModalProps> = ({ isOpen, onClose }) => {
  const { selectedServer, reinstallOs, lang, addToast } = useVps();

  const [selectedMethodId, setSelectedMethodId] = useState<string>('in-memory-dd');
  const [targetVersion, setTargetVersion] = useState<string>('24.04');
  const [rootPassword, setRootPassword] = useState<string>('Ubuntu#2026@RootPass');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [execLogs, setExecLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen || !selectedServer) return null;

  const currentMethod =
    UBUNTU_BYPASS_METHODS.find((m) => m.id === selectedMethodId) || UBUNTU_BYPASS_METHODS[0];

  const generatedCommand =
    selectedMethodId === 'in-memory-dd'
      ? `curl -fLO https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh || curl -fLO https://github.com/leitbogioro/Tools/releases/download/OS_Reinstall/InstallNET.sh && bash reinstall.sh ubuntu ${targetVersion} --password "${rootPassword}"`
      : currentMethod.bashCommand;

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    addToast(
      lang === 'id' ? 'Perintah Disalin' : 'Command Copied',
      lang === 'id'
        ? 'Perintah bypass siap di-paste ke terminal VPS Anda'
        : 'Bypass command copied to clipboard',
      'info'
    );
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleStartBypass = async () => {
    setIsExecuting(true);
    setIsCompleted(false);
    setExecLogs([
      `[BYPASS] Menginisiasi protokol bypass OS provider pada node ${selectedServer.hostname}...`,
      `[SYSTEM] OS Saat Ini: ${selectedServer.os.distro} ${selectedServer.os.version} -> Target: Ubuntu ${targetVersion} LTS`,
      `[STEP 1] Mengunduh kernel in-memory netboot kexec ke memori RAM...`,
    ]);

    setTimeout(() => {
      setExecLogs((prev) => [
        ...prev,
        `[STEP 2] Membekukan I/O disk aktif dan unmount /dev/vda...`,
        `[STEP 3] Membuka streaming cloud image resmi Canonical: ubuntu-${targetVersion}-minimal-cloudimg-amd64.raw.xz...`,
        `[DD] Menulis raw image ke block device fisik (/dev/vda) via dd stream...`,
      ]);
    }, 1500);

    setTimeout(() => {
      setExecLogs((prev) => [
        ...prev,
        `[NET] Mendeteksi konfigurasi jaringan publik: IP ${selectedServer.ip}, Gateway, dan DNS...`,
        `[AUTH] Menginjeksi password root baru dan mengaktifkan OpenSSH port 22...`,
        `[KEXEC] Memulai ulang kernel secara paksa (Cold Reboot) ke Ubuntu ${targetVersion} LTS...`,
      ]);
    }, 3200);

    await reinstallOs(selectedServer.id, {
      distroId: 'ubuntu',
      version: `${targetVersion} LTS`,
      filesystem: 'ext4',
      swapGb: 4,
      rootPassword,
      sshKey: '',
      preinstallPackages: ['docker', 'ufw', 'fail2ban'],
      hostname: selectedServer.hostname,
    });

    setTimeout(() => {
      setExecLogs((prev) => [
        ...prev,
        `[SUCCESS] Bypass Berhasil! Server kini menjalankan resmi Ubuntu ${targetVersion} LTS.`,
      ]);
      setIsCompleted(true);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                {lang === 'id' ? 'Bypass & Paksa Instal Ubuntu (Netboot DD)' : 'Force Ubuntu Netboot DD Reinstall'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'id'
                  ? 'Solusi jika VPS yang dibeli tidak menyediakan template Ubuntu di panel provider'
                  : 'Install official Ubuntu when provider does not support it in template catalog'}
              </p>
            </div>
          </div>
          {!isExecuting && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {!isExecuting ? (
            <>
              {/* Question Answer Banner */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-emerald-200 leading-relaxed">
                  <h4 className="font-semibold text-white text-sm">
                    {lang === 'id'
                      ? 'Apakah bisa diatur agar support Ubuntu? TENTU BISA!'
                      : 'Can we configure the VPS to support Ubuntu? ABSOLUTELY!'}
                  </h4>
                  <p className="text-slate-300">
                    {lang === 'id'
                      ? 'Banyak provider VPS murah hanya menyediakan CentOS, Rocky Linux, atau Debian. Dengan teknik Netboot DD in-memory, kita dapat menimpa partisi disk utama secara langsung menggunakan image resmi Ubuntu 24.04 LTS dari Canonical tanpa bergantung pada panel provider.'
                      : 'Many VPS hosts only offer limited CentOS or Debian templates. Using in-memory Netboot DD streaming, you can overwrite the block device directly with official Ubuntu images.'}
                  </p>
                </div>
              </div>

              {/* Target Ubuntu Version */}
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  {lang === 'id' ? 'Pilih Target Versi Ubuntu' : 'Target Ubuntu Version'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '24.04', label: 'Ubuntu 24.04 LTS (Noble Numbat) - Rekomendasi' },
                    { id: '22.04', label: 'Ubuntu 22.04 LTS (Jammy Jellyfish)' },
                  ].map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setTargetVersion(v.id)}
                      className={`p-3 rounded-lg border cursor-pointer font-mono transition-all ${
                        targetVersion === v.id
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      {v.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Methods Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  {lang === 'id' ? 'Pilih Metode Bypass' : 'Choose Bypass Method'}
                </label>
                <div className="space-y-2">
                  {UBUNTU_BYPASS_METHODS.map((method) => {
                    const isSelected = selectedMethodId === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedMethodId(method.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-200 text-xs">
                            {lang === 'id' ? method.titleId : method.title}
                          </h4>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {lang === 'id' ? method.descriptionId : method.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500">
                          {method.features.map((feat, idx) => (
                            <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Password Configuration */}
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1">
                  {lang === 'id' ? 'Kata Sandi Root Baru (Untuk Login Setelah Selesai)' : 'New Root Password'}
                </label>
                <input
                  type="text"
                  value={rootPassword}
                  onChange={(e) => setRootPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Command Preview Box */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span>Perintah Shell Otomatis (Dapat Disalin untuk Terminal Manual):</span>
                  <button
                    onClick={() => copyCommand(generatedCommand)}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd ? 'Tersalin' : 'Salin Perintah'}</span>
                  </button>
                </div>
                <code className="block p-2.5 bg-slate-900 rounded font-mono text-slate-300 break-all select-all leading-relaxed">
                  {generatedCommand}
                </code>
              </div>
            </>
          ) : (
            /* Execution logs view */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                {!isCompleted ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span>
                  {isCompleted
                    ? 'Proses Bypass Ubuntu Telah Selesai!'
                    : 'Sedang mengeksekusi streaming raw image ke /dev/vda...'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 max-h-60 overflow-y-auto">
                {execLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-emerald-400 select-none mr-2">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              {isCompleted && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                  <div className="font-semibold text-emerald-400">
                    Akses Login Ubuntu Baru:
                  </div>
                  <div className="font-mono text-xs text-slate-200">
                    <div>Host: <span className="text-white">{selectedServer.ip}:22</span></div>
                    <div>User: <span className="text-white">root</span></div>
                    <div>Password: <span className="text-amber-300">{rootPassword}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          {!isExecuting ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                {lang === 'id' ? 'Tutup' : 'Close'}
              </button>
              <button
                type="button"
                onClick={handleStartBypass}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'id' ? 'Jalankan Bypass & Pasang Ubuntu' : 'Execute Ubuntu Bypass'}</span>
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              {isCompleted && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                >
                  {lang === 'id' ? 'Selesai & Buka Dashboard' : 'Done & Return'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
