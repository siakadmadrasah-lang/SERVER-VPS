export type ServerStatus = 'running' | 'stopped' | 'restarting' | 'reinstalling' | 'maintenance';

export interface VpsAuthSession {
  hostname: string;
  username: string;
  sshPort: number;
  serverId: string;
  serverIp: string;
  isLoggedIn: boolean;
  loggedInAt: string;
}

export interface ActivePanelInfo {
  id: string; // e.g. 'aapanel', 'cyberpanel', 'cloudpanel', 'fastpanel', 'hestiacp', 'cpanel'
  name: string;
  version: string;
  port: number;
  status: 'running' | 'stopped' | 'not_installed';
  adminPath?: string;
  adminUrl?: string;
  serviceName?: string;
  memoryUsageMb?: number;
  cpuUsagePct?: number;
  detectedAt?: string;
  detectionSource?: 'live_probe' | 'systemd' | 'port_scan' | 'manual';
  credentials?: {
    user: string;
    pass: string;
    securityEntry?: string;
  };
}

export interface CloudflareTunnelState {
  serverId: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  mode: 'quick_tunnel' | 'zero_trust' | 'dns_proxy';
  tunnelUrl?: string;
  targetPort: number;
  tunnelToken?: string;
  domain?: string;
  connectedAt?: string;
  metrics?: {
    requestsTotal: number;
    activeWebSockets: number;
    latencyMs: number;
  };
}

export interface VpsServer {
  id: string;
  name: string;
  hostname: string;
  ip: string;
  ipv6: string;
  provider: string; // e.g. DigitalOcean, Hetzner, Biznet, AWS, Vultr
  region: {
    code: string;
    city: string;
    country: string;
    flag: string;
  };
  status: ServerStatus;
  os: {
    distro: string;
    version: string;
    codename?: string;
    kernel: string;
    arch: string;
    icon: string;
    installedAt: string;
    verifiedReal?: boolean;
    lastVerifiedAt?: string;
    osReleaseRaw?: string;
  };
  activePanel?: ActivePanelInfo;
  specs: {
    vcpu: number;
    ramGb: number;
    diskGb: number;
    diskType: string;
    bandwidthTb: number;
    usedBandwidthGb: number;
  };
  metrics: {
    cpuPct: number;
    ramPct: number;
    diskPct: number;
    netInKb: number;
    netOutKb: number;
    uptime: string;
    loadAvg: [number, number, number];
  };
  connection: {
    sshPort: number;
    username: string;
    rootPassword?: string;
    sshPrivateKey?: string;
    authType?: 'password' | 'key';
    sshKeyFingerprint?: string;
    lastLoginIp: string;
    lastLoginTime: string;
    isRealSshVerified?: boolean;
  };
  networkType?: 'public' | 'cgnat' | 'private_nat' | 'tunnel';
  internalIp?: string;
  isRealSshConnected?: boolean;
  realProbeData?: {
    connectedAt: string;
    pingMs: number;
    actualRamMb: number;
    actualUsedRamMb: number;
    actualDiskGb: number;
    actualUsedDiskGb: number;
    rawOsPretty: string;
  };
  tags: string[];
}

export interface NatResolutionOption {
  id: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  command?: string;
  type: 'agent' | 'tunnel' | 'port_mapping';
}

export interface NetworkDetectionResult {
  host: string;
  port: number;
  classification: 'public' | 'private_rfc1918' | 'cgnat' | 'loopback' | 'domain';
  isNat: boolean;
  natReason: string;
  portReachable: boolean;
  latencyMs: number | null;
  reachError: string | null;
  sessionToken: string;
  agentCommand: string;
  resolutions: NatResolutionOption[];
}

export interface OsDistribution {
  id: string;
  name: string;
  logo: string;
  family: 'debian' | 'rhel' | 'alpine' | 'arch' | 'windows';
  versions: {
    version: string;
    label: string;
    isLts?: boolean;
    defaultKernel: string;
  }[];
  description: string;
  recommendedRamGb: number;
  recommendedDiskGb: number;
}

export interface SoftwareApp {
  id: string;
  name: string;
  category: 'webserver' | 'database' | 'runtime' | 'container' | 'security' | 'tool' | 'panel';
  version: string;
  availableVersions: string[];
  status: 'installed' | 'not_installed' | 'installing' | 'error';
  port?: number;
  serviceName?: string;
  description: string;
  descriptionId: string;
  autoStart: boolean;
  installedVersion?: string;
  memoryUsageMb?: number;
  adminPath?: string;
  adminUser?: string;
  adminPass?: string;
  defaultCredentials?: {
    user: string;
    pass: string;
    securityEntry?: string;
    fullUrl?: string;
  };
  installCommand?: string;
}

export interface UbuntuBypassMethod {
  id: string;
  title: string;
  titleId: string;
  description: string;
  descriptionId: string;
  recommendationLevel: 'recommended' | 'alternative' | 'rescue';
  estimatedMinutes: number;
  bashCommand: string;
  features: string[];
}

export interface FirewallRule {
  id: string;
  port: string;
  protocol: 'TCP' | 'UDP' | 'ANY';
  action: 'ALLOW' | 'DENY';
  source: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export interface BannedIp {
  ip: string;
  jail: string;
  bannedAt: string;
  attempts: number;
  country: string;
}

export interface DomainProxy {
  id: string;
  domain: string;
  targetPort: number;
  sslStatus: 'active' | 'generating' | 'expired' | 'none';
  sslExpiry?: string;
  forceHttps: boolean;
  websocket: boolean;
  active: boolean;
  createdAt: string;
}

export interface CronTask {
  id: string;
  schedule: string;
  humanSchedule: string;
  command: string;
  description: string;
  enabled: boolean;
  lastRun?: string;
  lastStatus?: 'success' | 'failed';
}

export interface SystemConfigFile {
  id: string;
  path: string;
  title: string;
  category: 'nginx' | 'ssh' | 'docker' | 'system' | 'mysql';
  serviceToReload: string;
  content: string;
}

export interface SystemProcess {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  time: string;
  command: string;
}

export interface ServerSnapshot {
  id: string;
  serverId: string;
  name: string;
  sizeGb: number;
  createdAt: string;
  status: 'ready' | 'creating' | 'restoring';
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface VpsConnectionTestResult {
  pingMs: number;
  sshHandshake: boolean;
  detectedDistro: string;
  detectedKernel: string;
  detectedRamMb: number;
  detectedDiskGb: number;
  detectedCores: number;
  ipGeo: {
    city: string;
    country: string;
    flag: string;
    isp: string;
  };
}

export interface DomainDnsCheckResult {
  domain: string;
  resolvedIp?: string;
  isMatch: boolean;
  targetIp: string;
  recordType: 'A' | 'CNAME';
  ttl: number;
  nameserver: string;
  sslReady: boolean;
}
