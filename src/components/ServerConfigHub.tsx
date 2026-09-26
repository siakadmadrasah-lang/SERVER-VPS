import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import { FirewallRule, DomainProxy, CronTask, SystemConfigFile } from '../types/vps';
import {
  Shield,
  Globe,
  Clock,
  FileCode,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Play,
  RotateCw,
  Check,
  AlertTriangle,
  X,
  Copy,
  ExternalLink,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const ServerConfigHub: React.FC = () => {
  const {
    firewallRules,
    addFirewallRule,
    deleteFirewallRule,
    toggleFirewallRule,
    bannedIps,
    unbanIp,
    domainProxies,
    addDomainProxy,
    deleteDomainProxy,
    toggleDomainProxy,
    requestSslCertificate,
    cronTasks,
    addCronTask,
    deleteCronTask,
    toggleCronTask,
    runCronNow,
    configFiles,
    updateConfigFile,
    selectedServer,
    lang,
    addToast,
  } = useVps();

  // Sub-tab selection: 'firewall' | 'domains' | 'cron' | 'editor'
  const [subTab, setSubTab] = useState<'firewall' | 'domains' | 'cron' | 'editor'>('firewall');

  // Modal states
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [newRulePort, setNewRulePort] = useState('8080');
  const [newRuleProto, setNewRuleProto] = useState<'TCP' | 'UDP' | 'ANY'>('TCP');
  const [newRuleAction, setNewRuleAction] = useState<'ALLOW' | 'DENY'>('ALLOW');
  const [newRuleSource, setNewRuleSource] = useState('0.0.0.0/0');
  const [newRuleDesc, setNewRuleDesc] = useState('');

  // Domain modal state
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);
  const [newDomainName, setNewDomainName] = useState('app.mydomain.com');
  const [newDomainTargetPort, setNewDomainTargetPort] = useState(3000);
  const [newDomainForceHttps, setNewDomainForceHttps] = useState(true);
  const [newDomainWs, setNewDomainWs] = useState(true);

  // Cron modal state
  const [isAddCronOpen, setIsAddCronOpen] = useState(false);
  const [newCronSchedule, setNewCronSchedule] = useState('0 3 * * *');
  const [newCronCommand, setNewCronCommand] = useState('/opt/backup.sh');
  const [newCronDesc, setNewCronDesc] = useState('Pencadangan file harian');

  // Config editor state
  const [selectedConfigId, setSelectedConfigId] = useState<string>(configFiles[0]?.id || 'nginx-conf');
  const currentConfigFile = configFiles.find((c) => c.id === selectedConfigId) || configFiles[0];
  const [editorContent, setEditorContent] = useState<string>(currentConfigFile?.content || '');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // When config file selection changes
  const handleSelectConfigFile = (id: string) => {
    setSelectedConfigId(id);
    const target = configFiles.find((c) => c.id === id);
    if (target) {
      setEditorContent(target.content);
    }
  };

  // Save config
  const handleSaveConfigFile = async () => {
    if (!currentConfigFile) return;
    setIsSavingConfig(true);
    await updateConfigFile(currentConfigFile.id, editorContent);
    setTimeout(() => setIsSavingConfig(false), 500);
  };

  // Add rule submit
  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRulePort) return;
    addFirewallRule({
      port: newRulePort,
      protocol: newRuleProto,
      action: newRuleAction,
      source: newRuleSource,
      description: newRuleDesc || `Port ${newRulePort} ${newRuleProto}`,
      active: true,
    });
    setIsAddRuleOpen(false);
    setNewRulePort('');
    setNewRuleDesc('');
  };

  // Add domain submit
  const handleAddDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName) return;
    addDomainProxy({
      domain: newDomainName,
      targetPort: Number(newDomainTargetPort),
      sslStatus: 'active',
      sslExpiry: '90 hari tersisa (Let\'s Encrypt)',
      forceHttps: newDomainForceHttps,
      websocket: newDomainWs,
      active: true,
    });
    setIsAddDomainOpen(false);
    setNewDomainName('');
  };

  // Add cron submit
  const handleAddCronSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCronCommand) return;
    addCronTask({
      schedule: newCronSchedule,
      humanSchedule: newCronSchedule === '0 3 * * *' ? 'Setiap hari pukul 03:00' : newCronSchedule,
      command: newCronCommand,
      description: newCronDesc || 'Tugas kustom',
      enabled: true,
    });
    setIsAddCronOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Segmented Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            {lang === 'id' ? 'Konfigurasi & Pengaturan Server' : 'Server Stack Configuration'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'id'
              ? `Pengaturan firewall UFW, reverse proxy domain, cron jobs, dan file konfigurasi di ${selectedServer?.hostname}`
              : `Manage network firewall, domain proxies, crontab, and raw configuration files`}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          {[
            { id: 'firewall', labelId: 'Firewall & Keamanan', labelEn: 'Firewall & Security', icon: Shield },
            { id: 'domains', labelId: 'Domain & SSL', labelEn: 'Domains & SSL', icon: Globe },
            { id: 'cron', labelId: 'Penjadwalan Cron', labelEn: 'Cron Tasks', icon: Clock },
            { id: 'editor', labelId: 'Editor Berkas', labelEn: 'Config Editor', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? tab.labelId : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBTAB 1: FIREWALL & SECURITY */}
      {subTab === 'firewall' && (
        <div className="space-y-6">
          {/* Firewall Rules Section */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <span>{lang === 'id' ? 'Aturan Port Firewall (UFW / iptables)' : 'Firewall Port Rules'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'id' ? 'Status: Aktif (Default DENY Inbound, ALLOW Outbound)' : 'Status: Enforcing (Default Drop Inbound)'}
                </p>
              </div>

              <button
                onClick={() => setIsAddRuleOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{lang === 'id' ? 'Tambah Aturan Port' : 'Add Port Rule'}</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2.5 font-medium">{lang === 'id' ? 'Aksi' : 'Action'}</th>
                    <th className="pb-2.5 font-medium">{lang === 'id' ? 'Port / Rentang' : 'Port / Range'}</th>
                    <th className="pb-2.5 font-medium">Protokol</th>
                    <th className="pb-2.5 font-medium">{lang === 'id' ? 'Sumber (IP)' : 'Source CIDR'}</th>
                    <th className="pb-2.5 font-medium">{lang === 'id' ? 'Keterangan' : 'Description'}</th>
                    <th className="pb-2.5 font-medium text-right">{lang === 'id' ? 'Kelola' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {firewallRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3">
                        <span
                          className={`font-semibold ${
                            rule.action === 'ALLOW' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {rule.action}
                        </span>
                      </td>
                      <td className="py-3 text-slate-200 tabular-nums">{rule.port}</td>
                      <td className="py-3 text-slate-400">{rule.protocol}</td>
                      <td className="py-3 text-slate-300 truncate max-w-[140px]">{rule.source}</td>
                      <td className="py-3 text-slate-400 font-sans">{rule.description}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleFirewallRule(rule.id)}
                            className={`px-2 py-1 rounded text-[11px] transition-colors ${
                              rule.active
                                ? 'text-emerald-400 hover:bg-emerald-950/40'
                                : 'text-slate-500 hover:bg-slate-800'
                            }`}
                          >
                            {rule.active ? (lang === 'id' ? 'Aktif' : 'Active') : (lang === 'id' ? 'Nonaktif' : 'Disabled')}
                          </button>
                          <button
                            onClick={() => deleteFirewallRule(rule.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fail2ban Intrusion Prevention Section */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'id' ? 'Daftar IP Diblokir Otomatis (Fail2ban Jails)' : 'Fail2ban Banned Attackers'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'id'
                    ? 'IP yang terdeteksi mencoba serangan brute-force SSH atau exploit HTTP otomatis diblokir'
                    : 'Attacker IPs quarantined after failed login thresholds'}
                </p>
              </div>
              <span className="text-xs font-mono text-amber-400">
                {bannedIps.length} {lang === 'id' ? 'IP Terkarantina' : 'IPs Banned'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2.5 font-medium">{lang === 'id' ? 'Alamat IP Penyerang' : 'Attacker IP'}</th>
                    <th className="pb-2.5 font-medium">{lang === 'id' ? 'Penjara (Jail)' : 'Fail2ban Jail'}</th>
                    <th className="pb-2.5 font-medium">{lang === 'id' ? 'Percobaan Gagal' : 'Failed Attempts'}</th>
                    <th className="pb-2.5 font-medium">{lang === 'id' ? 'Waktu Blokir' : 'Banned Time'}</th>
                    <th className="pb-2.5 font-medium text-right">{lang === 'id' ? 'Tindakan' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {bannedIps.map((banned) => (
                    <tr key={banned.ip} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 text-slate-200 font-semibold flex items-center gap-2">
                        <span>{banned.ip}</span>
                        <span className="text-xs font-normal text-slate-500 font-sans">{banned.country}</span>
                      </td>
                      <td className="py-3 text-amber-400">{banned.jail}</td>
                      <td className="py-3 text-slate-300 tabular-nums">{banned.attempts}x percobaan</td>
                      <td className="py-3 text-slate-400">{banned.bannedAt}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => unbanIp(banned.ip)}
                          className="flex items-center gap-1 ml-auto px-2.5 py-1 text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-950/40 rounded border border-sky-500/30 transition-colors font-sans"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>{lang === 'id' ? 'Buka Blokir (Unban)' : 'Unban IP'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bannedIps.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        {lang === 'id' ? 'Tidak ada IP yang saat ini diblokir.' : 'No active IP bans.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DOMAINS & REVERSE PROXY */}
      {subTab === 'domains' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'id' ? 'Virtual Host & Reverse Proxy (Nginx / SSL)' : 'Domain Proxy & SSL Manager'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'id'
                    ? 'Arahkan domain publik ke port aplikasi internal (Node.js, Docker, Python) dengan otomatisasi SSL Let\'s Encrypt'
                    : 'Forward domains to internal application ports with Let\'s Encrypt auto-renewal'}
                </p>
              </div>

              <button
                onClick={() => setIsAddDomainOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{lang === 'id' ? 'Tambah Domain Proxy' : 'Add Domain Proxy'}</span>
              </button>
            </div>

            {/* Domains List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {domainProxies.map((proxy) => (
                <div
                  key={proxy.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <a
                          href={`https://${proxy.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-slate-100 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                        >
                          <span>{proxy.domain}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                        <div className="text-xs font-mono text-emerald-400 mt-0.5">
                          → http://127.0.0.1:{proxy.targetPort}
                        </div>
                      </div>

                      {/* SSL Status */}
                      <div className="flex items-center gap-1 text-[11px] font-mono">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">SSL Aktif</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/60">
                      <span>{proxy.sslExpiry}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>HTTPS Redirect: {proxy.forceHttps ? 'Ya' : 'Tidak'}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>WebSocket: {proxy.websocket ? 'Aktif' : 'Nonaktif'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => requestSslCertificate(proxy.id)}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>{lang === 'id' ? 'Perbarui SSL' : 'Renew SSL'}</span>
                    </button>

                    <button
                      onClick={() => deleteDomainProxy(proxy.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CRON TASKS */}
      {subTab === 'cron' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>{lang === 'id' ? 'Penjadwalan Crontab & Tugas Otomatis' : 'Crontab Scheduled Tasks'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'id'
                    ? 'Jalankan skrip pencadangan database, pembersihan cache, atau pembaruan SSL secara terjadwal'
                    : 'Manage crontab schedules and execute scripts on background timers'}
                </p>
              </div>

              <button
                onClick={() => setIsAddCronOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{lang === 'id' ? 'Tambah Tugas Cron' : 'Add Cron Task'}</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {cronTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-purple-400 font-semibold px-2 py-0.5 bg-purple-950/40 rounded border border-purple-500/20">
                        {task.schedule}
                      </code>
                      <span className="text-xs text-slate-300 font-medium">{task.humanSchedule}</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 truncate">
                      $ {task.command}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {task.description} · Terakhir: {task.lastRun || 'Belum dijalankan'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => runCronNow(task.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-mono"
                      title="Jalankan sekarang"
                    >
                      <Play className="w-3 h-3 text-emerald-400" />
                      <span>{lang === 'id' ? 'Jalankan' : 'Run Now'}</span>
                    </button>
                    <button
                      onClick={() => toggleCronTask(task.id)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        task.enabled ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {task.enabled ? (lang === 'id' ? 'Aktif' : 'Enabled') : (lang === 'id' ? 'Mati' : 'Disabled')}
                    </button>
                    <button
                      onClick={() => deleteCronTask(task.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: CONFIG FILE EDITOR */}
      {subTab === 'editor' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'id' ? 'Editor Berkas Konfigurasi Sistem' : 'System Configuration File Editor'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'id'
                  ? 'Sunting langsung file konfigurasi utama dengan reload otomatis daemon terkait'
                  : 'Directly modify core configuration files with automatic daemon reloading'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedConfigId}
                onChange={(e) => handleSelectConfigFile(e.target.value)}
                className="px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {configFiles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.path}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSaveConfigFile}
                disabled={isSavingConfig}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
              >
                {isSavingConfig ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{lang === 'id' ? 'Simpan & Terapkan' : 'Save & Reload'}</span>
              </button>
            </div>
          </div>

          {/* Raw Textarea Editor */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs shadow-xl">
            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-slate-400">
              <span className="text-emerald-400 font-semibold">{currentConfigFile?.path}</span>
              <span className="text-[11px] text-slate-500">
                Service: <span className="text-slate-300">systemctl reload {currentConfigFile?.serviceToReload}</span>
              </span>
            </div>
            <textarea
              rows={18}
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="w-full p-4 bg-transparent text-slate-200 font-mono text-xs focus:outline-none resize-y leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* Add Firewall Rule Modal */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handleAddRuleSubmit}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">
                {lang === 'id' ? 'Tambah Aturan Port Firewall' : 'Add Firewall Port Rule'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddRuleOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Port / Rentang Port
              </label>
              <input
                type="text"
                required
                value={newRulePort}
                onChange={(e) => setNewRulePort(e.target.value)}
                placeholder="Contoh: 8080 atau 3000-3050"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Protokol</label>
                <select
                  value={newRuleProto}
                  onChange={(e) => setNewRuleProto(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ANY">ANY (TCP+UDP)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Aksi</label>
                <select
                  value={newRuleAction}
                  onChange={(e) => setNewRuleAction(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                >
                  <option value="ALLOW">ALLOW (Izinkan)</option>
                  <option value="DENY">DENY (Tolak)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Sumber IP (Source CIDR)
              </label>
              <input
                type="text"
                value={newRuleSource}
                onChange={(e) => setNewRuleSource(e.target.value)}
                placeholder="0.0.0.0/0 (Semua)"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Keterangan</label>
              <input
                type="text"
                value={newRuleDesc}
                onChange={(e) => setNewRuleDesc(e.target.value)}
                placeholder="Contoh: Custom Web App Port"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddRuleOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                Terapkan Aturan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Domain Proxy Modal */}
      {isAddDomainOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handleAddDomainSubmit}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">
                {lang === 'id' ? 'Konfigurasi Domain & Reverse Proxy' : 'Configure Domain Reverse Proxy'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddDomainOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nama Domain / Subdomain
              </label>
              <input
                type="text"
                required
                value={newDomainName}
                onChange={(e) => setNewDomainName(e.target.value)}
                placeholder="api.domainanda.com"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Port Target Internal (Localhost Port)
              </label>
              <input
                type="number"
                required
                value={newDomainTargetPort}
                onChange={(e) => setNewDomainTargetPort(Number(e.target.value))}
                placeholder="3000"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Nginx akan meneruskan trafik ke http://127.0.0.1:{newDomainTargetPort}
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={newDomainForceHttps}
                  onChange={(e) => setNewDomainForceHttps(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Otomatis terbitkan SSL Let's Encrypt & redirect ke HTTPS</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={newDomainWs}
                  onChange={(e) => setNewDomainWs(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Dukungan WebSocket upgrade headers (Upgrade $http_upgrade)</span>
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddDomainOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                Buat Virtual Host
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Cron Modal */}
      {isAddCronOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handleAddCronSubmit}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">
                {lang === 'id' ? 'Tambah Tugas Terjadwal (Crontab)' : 'Add Scheduled Cron Task'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCronOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Jadwal Eksekusi (Cron Syntax)
              </label>
              <input
                type="text"
                required
                value={newCronSchedule}
                onChange={(e) => setNewCronSchedule(e.target.value)}
                placeholder="0 3 * * *"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
              <div className="mt-1 flex gap-1.5 flex-wrap text-[11px] font-mono text-slate-400">
                <button
                  type="button"
                  onClick={() => setNewCronSchedule('*/15 * * * *')}
                  className="hover:text-emerald-400"
                >
                  15 Menit
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setNewCronSchedule('0 * * * *')}
                  className="hover:text-emerald-400"
                >
                  Setiap Jam
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setNewCronSchedule('0 0 * * *')}
                  className="hover:text-emerald-400"
                >
                  Harian 00:00
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Perintah Shell / Skrip (Bash Command)
              </label>
              <input
                type="text"
                required
                value={newCronCommand}
                onChange={(e) => setNewCronCommand(e.target.value)}
                placeholder="/usr/bin/python3 /app/job.py"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Keterangan</label>
              <input
                type="text"
                value={newCronDesc}
                onChange={(e) => setNewCronDesc(e.target.value)}
                placeholder="Pencadangan database otomatis"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddCronOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                Simpan Crontab
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
