import React, { useState, useEffect } from 'react';
import { useVps } from '../context/VpsContext';
import { NetworkDetectionResult } from '../types/vps';
import { analyzeIpAddress } from '../utils/networkUtils';
import {
  Globe,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  RotateCw,
  Terminal,
  ArrowRight,
  HelpCircle,
  Network,
  CloudLightning,
} from 'lucide-react';

interface NetworkDetectorCardProps {
  ip: string;
  port: number;
  onResolvedSuccess?: (server: any) => void;
  compact?: boolean;
}

export const NetworkDetectorCard: React.FC<NetworkDetectorCardProps> = ({
  ip,
  port = 22,
  onResolvedSuccess,
  compact = false,
}) => {
  const { detectNetwork, pollAgentRegistration, registerNodeFromAgent, lang, addToast } = useVps();

  const [detection, setDetection] = useState<NetworkDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeResolutionTab, setActiveResolutionTab] = useState<'agent' | 'tunnel' | 'port'>('agent');

  // Real-time instantaneous client-side analysis
  const quickAnalysis = analyzeIpAddress(ip, port);

  // Auto-detect when IP changes (debounced)
  useEffect(() => {
    if (!ip.trim() || quickAnalysis.classification === 'invalid') {
      setDetection(null);
      setIsListening(false);
      return;
    }

    const timer = setTimeout(() => {
      runDetection();
    }, 600);

    return () => clearTimeout(timer);
  }, [ip, port]);

  // Listener polling effect when user clicks "Pantau Koneksi Otomatis"
  useEffect(() => {
    if (!isListening || !detection?.sessionToken) return;

    const stopPolling = pollAgentRegistration(detection.sessionToken, (session) => {
      setIsListening(false);
      const newServer = registerNodeFromAgent(session);
      if (onResolvedSuccess) {
        onResolvedSuccess(newServer);
      }
    });

    return () => {
      stopPolling();
    };
  }, [isListening, detection?.sessionToken]);

  const runDetection = async () => {
    if (!ip.trim()) return;
    setIsDetecting(true);
    try {
      const result = await detectNetwork(ip, port);
      setDetection(result);
    } catch {
      // handled inside detectNetwork
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    addToast(
      lang === 'id' ? 'Perintah Resolver Disalin' : 'Resolver Command Copied',
      lang === 'id' ? 'Jalankan di terminal SSH VPS Anda untuk koneksi otomatis.' : 'Run in VPS terminal to auto-connect.',
      'info'
    );
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  if (!ip.trim()) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 transition-all">
      {/* Real-time IP Header Classification Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs font-semibold ${
              quickAnalysis.badgeColor === 'emerald'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : quickAnalysis.badgeColor === 'amber'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                : quickAnalysis.badgeColor === 'purple'
                ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                : 'border-sky-500/30 bg-sky-500/10 text-sky-400'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-white">
                {lang === 'id' ? quickAnalysis.labelId : quickAnalysis.labelEn}
              </span>
              {quickAnalysis.isNat && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                  NAT DETECTED
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'id' ? quickAnalysis.descriptionId : quickAnalysis.descriptionEn}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runDetection}
          disabled={isDetecting}
          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          {isDetecting ? (
            <RotateCw className="h-3 w-3 animate-spin text-emerald-400" />
          ) : (
            <Zap className="h-3 w-3 text-emerald-400" />
          )}
          <span>{isDetecting ? (lang === 'id' ? 'Mendeteksi...' : 'Probing...') : (lang === 'id' ? 'Uji Jaringan' : 'Probe Net')}</span>
        </button>
      </div>

      {/* When NAT is detected: Show Automatic Resolution Assistant */}
      {(quickAnalysis.isNat || (detection && detection.isNat)) && (
        <div className="animate-in fade-in space-y-3 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="flex-1">
              <span className="block text-xs font-semibold text-amber-300">
                {lang === 'id' ? 'Penyelesaian Otomatis (Auto-Resolver NAT):' : 'Automated NAT Resolver:'}
              </span>
              <p className="text-[11px] text-slate-300">
                {lang === 'id'
                  ? 'Karena IP ini berada di balik NAT/LAN atau CGNAT, koneksi langsung dari browser/internet publik terhalang. VelaVPS menyediakan solusi otomatis agar node langsung terhubung:'
                  : 'Because this host is behind NAT/CGNAT, direct inbound SSH is blocked. Vela provides automated resolvers:'}
              </p>
            </div>
          </div>

          {/* Solution Tabs */}
          <div className="flex gap-1.5 border-b border-amber-500/20 pb-2 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveResolutionTab('agent')}
              className={`rounded px-2.5 py-1 font-semibold transition-colors ${
                activeResolutionTab === 'agent'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. {lang === 'id' ? 'Skrip Agen Otomatis (1-Klik)' : 'Auto-Agent (1-Click)'}
            </button>
            <button
              type="button"
              onClick={() => setActiveResolutionTab('tunnel')}
              className={`rounded px-2.5 py-1 font-semibold transition-colors ${
                activeResolutionTab === 'tunnel'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Cloudflare Tunnel
            </button>
            <button
              type="button"
              onClick={() => setActiveResolutionTab('port')}
              className={`rounded px-2.5 py-1 font-semibold transition-colors ${
                activeResolutionTab === 'port'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Port Mapping (NAT VPS)
            </button>
          </div>

          {/* TAB 1: Auto Agent (Recommended) */}
          {activeResolutionTab === 'agent' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400">
                  {lang === 'id' ? 'Jalankan perintah ini di VPS Anda:' : 'Run this command on your VPS shell:'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCommand(detection?.agentCommand || '')}
                  className="flex items-center gap-1 font-mono text-emerald-400 hover:text-emerald-300"
                >
                  {copiedCmd ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCmd ? (lang === 'id' ? 'Tersalin' : 'Copied') : (lang === 'id' ? 'Salin' : 'Copy')}</span>
                </button>
              </div>

              <div className="relative rounded bg-slate-900/90 p-2 font-mono text-[11px] text-emerald-300 break-all select-all border border-slate-800">
                {detection?.agentCommand || `curl -fsSL https://.../api/vps/nat-agent?token=vla_auto | sudo bash`}
              </div>

              {/* Real-time Listening Pulse Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {isListening ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      </span>
                      {lang === 'id' ? 'Mendengarkan pendaftaran dari VPS...' : 'Listening for VPS agent handshake...'}
                    </span>
                  ) : (
                    lang === 'id' ? 'Setelah skrip dijalankan, node akan tersambung otomatis.' : 'Node connects automatically once executed.'
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => setIsListening(!isListening)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
                    isListening
                      ? 'border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
                      : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                  }`}
                >
                  {isListening ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <CloudLightning className="h-3.5 w-3.5" />}
                  <span>
                    {isListening
                      ? (lang === 'id' ? 'Sedang Memantau...' : 'Listening...')
                      : (lang === 'id' ? 'Pantau Sambungan Otomatis' : 'Start Auto-Connect Listener')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Cloudflare Tunnel */}
          {activeResolutionTab === 'tunnel' && (
            <div className="space-y-2 text-[11px] text-slate-300">
              <p>
                {lang === 'id'
                  ? 'Gunakan Cloudflare Tunnel untuk menghubungkan server yang berada di balik router rumahan / CGNAT tanpa perlu membuka port sama sekali di router.'
                  : 'Bypass any router NAT or firewall using secure outbound Cloudflare Tunnels.'}
              </p>
              <div className="rounded bg-slate-900 p-2 font-mono text-[11px] text-sky-300 border border-slate-800">
                cloudflared tunnel --url ssh://localhost:22
              </div>
            </div>
          )}

          {/* TAB 3: NAT Port Forwarding */}
          {activeResolutionTab === 'port' && (
            <div className="space-y-2 text-[11px] text-slate-300">
              <p>
                {lang === 'id'
                  ? 'Jika Anda membeli paket NAT VPS (seperti di Gullo, LowEndSpirit, Inception), provider biasanya memberikan satu IP Publik bersama dan meneruskan port acak (misal port 22045) ke port 22 internal VPS Anda.'
                  : 'If using a NAT VPS provider, enter the provider public gateway IP and your mapped high SSH port.'}
              </p>
              <div className="flex items-center gap-2 font-mono text-amber-300">
                <span>Contoh:</span>
                <span className="rounded bg-slate-900 px-2 py-1 text-slate-200">IP: 194.36.89.12 · Port: 22045</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* When IP is Public & Reachable */}
      {!quickAnalysis.isNat && detection && detection.portReachable && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>
            {lang === 'id'
              ? `Jaringan publik langsung terverifikasi! Port ${port} merespon dalam ${detection.latencyMs || 15}ms.`
              : `Direct public network verified! Port ${port} is responsive (${detection.latencyMs || 15}ms latency).`}
          </span>
        </div>
      )}
    </div>
  );
};
