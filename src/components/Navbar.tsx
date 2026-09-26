/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import {
  Server,
  Terminal,
  Activity,
  Shield,
  Layers,
  LogOut,
  Menu,
  X,
  Zap,
  ChevronRight,
  Globe,
  Box,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    selectedServer,
    activeTab,
    setActiveTab,
    logout,
    lang,
    setLang,
    openDeleteServerModal,
    setIsCloudflareModalOpen,
  } = useVps();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 6 Menu Inti & Ikonik
  const primaryNavItems = [
    { id: 'overview', labelId: 'Overview', labelEn: 'Overview', icon: Activity, descId: 'Kesehatan Node & Telemetri' },
    { id: 'terminal', labelId: 'Terminal SSH', labelEn: 'Terminal', icon: Terminal, descId: 'Console root interaktif' },
    { id: 'docker', labelId: 'Docker (OS)', labelEn: 'Docker (OS)', icon: Box, descId: 'Isolated Ubuntu / Container' },
    { id: 'panels', labelId: 'Control Panel', labelEn: 'Panels', icon: Layers, descId: 'aaPanel / FastPanel' },
    { id: 'domains', labelId: 'Domain & SSL', labelEn: 'Domains', icon: Globe, descId: 'Cloudflare & sertifikat' },
    { id: 'config', labelId: 'Keamanan & Port', labelEn: 'Security', icon: Shield, descId: 'Firewall UFW & port' },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId as any);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm(lang === 'id' ? 'Apakah Anda yakin ingin logout?' : 'Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo + Node Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Server className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  Vela<span className="text-emerald-400">VPS</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Node v3.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:flex items-center gap-1.5">
                <span className="truncate max-w-[140px] text-slate-300">
                  {selectedServer?.ip || '38.102.126.42'}
                </span>
                <span>•</span>
                <span className="text-emerald-400">Online</span>
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Simplified Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 shadow-inner">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{lang === 'id' ? item.labelId : item.labelEn}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloudflare Direct Button */}
          <button
            onClick={() => setIsCloudflareModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all cursor-pointer"
            title="Kelola Cloudflare Tunnel"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span className="hidden md:inline">Tunnel</span>
          </button>

          {/* Language Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setLang('id')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                lang === 'id' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                lang === 'en' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Compact Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600/30 border border-rose-500/30 rounded-xl transition-all cursor-pointer"
            title="Keluar dari sesi"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">{lang === 'id' ? 'Keluar' : 'Logout'}</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5 text-slate-200" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            <div className="grid grid-cols-1 gap-1.5">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center justify-between p-3 rounded-xl text-left text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                        : 'bg-slate-900/60 text-slate-200 border border-slate-800/80 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-emerald-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">{lang === 'id' ? item.labelId : item.labelEn}</div>
                        <div className={`text-[10px] ${isActive ? 'text-slate-950/80' : 'text-slate-400'}`}>{item.descId}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCloudflareModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Cloudflare Tunnel</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openDeleteServerModal();
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold"
              >
                Hapus Node
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
