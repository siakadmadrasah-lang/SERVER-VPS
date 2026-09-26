import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import {
  HardDrive,
  Plus,
  RotateCcw,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
  Download,
} from 'lucide-react';

export const BackupsManager: React.FC = () => {
  const {
    snapshots,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    selectedServer,
    lang,
    addToast,
  } = useVps();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);

  if (!selectedServer) return null;

  const serverSnapshots = snapshots.filter((s) => s.serverId === selectedServer.id);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotName.trim()) return;
    setIsCreateModalOpen(false);
    await createSnapshot(snapshotName.trim());
    setSnapshotName('');
  };

  const handleRestore = async (id: string, name: string) => {
    if (
      window.confirm(
        lang === 'id'
          ? `PERINGATAN: Memulihkan snapshot '${name}' akan mengembalikan disk server ke kondisi saat snapshot diambil. Lanjutkan?`
          : `WARNING: Restoring '${name}' will revert disk state. Continue?`
      )
    ) {
      await restoreSnapshot(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'id' ? 'Snapshot & Pencadangan VPS' : 'Snapshots & Backup Management'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'id'
              ? `Buat salinan instan seluruh disk NVMe untuk perlindungan bencana di ${selectedServer.hostname}`
              : `Point-in-time full disk image snapshots for disaster recovery on ${selectedServer.hostname}`}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{lang === 'id' ? 'Buat Snapshot Baru' : 'Create Snapshot'}</span>
        </button>
      </div>

      {/* Auto Backup Policy Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200">
              {lang === 'id' ? 'Kebijakan Pencadangan Terjadwal (Automated Backup)' : 'Automated Snapshot Policy'}
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              {lang === 'id'
                ? 'Jadwal mingguan aktif: Setiap Minggu pukul 03:00 WIB · Retensi 4 snapshot terakhir'
                : 'Active schedule: Weekly at 03:00 UTC · 4 snapshot retention window'}
            </div>
          </div>
        </div>

        <span className="text-xs font-mono text-emerald-400 font-semibold px-2 py-1 bg-emerald-950/40 rounded border border-emerald-500/20 self-start sm:self-auto">
          {lang === 'id' ? 'Otomatis Aktif' : 'Auto Active'}
        </span>
      </div>

      {/* Snapshots Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white tracking-tight">
          {lang === 'id' ? 'Daftar Snapshot Tersimpan' : 'Saved Snapshots'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5 font-medium font-sans">{lang === 'id' ? 'Nama Snapshot' : 'Snapshot Name'}</th>
                <th className="pb-2.5 font-medium">{lang === 'id' ? 'Ukuran Disk' : 'Size'}</th>
                <th className="pb-2.5 font-medium">{lang === 'id' ? 'Tanggal Dibuat' : 'Created At'}</th>
                <th className="pb-2.5 font-medium font-sans">Status</th>
                <th className="pb-2.5 font-medium text-right font-sans">{lang === 'id' ? 'Tindakan' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {serverSnapshots.map((snap) => (
                <tr key={snap.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-slate-200 font-semibold font-sans">{snap.name}</td>
                  <td className="py-3 text-slate-300 tabular-nums">{snap.sizeGb} GB</td>
                  <td className="py-3 text-slate-400">{snap.createdAt}</td>
                  <td className="py-3 font-sans">
                    <span
                      className={`text-[11px] ${
                        snap.status === 'ready'
                          ? 'text-emerald-400'
                          : snap.status === 'creating'
                          ? 'text-amber-400 animate-pulse'
                          : 'text-sky-400 animate-pulse'
                      }`}
                    >
                      {snap.status === 'ready'
                        ? 'Tersimpan (Siap)'
                        : snap.status === 'creating'
                        ? 'Memproses...'
                        : 'Memulihkan...'}
                    </span>
                  </td>
                  <td className="py-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRestore(snap.id, snap.name)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 rounded transition-colors"
                        title="Kembalikan disk ke snapshot ini"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{lang === 'id' ? 'Pulihkan' : 'Restore'}</span>
                      </button>

                      <button
                        onClick={() => deleteSnapshot(snap.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {serverSnapshots.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                    {lang === 'id' ? 'Belum ada snapshot untuk server ini.' : 'No snapshots found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Snapshot Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">
                {lang === 'id' ? 'Buat Snapshot Instan' : 'Create Instant Disk Snapshot'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'id' ? 'Label / Nama Snapshot' : 'Snapshot Label'}
              </label>
              <input
                type="text"
                required
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="Sebelum-Upgrade-Nginx-Prod"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {lang === 'id'
                  ? 'Snapshot akan membekukan filesystem selama beberapa detik dan menyimpan salinan disk.'
                  : 'Filesystem sync and freeze will take approximately ~3-5 seconds.'}
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                {lang === 'id' ? 'Ambil Snapshot' : 'Take Snapshot'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
