/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VpsProvider, useVps } from './context/VpsContext';
import { Navbar } from './components/Navbar';
import { ServerList } from './components/ServerList';
import { ServerOverview } from './components/ServerOverview';
import { SoftwareInstaller } from './components/SoftwareInstaller';
import { ServerConfigHub } from './components/ServerConfigHub';
import { WebTerminal } from './components/WebTerminal';
import { ResourceMonitor } from './components/ResourceMonitor';
import { BackupsManager } from './components/BackupsManager';
import { ControlPanelInstaller } from './components/ControlPanelInstaller';
import { DomainManager } from './components/DomainManager';
import { UbuntuBypassModal } from './components/UbuntuBypassModal';
import { ReinstallOsModal } from './components/ReinstallOsModal';
import { AddServerModal } from './components/AddServerModal';
import { ConnectVpsModal } from './components/ConnectVpsModal';
import { DomainSetupModal } from './components/DomainSetupModal';
import { CloudflareSetupModal } from './components/CloudflareSetupModal';
import { DeleteServerModal } from './components/DeleteServerModal';
import { EditServerModal } from './components/EditServerModal';
import { ToastNotification } from './components/ToastNotification';
import { LoginPage } from './components/LoginPage';
import {
  Activity,
  Terminal,
  Layers,
  Globe,
  Shield,
  Zap,
  RefreshCcw,
  Sparkles,
  Cpu,
  HardDrive,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsReinstallModalOpen,
    isUbuntuBypassModalOpen,
    setIsUbuntuBypassModalOpen,
    isConnectVpsModalOpen,
    setIsConnectVpsModalOpen,
    isDomainSetupModalOpen,
    setIsDomainSetupModalOpen,
    isCloudflareModalOpen,
    setIsCloudflareModalOpen,
    isEditServerModalOpen,
    setIsEditServerModalOpen,
    serverToEdit,
    selectedServer,
    authSession,
    lang,
    isRealSshActive,
  } = useVps();

  if (!authSession || !authSession.isLoggedIn) {
    return (
      <>
        <LoginPage />
        <ToastNotification />
      </>
    );
  }

  // 5 Tab Inti yang Paling Sering Digunakan
  const essentialTabs = [
    { id: 'overview', label: 'Ringkasan Node', icon: Activity, badge: 'Live' },
    { id: 'terminal', label: 'Web Terminal SSH', icon: Terminal, badge: 'Root' },
    { id: 'panels', label: 'Hosting & Web Control', icon: Layers, badge: 'aaPanel / FastPanel' },
    { id: 'domains', label: 'Domain & SSL', icon: Globe, badge: 'Cloudflare' },
    { id: 'config', label: 'Keamanan & Port', icon: Shield, badge: 'UFW' },
  ];

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300 pb-20">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* Managed Server Nodes Shelf */}
        <ServerList />

        {/* Modern & Compact Navigation Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          {/* Main Segmented Pill Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {essentialTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
            <button
              onClick={() => setIsUbuntuBypassModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all cursor-pointer"
              title="Force install Ubuntu via netboot DD"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Bypass Ubuntu</span>
            </button>
            <button
              onClick={() => setIsReinstallModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Instal Ulang OS</span>
            </button>
          </div>
        </div>

        {/* Viewport content */}
        <div className="transition-all duration-150">
          {activeTab === 'overview' && <ServerOverview />}
          {activeTab === 'terminal' && <WebTerminal />}
          {activeTab === 'panels' && <ControlPanelInstaller />}
          {activeTab === 'domains' && <DomainManager />}
          {activeTab === 'config' && <ServerConfigHub />}
          {activeTab === 'apps' && <SoftwareInstaller />}
          {activeTab === 'monitoring' && <ResourceMonitor />}
          {activeTab === 'backups' && <BackupsManager />}
        </div>
      </main>

      {/* STICKY MODERN FOOTER BAR */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/85 backdrop-blur-md border-t border-slate-800/80 py-2.5 px-4 sm:px-6 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
          {/* Left: Server Connection Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-slate-300 font-bold hidden sm:inline">
                {selectedServer?.name || 'VelaVPS Node'}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                ({selectedServer?.ip || '127.0.0.1'})
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Load: {selectedServer?.metrics.loadAvg[0] || '0.12'}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                <span>RAM: {selectedServer?.specs.ramMb || 1024} MB</span>
              </span>
            </div>
          </div>

          {/* Center / Right: Quick Navigation Badges & Status */}
          <div className="flex items-center gap-2 font-mono text-[11px]">
            {isRealSshActive ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">SSH Connected</span>
              </span>
            ) : (
              <button
                onClick={() => setIsConnectVpsModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold cursor-pointer transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Hubungkan SSH Fisik</span>
              </button>
            )}

            <span className="text-slate-500 hidden lg:inline">
              VelaVPS Orchestrator 2026
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals & Notifications */}
      <ReinstallOsModal />
      <UbuntuBypassModal
        isOpen={isUbuntuBypassModalOpen}
        onClose={() => setIsUbuntuBypassModalOpen(false)}
      />
      <ConnectVpsModal
        isOpen={isConnectVpsModalOpen}
        onClose={() => setIsConnectVpsModalOpen(false)}
      />
      <DomainSetupModal
        isOpen={isDomainSetupModalOpen}
        onClose={() => setIsDomainSetupModalOpen(false)}
      />
      <CloudflareSetupModal
        isOpen={isCloudflareModalOpen}
        onClose={() => setIsCloudflareModalOpen(false)}
      />
      <EditServerModal
        isOpen={isEditServerModalOpen}
        onClose={() => setIsEditServerModalOpen(false)}
        server={serverToEdit}
      />
      <DeleteServerModal />
      <AddServerModal />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <VpsProvider>
      <DashboardContent />
    </VpsProvider>
  );
}
