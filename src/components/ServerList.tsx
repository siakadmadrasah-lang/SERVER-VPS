import React from 'react';
import { useVps } from '../context/VpsContext';
import { VpsServer } from '../types/vps';
import {
  Server,
  Power,
  RotateCw,
  Cpu,
  HardDrive,
  Copy,
  Check,
  ChevronRight,
  RefreshCw,
  Link2,
  LogOut,
  Trash2,
} from 'lucide-react';

export const ServerList: React.FC = () => {
  const {
    servers,
    selectedServerId,
    setSelectedServerId,
    updateServerPower,
    setIsReinstallModalOpen,
    setIsConnectVpsModalOpen,
    openDeleteServerModal,
    setActiveTab,
    lang,
    addToast,
    logout,
  } = useVps();

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyIp = (e: React.MouseEvent, ip: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ip);
    setCopiedId(id);
    addToast(
      lang === 'id' ? 'IP Disalin' : 'IP Copied',
      `${ip} ${lang === 'id' ? 'disalin ke papan klip' : 'copied to clipboard'}`,
      'info'
    );
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            {lang === 'id' ? 'Daftar Node VPS Terkelola' : 'Managed VPS Nodes'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'id'
              ? 'Pilih node untuk melihat detail metrik, instal ulang OS, atau kelola konfigurasi'
              : 'Select a server node to view live metrics, reinstall OS, or manage stack'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400 font-mono hidden md:block">
            <span className="text-emerald-400 font-semibold">{servers.filter((s) => s.status === 'running').length}</span>/{servers.length} Online
          </div>
          <button
            onClick={() => setIsConnectVpsModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-lg transition-colors whitespace-nowrap"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Hubungkan VPS Baru' : 'Connect New VPS'}</span>
          </button>
          <button
            onClick={() => openDeleteServerModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            title="Buka dialog konfirmasi untuk menghapus VPS"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === 'id' ? 'Hapus VPS' : 'Delete VPS'}</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            title="Keluar dari sesi VPS ini"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'id' ? 'Keluar' : 'Logout'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {servers.map((server) => {
          const isSelected = server.id === selectedServerId;
          const isRunning = server.status === 'running';
          const isReinstalling = server.status === 'reinstalling';

          return (
            <div
              key={server.id}
              onClick={() => setSelectedServerId(server.id)}
              className={`group relative p-4 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              {/* Header: Flag, Name, Status dot */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg leading-none" title={server.region.country}>
                    {server.region.flag}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-emerald-300 transition-colors">
                      {server.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate font-mono">{server.hostname}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isReinstalling
                        ? 'bg-amber-400 animate-spin'
                        : isRunning
                        ? 'bg-emerald-400'
                        : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-[11px] font-mono text-slate-400">
                    {isReinstalling
                      ? lang === 'id'
                        ? 'Instal Ulang...'
                        : 'Reinstalling...'
                      : isRunning
                      ? 'Online'
                      : 'Offline'}
                  </span>
                </div>
              </div>

              {/* IP Bar */}
              <div className="mt-3 flex items-center justify-between py-1.5 px-2 bg-slate-950/60 rounded-lg border border-slate-800/50 text-xs font-mono">
                <span className="text-slate-300 tabular-nums">{server.ip}</span>
                <button
                  onClick={(e) => copyIp(e, server.ip, server.id)}
                  className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                  title="Salin IP"
                >
                  {copiedId === server.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Specs & Metadata (Clean text, no pill wrappers) */}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono tabular-nums">{server.specs.vcpu} vCPU</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono tabular-nums">{server.specs.ramGb} GB RAM</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono tabular-nums">{server.specs.diskGb} GB {server.specs.diskType.split(' ')[0]}</span>
              </div>

              {/* OS info */}
              <div className="mt-1 text-[11px] text-slate-500 truncate">
                {server.os.distro} {server.os.version}
              </div>

              {/* Live usage bars if running */}
              {isRunning && (
                <div className="mt-3 space-y-1.5 pt-2.5 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-slate-500" /> CPU
                    </span>
                    <span className="font-mono tabular-nums text-slate-300">{server.metrics.cpuPct}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        server.metrics.cpuPct > 80
                          ? 'bg-rose-500'
                          : server.metrics.cpuPct > 50
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${server.metrics.cpuPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-slate-500" /> RAM
                    </span>
                    <span className="font-mono tabular-nums text-slate-300">{server.metrics.ramPct}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-500"
                      style={{ width: `${server.metrics.ramPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Actions Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {isRunning ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateServerPower(server.id, 'reboot');
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors"
                        title={lang === 'id' ? 'Mulai Ulang (Reboot)' : 'Reboot Node'}
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateServerPower(server.id, 'stop');
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        title={lang === 'id' ? 'Matikan (Shutdown)' : 'Power Off'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteServerModal(server);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                        title={lang === 'id' ? 'Hapus VPS ini dari sistem' : 'Delete this VPS'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateServerPower(server.id, 'start');
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors font-medium"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{lang === 'id' ? 'Nyalakan' : 'Power On'}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteServerModal(server);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                        title={lang === 'id' ? 'Hapus VPS ini dari sistem' : 'Delete this VPS'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">
                  <span>{isSelected ? (lang === 'id' ? 'Terpilih' : 'Active') : (lang === 'id' ? 'Kelola' : 'Manage')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
