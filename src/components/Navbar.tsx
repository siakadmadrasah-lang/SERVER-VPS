import React, { useState } from 'react';
import { useVps, NavTab } from '../context/VpsContext';
import {
  Server,
  Globe,
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  Layers,
  ShieldCheck,
  Terminal,
  Activity,
  HardDrive,
  RotateCcw,
  Zap,
  ChevronRight,
  Shield,
  Trash2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsReinstallModalOpen,
    setIsDomainSetupModalOpen,
    setIsCloudflareModalOpen,
    openDeleteServerModal,
    cloudflareTunnel,
    authSession,
    logout,
    lang,
    setLang,
    selectedServer,
  } = useVps();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: {
    id: NavTab;
    labelId: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
  }[] = [
    { id: 'overview', labelId: 'Ringkasan Node', labelEn: 'Node Overview', icon: Server },
    {
      id: 'reinstall',
      labelId: 'Instal Ulang OS',
      labelEn: 'Reinstall OS',
      icon: RotateCcw,
      onClick: () => {
        setIsReinstallModalOpen(true);
      },
    },
    { id: 'panels', labelId: 'Hosting Panel (aaPanel)', labelEn: 'Control Panels', icon: LayoutDashboard },
    { id: 'apps', labelId: 'Pusat Aplikasi (1-Klik)', labelEn: 'App Store', icon: Layers },
    { id: 'domains', labelId: 'Domain & SSL', labelEn: 'Domains & SSL', icon: Globe },
    { id: 'config', labelId: 'Konfigurasi & Firewall', labelEn: 'Config & Firewall', icon: ShieldCheck },
    { id: 'terminal', labelId: 'Terminal SSH Web', labelEn: 'SSH Console', icon: Terminal },
    { id: 'monitoring', labelId: 'Telemetri & Beban', labelEn: 'Telemetry & Load', icon: Activity },
    { id: 'backups', labelId: 'Snapshot & Backup', labelEn: 'Snapshots', icon: HardDrive },
  ];

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (item.onClick) {
      item.onClick();
    } else {
      setActiveTab(item.id);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('overview');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors leading-none flex items-center gap-1.5">
                <span>VelaVPS</span>
                <span className="hidden sm:inline text-xs font-mono font-normal text-slate-400">
                  Manager
                </span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono hidden xs:block">
                Orchestrator
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-emerald-400 bg-slate-900 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? item.labelId : item.labelEn}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Desktop & Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Switcher (Desktop) */}
          <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setLang('id')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                lang === 'id' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Bahasa Indonesia"
            >
              ID
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                lang === 'en' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Connected VPS Info Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 px-2.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                selectedServer?.status === 'running'
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-400 animate-spin'
              }`}
            />
            <span
              className="truncate max-w-[140px] text-emerald-400 font-semibold"
              title={authSession?.hostname || selectedServer?.hostname}
            >
              {authSession ? `${authSession.username}@${authSession.hostname}` : selectedServer?.hostname}
            </span>
          </div>

          {/* Cloudflare Tunnel Shortcut Button */}
          <button
            onClick={() => setIsCloudflareModalOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            title="Koneksi Cloudflare Tunnel & Domain"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span className="hidden xs:inline">Cloudflare</span>
            {cloudflareTunnel.status === 'connected' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Domain Setup CTA (Desktop) */}
          <button
            onClick={() => setActiveTab('domains')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-sky-300 bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/30 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Buka menu konfigurasi domain kustom & SSL"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>{lang === 'id' ? 'Domain & SSL' : 'Domain & SSL'}</span>
          </button>

          {/* ALWAYS VISIBLE LOGOUT BUTTON - Explicit text on Mobile & Desktop */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-rose-200 hover:text-white bg-rose-600/20 hover:bg-rose-600/40 active:bg-rose-600/60 border border-rose-500/40 hover:border-rose-400 rounded-lg transition-all shadow-sm shadow-rose-950/40 whitespace-nowrap cursor-pointer"
            title="Keluar dari sesi VPS ini dan kembali ke halaman login"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              {lang === 'id' ? 'Keluar' : 'Logout'}
            </span>
          </button>

          {/* Mobile Menu Hamburger Button (Android & Small Screens) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Buka menu navigasi"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-emerald-400" />
            ) : (
              <Menu className="w-5 h-5 text-slate-200" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER FOR ANDROID & TABLETS */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-slate-950/98 border-b border-slate-800 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 max-h-[82vh] overflow-y-auto">
            {/* User VPS Profile Card on Mobile */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-xs font-mono font-bold text-white truncate">
                      {authSession ? `${authSession.username}@${authSession.hostname}` : selectedServer?.hostname}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    IP: {selectedServer?.ip || 'Terhubung'} &bull; Port {authSession?.sshPort || 22}
                  </p>
                </div>
              </div>

              {/* Language Switcher on Mobile Drawer */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 shrink-0">
                <button
                  onClick={() => setLang('id')}
                  className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                    lang === 'id' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  ID
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                    lang === 'en' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Mobile Navigation List */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 pb-1">
                {lang === 'id' ? 'Menu Modul VPS' : 'VPS Modules'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold'
                          : 'bg-slate-900/50 text-slate-300 hover:bg-slate-900 border border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className="truncate">{lang === 'id' ? item.labelId : item.labelEn}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Buttons in Mobile Drawer */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsCloudflareModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-900/50 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cloudflare</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('domains');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-300 text-xs font-semibold hover:bg-sky-900/50 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Domain & SSL</span>
                </button>
              </div>

              {/* Action Buttons in Mobile Drawer */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openDeleteServerModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-rose-300 hover:text-white border border-rose-800/40 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>{lang === 'id' ? 'Hapus Node VPS Ini' : 'Delete This VPS'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Keluar dari Sesi VPS Ini (Logout)' : 'Logout from VPS Session'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
