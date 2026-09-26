export type IpClassification =
  | 'public'
  | 'private_rfc1918'
  | 'cgnat'
  | 'loopback'
  | 'link_local'
  | 'domain'
  | 'invalid';

export interface IpAnalysisResult {
  raw: string;
  ip: string;
  classification: IpClassification;
  isNat: boolean;
  labelId: string;
  labelEn: string;
  descriptionId: string;
  descriptionEn: string;
  badgeColor: 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
  suggestedActionId: string;
  suggestedActionEn: string;
  recommendedPort?: number;
}

/**
 * Checks whether an IPv4 address is in RFC1918 private range:
 * - 10.0.0.0 to 10.255.255.255 (10.0.0.0/8)
 * - 172.16.0.0 to 172.31.255.255 (172.16.0.0/12)
 * - 192.168.0.0 to 192.168.255.255 (192.168.0.0/16)
 */
export function isRfc1918Private(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255)) return false;

  // 10.0.0.0/8
  if (parts[0] === 10) return true;

  // 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;

  return false;
}

/**
 * Checks whether an IPv4 address is in RFC6598 CGNAT range:
 * - 100.64.0.0 to 100.127.255.255 (100.64.0.0/10)
 */
export function isCgNat(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255)) return false;

  return parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127;
}

/**
 * Analyzes an IP address or hostname to determine whether it's direct Public or behind NAT,
 * and provides instant resolution guidance.
 */
