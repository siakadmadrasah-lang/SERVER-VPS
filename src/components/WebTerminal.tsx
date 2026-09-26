import React, { useState, useEffect, useRef } from 'react';
import { useVps } from '../context/VpsContext';
import {
  Terminal as TerminalIcon,
  Maximize2,
  Minimize2,
  Copy,
  RotateCw,
  Power,
  Trash2,
  CornerDownLeft,
  Check,
  Zap,
  Key,
  AlertTriangle,
} from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'system' | 'error';
  text: string;
  hostname?: string;
}

export const WebTerminal: React.FC = () => {
  const {
    selectedServer,
    updateServerPower,
    lang,
    addToast,
    executeRemoteCommand,
    isRealSshActive,
    openEditServerModal,
  } = useVps();

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isExecutingReal, setIsExecutingReal] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initialWelcome = (srv: typeof selectedServer): TerminalLine[] => [
    {
      id: 'l-1',
      type: 'system',
      text: `Connected to ${srv?.hostname} (${srv?.ip}) on port ${srv?.connection.sshPort} via OpenSSH 9.6p1.`,
    },
    {
      id: 'l-2',
      type: 'system',
      text: `Welcome to ${srv?.os.distro} ${srv?.os.version} (${srv?.os.kernel})`,
    },
    {
      id: 'l-3',
      type: 'system',
      text: `System information as of ${new Date().toUTCString()}`,
    },
    {
      id: 'l-4',
      type: 'system',
      text: `System load: ${srv?.metrics.loadAvg.join(', ')}  |  Memory: ${srv?.metrics.ramPct}%  |  Disk: ${srv?.metrics.diskPct}% of ${srv?.specs.diskGb}GB`,
    },
    {
      id: 'l-5',
      type: 'system',
      text: `Type 'help' to view available interactive sysadmin commands or click shortcuts above.`,
    },
  ];

  const [lines, setLines] = useState<TerminalLine[]>(() => initialWelcome(selectedServer));

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll to bottom on new lines
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Reset lines if selectedServer changes
  useEffect(() => {
    setLines(initialWelcome(selectedServer));
    setIsConnected(true);
  }, [selectedServer?.id]);

  if (!selectedServer) return null;

  const handleCopyBuffer = () => {
    const text = lines.map((l) => (l.type === 'command' ? `root@${selectedServer.hostname}:~# ${l.text}` : l.text)).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast(
      lang === 'id' ? 'Output Disalin' : 'Output Copied',
      lang === 'id' ? 'Seluruh riwayat terminal telah disalin.' : 'Terminal buffer copied.',
      'info'
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Add command to history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const subCmd = parts.slice(1).join(' ').toLowerCase();

    if (mainCmd === 'clear') {
      setLines([]);
      setInputVal('');
      return;
    }

    // Add line for user input
    const cmdLine: TerminalLine = {
      id: Date.now().toString() + '-cmd',
      type: 'command',
      text: trimmed,
      hostname: selectedServer.hostname,
    };

    const hasSsh = Boolean(
      selectedServer.connection?.rootPassword || selectedServer.connection?.sshPrivateKey
    );

    // If real SSH credentials exist, execute over real SSH connection!
    if (hasSsh) {
      setLines((prev) => [...prev, cmdLine]);
      setInputVal('');
      setIsExecutingReal(true);

      executeRemoteCommand(trimmed, selectedServer.id)
        .then((res) => {
          const raw = res.stdout || res.stderr || (res.code === 0 ? '(Perintah selesai tanpa output)' : 'Perintah gagal dieksekusi.');
          const formatted: TerminalLine[] = raw.trim().split('\n').map((txt, idx) => ({
            id: Date.now() + '-' + idx,
            type: res.code === 0 ? 'output' : 'error',
            text: txt,
          }));
          setLines((prev) => [...prev, ...formatted]);
        })
        .catch((err) => {
          setLines((prev) => [
            ...prev,
            { id: Date.now() + '-err', type: 'error', text: `SSH Bridge Error: ${err.message}` },
          ]);
        })
        .finally(() => {
          setIsExecutingReal(false);
        });
      return;
    }

    let outputLines: string[] = [];

    switch (mainCmd) {
      case 'help':
        outputLines = [
          'VelaVPS Interactive Shell - Available Commands:',
          '  neofetch       - Display OS & system banner information',
          '  htop / top     - Interactive live process monitoring table',
          '  df -h          - Display disk partition utilization',
          '  free -m        - Display RAM and swap memory usage in MB',
          '  docker ps      - List running container instances',
          '  systemctl ...  - Inspect service status (nginx, docker, postgres)',
          '  ufw status     - Display firewall filtering rules',
          '  uptime         - Show server uptime and 1m/5m/15m load average',
          '  ip a           - Display network interfaces and IP addresses',
          '  whoami / id    - Current shell user privileges (root:uid=0)',
          '  reboot         - Send reboot signal to server',
          '  clear          - Clear terminal display buffer',
        ];
        break;

      case 'clear':
        setLines([]);
        setInputVal('');
        return;

      case 'neofetch':
      case 'fastfetch':
        outputLines = [
          `       _,met$$$$$gg.          root@${selectedServer.hostname}`,
          `    ,g$$$$$$$$$$$$$$$P.       ---------------------------------`,
          `  ,g$$P"        """Y$$.".     OS: ${selectedServer.os.distro} ${selectedServer.os.version} ${selectedServer.os.arch}`,
          ` ,$$P'              \`$$$.     Host: KVM Virtual Cloud Machine`,
          `',$$P       ,ggs.     \`$$b:   Kernel: ${selectedServer.os.kernel}`,
          `\`d$$'     ,$P"'   .    $$$    Uptime: ${selectedServer.metrics.uptime}`,
          ` $$P      d$'     ,    $$P    Packages: 984 (dpkg), 14 (snap), 6 (flatpak)`,
          ` $$:      $$.   -    ,d$$'    Shell: bash 5.2.21`,
          ` $$;      Y$b._   _,d$P'      CPU: QEMU Virtual CPU 2.80GHz (${selectedServer.specs.vcpu} vCPU)`,
          ` Y$$.    \`."Y$$$$P"'          Memory: ${Math.round((selectedServer.specs.ramGb * selectedServer.metrics.ramPct) / 100 * 1024)}MiB / ${selectedServer.specs.ramGb * 1024}MiB`,
          `  \`$$b      "-.__             Disk: ${((selectedServer.specs.diskGb * selectedServer.metrics.diskPct) / 100).toFixed(1)}GB / ${selectedServer.specs.diskGb}GB (${selectedServer.metrics.diskPct}%)`,
          `   \`Y$$                       IP: ${selectedServer.ip} (${selectedServer.region.city}, ${selectedServer.region.country})`,
        ];
        break;

      case 'htop':
      case 'top':
        outputLines = [
          `  1  [|||||||||||||               ${selectedServer.metrics.cpuPct}%]   Tasks: 78, 1 thr; 1 running`,
          `  2  [||||||||                    21.2%]   Load average: ${selectedServer.metrics.loadAvg.join(', ')}`,
          `  Mem[|||||||||||||||||||||       ${selectedServer.metrics.ramPct}%]   Uptime: ${selectedServer.metrics.uptime}`,
          `  Swp[||                          8.4%]`,
          ``,
          `  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command`,
          ` 1530 node       20   0  782M  240M 32100 S  8.6 14.2  2:00.44 node /app/server.js`,
          ` 1890 postgres   20   0 1420M  380M 45120 S  4.8 22.4  1:28.02 postgres: buffer pool`,
          ` 1104 www-data   20   0  180M   32M 14200 S  2.4  1.8  0:38.40 nginx: worker process`,
          ` 1420 root       20   0  620M   85M 28400 S  1.2  4.5  0:52.10 /usr/bin/dockerd`,
          ` 2012 redis      20   0   95M   45M  8100 S  0.8  3.1  0:18.50 /usr/bin/redis-server`,
          ` 2450 root       20   0   48M   22M  6200 S  0.2  1.1  0:04.15 fail2ban-server`,
          `    1 root       20   0   22M   10M  4200 S  0.1  0.2  0:14.20 /sbin/init splash`,
        ];
        break;

      case 'df':
        outputLines = [
          'Filesystem     Type      Size  Used Avail Use% Mounted on',
          `/dev/vda1      ${selectedServer.os.distro.toLowerCase() === 'alpine' ? 'ext4' : 'ext4'}     ${selectedServer.specs.diskGb}G   ${Math.round(selectedServer.specs.diskGb * selectedServer.metrics.diskPct / 100)}G   ${Math.round(selectedServer.specs.diskGb * (100 - selectedServer.metrics.diskPct) / 100)}G  ${selectedServer.metrics.diskPct}% /`,
          'tmpfs          tmpfs     790M  2.1M  788M   1% /run',
          '/dev/vda15     vfat      104M  6.2M   98M   6% /boot/efi',
          'tmpfs          tmpfs     3.9G     0  3.9G   0% /dev/shm',
        ];
        break;

      case 'free':
        outputLines = [
          '               total        used        free      shared  buff/cache   available',
          `Mem:            ${selectedServer.specs.ramGb * 1024}        ${Math.round(selectedServer.specs.ramGb * selectedServer.metrics.ramPct / 100 * 1024)}        ${Math.round(selectedServer.specs.ramGb * (100 - selectedServer.metrics.ramPct) / 100 * 1024)}          14        1420        ${Math.round(selectedServer.specs.ramGb * 0.45 * 1024)}`,
          'Swap:           4096         340        3756',
        ];
        break;

      case 'docker':
        if (subCmd.startsWith('ps')) {
          outputLines = [
            'CONTAINER ID   IMAGE                 COMMAND                  CREATED        STATUS        PORTS                    NAMES',
            'd9a4b1c8e2f0   portainer/portainer   "/portainer"             5 days ago     Up 5 days     0.0.0.0:9443->9443/tcp   portainer-ce',
            '4a8c1f9e2b0d   redis:7.2-alpine      "docker-entrypoint.s…"   2 weeks ago    Up 2 weeks    127.0.0.1:6379->6379     redis-cache',
            'f2e4a8b1c9d0   postgres:16-alpine    "docker-entrypoint.s…"   3 weeks ago    Up 3 weeks    0.0.0.0:5432->5432/tcp   postgres-primary',
          ];
        } else if (subCmd.startsWith('images')) {
          outputLines = [
            'REPOSITORY            TAG       IMAGE ID       CREATED        SIZE',
            'portainer/portainer   latest    2d8c91a0b3f8   2 weeks ago    298MB',
            'postgres              16        a0b3f88e1c64   3 weeks ago    412MB',
            'redis                 7.2       88e1c64a5927   4 weeks ago    138MB',
            'node                  22-slim   c64a5927c81d   1 month ago    210MB',
          ];
        } else {
          outputLines = [
            `Docker Engine - Community (Version 27.1.1)`,
            `Run 'docker ps' or 'docker images' to inspect runtime.`,
          ];
        }
        break;

      case 'systemctl':
        if (subCmd.includes('status')) {
          const service = subCmd.replace('status', '').trim() || 'nginx';
          outputLines = [
            `● ${service}.service - The ${service} service daemon`,
            `     Loaded: loaded (/lib/systemd/system/${service}.service; enabled; vendor preset: enabled)`,
            `     Active: active (running) since Sun 2026-08-12 14:20:00 UTC; 42 days ago`,
            `   Main PID: 1104 (${service})`,
            `      Tasks: 2 (limit: 9482)`,
            `     Memory: 42.5M`,
            `        CPU: 18.291s`,
            `     CGroup: /system.slice/${service}.service`,
            `             └─1104 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;`,
          ];
        } else if (subCmd.includes('restart')) {
          const service = subCmd.replace('restart', '').trim();
          outputLines = [`Job for ${service}.service completed. Status: active (running).`];
        } else {
          outputLines = [`systemd 255.4-1ubuntu8 - Unit active state: 104 running units.`];
        }
        break;

      case 'ufw':
        outputLines = [
          'Status: active',
          '',
          'To                         Action      From',
          '--                         ------      ----',
          '22/tcp                     ALLOW       Anywhere',
          '80/tcp                     ALLOW       Anywhere',
          '443/tcp                    ALLOW       Anywhere',
          '5432/tcp                   ALLOW       103.147.154.21',
          '9443/tcp                   ALLOW       180.252.164.0/24',
          '6379/tcp                   DENY        Anywhere',
        ];
        break;

      case 'uptime':
        outputLines = [
          ` 14:24:10 up ${selectedServer.metrics.uptime}, 1 user,  load average: ${selectedServer.metrics.loadAvg.join(', ')}`,
        ];
        break;

      case 'ip':
        outputLines = [
          '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000',
          '    inet 127.0.0.1/8 scope host lo',
          `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000`,
          `    inet ${selectedServer.ip}/24 brd 128.199.204.255 scope global eth0`,
          `    inet6 ${selectedServer.ipv6}/64 scope global dynamic`,
        ];
        break;

      case 'whoami':
        outputLines = ['root'];
        break;

      case 'pwd':
        outputLines = ['/root'];
        break;

      case 'ls':
        outputLines = [
          'total 48',
          'drwx------  6 root root 4096 Sep 20 14:20 .',
          'drwxr-xr-x 19 root root 4096 Aug 12 14:20 ..',
          '-rw-r--r--  1 root root 3106 Apr 22  2024 .bashrc',
          'drwxr-xr-x  3 root root 4096 Sep 15 11:30 docker-stacks',
          '-rw-r--r--  1 root root  161 Aug 12 14:25 .profile',
          'drwx------  2 root root 4096 Aug 12 14:22 .ssh',
          'drwxr-xr-x  2 root root 4096 Sep 10 09:15 scripts',
        ];
        break;

      case 'reboot':
        outputLines = ['Broadcast message from root@system: The system is going down for reboot NOW!'];
        updateServerPower(selectedServer.id, 'reboot');
        break;

      default:
        outputLines = [
          `bash: ${mainCmd}: command completed with exit status 0 (simulated).`,
          `For interactive shell help, type 'help'.`,
        ];
        break;
    }

    const newLogs: TerminalLine[] = [
      cmdLine,
      ...outputLines.map((line, idx) => ({
        id: Date.now().toString() + '-out-' + idx,
        type: 'output' as const,
        text: line,
      })),
    ];

    setLines((prev) => [...prev, ...newLogs]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx < history.length) {
        setHistoryIdx(nextIdx);
        setInputVal(history[history.length - 1 - nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(history[history.length - 1 - nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div
      className={`flex flex-col rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl transition-all ${
        isMaximized
          ? 'fixed inset-4 z-50 rounded-2xl'
          : 'relative min-h-[580px] w-full'
      }`}
    >
      {/* Terminal Title Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
        {/* Left: Window Controls & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">root@{selectedServer.hostname}</span>
            <span className="text-slate-600">:</span>
            <span className="text-slate-400">~ (tty1)</span>
          </div>

          {selectedServer.isRealSshConnected || selectedServer.connection?.rootPassword ? (
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live SSH Fisik ({selectedServer.ip})</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => openEditServerModal(selectedServer)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-sans transition-colors cursor-pointer"
              title="Klik untuk memasukkan password root SSH asli"
            >
              <Key className="w-2.5 h-2.5" />
              <span>Mode Simulasi (Klik untuk Sambungkan SSH Asli)</span>
            </button>
          )}

          {isExecutingReal && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-sans animate-pulse">
              <RotateCw className="w-3 h-3 animate-spin" />
              <span>Mengeksekusi...</span>
            </span>
          )}
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyBuffer}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors font-mono"
            title="Salin seluruh isi terminal"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Disalin' : 'Salin Log'}</span>
          </button>

          <button
            onClick={() => setLines([])}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Bersihkan layar (clear)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title={isMaximized ? 'Kecilkan' : 'Perbesar'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Command Shortcuts Toolbar */}
      <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px] font-mono text-slate-400">
        <span className="text-slate-600 select-none">Pintasan:</span>
        {['neofetch', 'htop', 'df -h', 'free -m', 'docker ps', 'systemctl status nginx', 'ufw status', 'uptime', 'ip a'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => executeCommand(cmd)}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 hover:text-emerald-300 border border-slate-800 transition-colors whitespace-nowrap"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Viewport */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex-1 p-4 font-mono text-xs text-slate-200 overflow-y-auto space-y-1 select-text cursor-text"
      >
        {lines.map((line) => {
          if (line.type === 'command') {
            return (
              <div key={line.id} className="flex items-center gap-2 pt-1">
                <span className="text-emerald-400 select-none font-semibold">
                  root@{line.hostname || selectedServer.hostname}:~#
                </span>
                <span className="text-white font-medium">{line.text}</span>
              </div>
            );
          } else if (line.type === 'system') {
            return (
              <div key={line.id} className="text-slate-400 leading-relaxed">
                {line.text}
              </div>
            );
          } else if (line.type === 'error') {
            return (
              <div key={line.id} className="text-rose-400 leading-relaxed">
                {line.text}
              </div>
            );
          } else {
            return (
              <div key={line.id} className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {line.text}
              </div>
            );
          }
        })}

        {/* Active Command Prompt */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-emerald-400 select-none font-semibold">
            root@{selectedServer.hostname}:~#
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none caret-emerald-400 border-none p-0"
            spellCheck={false}
          />
        </div>

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
