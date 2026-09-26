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
  Server,
  Layers,
  ShieldCheck,
  Terminal,
  Activity,
  HardDrive,
  RefreshCcw,
  LayoutDashboard,
  Zap,
  Globe,
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
  } = useVps();

  if (!authSession || !authSession.isLoggedIn) {
    return (
      <>
        <LoginPage />
        <ToastNotification />
      </>
    );
  }

  const tabButtons = [
    { id: 'overview', labelId: 'Ringkasan Node', labelEn: 'Node Overview', icon: Server },
    { id: 'panels', labelId: 'Hosting Panel (aaPanel dll)', labelEn: 'Control Panels', icon: LayoutDashboard },
    { id: 'apps', labelId: 'Pusat Aplikasi (1-Klik)', labelEn: 'App Store', icon: Layers },
    { id: 'domains', labelId: 'Domain & SSL', labelEn: 'Domain & SSL', icon: Globe },
    { id: 'config', labelId: 'Konfigurasi & Firewall', labelEn: 'Config & Firewall', icon: ShieldCheck },
    { id: 'terminal', labelId: 'Terminal SSH Web', labelEn: 'SSH Console', icon: Terminal },
    { id: 'monitoring', labelId: 'Telemetri & Proses', labelEn: 'Telemetry & Processes', icon: Activity },
    { id: 'backups', labelId: 'Snapshot & Backup', labelEn: 'Snapshots', icon: HardDrive },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Managed Server Nodes Shelf */}
        <ServerList />

        {/* Selected Node Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 pt-2">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {tabButtons.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{lang === 'id' ? tab.labelId : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Highlight CTA Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setIsUbuntuBypassModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap shadow-sm"
              title="Paksa instal Ubuntu menggunakan skrip netboot DD in-memory"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{lang === 'id' ? 'Bypass & Pasang Ubuntu' : 'Force Ubuntu'}</span>
            </button>

            <button
              onClick={() => setIsReinstallModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'id' ? 'Instal Ulang OS' : 'Reinstall OS'}</span>
            </button>
          </div>
        </div>

        {/* Viewport content based on activeTab */}
        <div className="transition-opacity duration-150">
          {activeTab === 'overview' && <ServerOverview />}
          {activeTab === 'panels' && <ControlPanelInstaller />}
          {activeTab === 'apps' && <SoftwareInstaller />}
          {activeTab === 'domains' && <DomainManager />}
          {activeTab === 'config' && <ServerConfigHub />}
          {activeTab === 'terminal' && <WebTerminal />}
          {activeTab === 'monitoring' && <ResourceMonitor />}
          {activeTab === 'backups' && <BackupsManager />}
        </div>
      </main>

      {/* Global Modals & Toasts */}
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

      {/* Quiet Footer */}
      <footer className="w-full border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>VelaVPS Orchestrator · Enterprise Cloud & VPS Server Management Platform</span>
          <span className="font-mono text-[11px] text-slate-600">
            Node: {selectedServer?.hostname || 'Cluster'} · OpenSSH 9.6p1 · KVM Virtualization
          </span>
        </div>
      </footer>
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