export function analyzeIpAddress(hostOrIp: string, port?: number): IpAnalysisResult {
  const clean = hostOrIp.trim();
  if (!clean) {
    return {
      raw: '',
      ip: '',
      classification: 'invalid',
      isNat: false,
      labelId: 'Alamat Kosong',
      labelEn: 'Empty Address',
      descriptionId: 'Masukkan alamat IP atau domain host VPS Anda.',
      descriptionEn: 'Enter your VPS IP or domain.',
      badgeColor: 'sky',
      suggestedActionId: 'Input IP atau Hostname',
      suggestedActionEn: 'Enter IP or Hostname',
    };
  }

  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;

  // Check if Domain FQDN
  if (!ipv4Regex.test(clean)) {
    if (clean.includes('.') && !clean.includes(' ') && clean.length >= 4) {
      return {
        raw: clean,
        ip: clean,
        classification: 'domain',
        isNat: false,
        labelId: 'Domain / FQDN Host',
        labelEn: 'Domain / FQDN Host',
        descriptionId: 'Hostname domain internet. Vela akan me-resolve DNS ke IP publik target.',
        descriptionEn: 'Internet domain name. DNS will resolve to target public IP.',
        badgeColor: 'sky',
        suggestedActionId: 'Koneksi Langsung atau Cloudflare Tunnel',
        suggestedActionEn: 'Direct Connection or Cloudflare Tunnel',
      };
    }
    return {
      raw: clean,
      ip: clean,
      classification: 'invalid',
      isNat: false,
      labelId: 'Format Tidak Valid',
      labelEn: 'Invalid Format',
      descriptionId: 'Format IP atau hostname tidak dikenali.',
      descriptionEn: 'Unrecognized IP or hostname format.',
      badgeColor: 'rose',
      suggestedActionId: 'Periksa kembali penulisan IP',
      suggestedActionEn: 'Check IP format',
    };
  }

  // Loopback (127.0.0.1)
  if (clean.startsWith('127.')) {
    return {
      raw: clean,
      ip: clean,
      classification: 'loopback',
      isNat: true,
      labelId: 'Localhost / Loopback',
      labelEn: 'Localhost / Loopback',
      descriptionId: 'Hanya bisa diakses dari internal mesin lokal itu sendiri.',
      descriptionEn: 'Accessible only within local machine.',
      badgeColor: 'rose',
      suggestedActionId: 'Gunakan Skrip Agen 1-Baris atau Cloudflare Quick Tunnel',
      suggestedActionEn: 'Use 1-Line Agent or Cloudflare Quick Tunnel',
    };
  }

  // Link-Local (169.254.x.x)
  if (clean.startsWith('169.254.')) {
    return {
      raw: clean,
      ip: clean,
      classification: 'link_local',
      isNat: true,
      labelId: 'Link-Local (APIPA)',
      labelEn: 'Link-Local (APIPA)',
      descriptionId: 'Alamat autokonfigurasi DHCP gagal, tidak memiliki rute internet.',
      descriptionEn: 'Auto-configuration address with no internet route.',
      badgeColor: 'rose',
      suggestedActionId: 'Gunakan Skrip Agen atau IP Publik dari Provider',
      suggestedActionEn: 'Use Agent Script or Provider Public IP',
    };
  }

  // CGNAT (100.64.0.0/10)
  if (isCgNat(clean)) {
    return {
      raw: clean,
      ip: clean,
      classification: 'cgnat',
      isNat: true,
      labelId: 'IP CGNAT (Carrier-Grade NAT)',
      labelEn: 'CGNAT (Carrier-Grade NAT)',
      descriptionId: 'IP berada di balik NAT Provider (RFC 6598). Port masuk tidak bisa diakses langsung dari internet.',
      descriptionEn: 'Behind provider carrier-grade NAT. Inbound ports are unreachable directly.',
      badgeColor: 'amber',
      suggestedActionId: 'Gunakan Resolver Otomatis: Outbound Reverse Tunnel atau Skrip Agen',
      suggestedActionEn: 'Use Auto-Resolver: Outbound Tunnel or Agent Script',
    };
  }

  // Private RFC 1918 (10.x, 172.16-31.x, 192.168.x)
  if (isRfc1918Private(clean)) {
    return {
      raw: clean,
      ip: clean,
      classification: 'private_rfc1918',
      isNat: true,
      labelId: 'IP Privat / LAN (Di Balik NAT)',
      labelEn: 'Private LAN IP (Behind NAT)',
      descriptionId: 'IP internal LAN (Proxmox/VMware/Router/AWS VPC). Tidak dapat di-ping langsung dari internet publik.',
      descriptionEn: 'Internal subnet IP. Cannot be reached directly from the public internet.',
      badgeColor: 'amber',
      suggestedActionId: 'Aktifkan Auto-Resolver: Jalankan Skrip Agen Otomatis untuk Bypass NAT',
      suggestedActionEn: 'Activate Auto-Resolver: Run Agent Script to Bypass NAT',
    };
  }

  // Check if NAT VPS with Custom Port Forwarding (e.g. port > 10000)
  if (port && port > 1024 && port !== 22) {
    return {
      raw: clean,
      ip: clean,
      classification: 'public',
      isNat: false,
      labelId: 'IP Publik (NAT Port-Forwarding)',
      labelEn: 'Public IP (NAT Port-Forwarding)',
      descriptionId: `IP publik dengan translasi port khusus (Port ${port}). Cocok untuk NAT VPS murah.`,
      descriptionEn: `Public IP with translated custom port (${port}). Standard for NAT VPS.`,
      badgeColor: 'purple',
      suggestedActionId: `Terhubung via Port Khusus: ${port}`,
      suggestedActionEn: `Connect via Translated Port: ${port}`,
      recommendedPort: port,
    };
  }

  // Regular Public IPv4
  return {
    raw: clean,
    ip: clean,
    classification: 'public',
    isNat: false,
    labelId: 'IP Publik Langsung (Direct)',
    labelEn: 'Direct Public IPv4',
    descriptionId: 'Alamat IP publik standar. Dapat dihubungi langsung via port SSH 22 atau web.',
    descriptionEn: 'Standard public IP. Direct connection over SSH 22 supported.',
    badgeColor: 'emerald',
    suggestedActionId: 'Koneksi Langsung (Universal SSH)',
    suggestedActionEn: 'Direct Connection (Universal SSH)',
  };
}
