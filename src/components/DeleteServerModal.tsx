import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import {
  Trash2,
  AlertTriangle,
  X,
  Server,
  Globe,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const DeleteServerModal: React.FC = () => {
  const {
    isDeleteServerModalOpen,
    setIsDeleteServerModalOpen,
    serverToDelete,
    setServerToDelete,
    deleteServer,
    servers,
    lang,
  } = useVps();

  const [confirmed, setConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isDeleteServerModalOpen || !serverToDelete) {
    return null;
  }

  const handleClose = () => {
    if (isDeleting) return;
    setIsDeleteServerModalOpen(false);
    setServerToDelete(null);
    setConfirmed(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    // Brief natural feedback
    await new Promise((r) => setTimeout(r, 600));
    deleteServer(serverToDelete.id);
    setIsDeleting(false);
    setIsDeleteServerModalOpen(false);
    setServerToDelete(null);
    setConfirmed(false);
  };

  const isOnlyServer = servers.length <= 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Top Danger Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border-b border-rose-500/30 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {lang === 'id' ? 'Hapus Node VPS dari Sistem' : 'Delete VPS Node'}
              </h3>
              <p className="text-xs text-rose-300/80 mt-0.5">
                {lang === 'id'
                  ? 'Konfirmasi pelepasan dan penghapusan server VPS'
                  : 'Confirm server removal from orchestrator'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Server Details Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              {lang === 'id' ? 'Node VPS yang Akan Dihapus:' : 'Target VPS Node to Delete:'}
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                  <Server className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{serverToDelete.name}</div>
                  <div className="font-mono text-slate-400 text-[11px] flex items-center gap-2">
                    <span>{serverToDelete.hostname}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400">{serverToDelete.ip}</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Port {serverToDelete.connection?.sshPort || 22}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-900 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div>
                <span>OS: </span>
                <span className="text-slate-200 font-medium">
                  {serverToDelete.os.distro} {serverToDelete.os.version}
                </span>
              </div>
              <div>
                <span>Provider: </span>
                <span className="text-slate-200 font-medium">{serverToDelete.provider}</span>
              </div>
            </div>
          </div>

          {/* Impact Warning Notice */}
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1.5 text-slate-300">
            <div className="flex items-center gap-2 font-bold text-rose-300 text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{lang === 'id' ? 'Dampak Tindakan Ini:' : 'Action Impact:'}</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 pl-1 leading-relaxed">
              <li>
                {lang === 'id'
                  ? 'Server ini akan dihapus dari antarmuka dashboard, terminal SSH, dan pemantau telemetri.'
                  : 'This server will be removed from dashboard monitoring, SSH, and metrics.'}
              </li>
              <li>
                {lang === 'id'
                  ? 'Kredensial tersimpan dan cache lokal untuk node ini akan dibersihkan.'
                  : 'Cached credentials for this node will be purged from local storage.'}
              </li>
              {isOnlyServer && (
                <li className="text-amber-300 font-semibold">
                  {lang === 'id'
                    ? 'Karena ini adalah satu-satunya server aktif Anda, setelah dihapus Anda akan langsung dialihkan ke Halaman Login untuk menghubungkan server baru.'
                    : 'Since this is your only server, you will be redirected to the Login page to connect a new server.'}
                </li>
              )}
            </ul>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-rose-600 bg-slate-900 border-slate-700 focus:ring-rose-500 cursor-pointer"
            />
            <span className="text-xs text-slate-200 leading-snug">
              {lang === 'id'
                ? 'Saya memahami dan mengonfirmasi untuk menghapus server VPS ini dari sistem aplikasi.'
                : 'I understand and confirm that I want to remove this VPS server from the orchestrator.'}
            </span>
          </label>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            {lang === 'id' ? 'Batalkan' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!confirmed || isDeleting}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{lang === 'id' ? 'Menghapus VPS...' : 'Deleting...'}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Ya, Hapus VPS Sekarang' : 'Yes, Delete VPS Now'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
