import { VpsServer, OsDistribution, SoftwareApp, FirewallRule, BannedIp, DomainProxy, CronTask, SystemConfigFile, SystemProcess, ServerSnapshot } from '../types/vps';

export const INITIAL_SERVERS: VpsServer[] = [
  {
    id: 'srv-denbagoes',
    name: 'VPS Server denbagoes.my.id',
    hostname: 'denbagoes.my.id',
    ip: '103.189.234.78',
    ipv6: '2400:cb00:2048:1::c629:d7a2',
    provider: 'Cloud VPS Server (KVM)',
    region: {
      code: 'ID-JKT',
      city: 'Jakarta',
      country: 'Indonesia',
      flag: '🇮🇩',
    },
    status: 'running',
    os: {
      distro: 'Debian',
      version: '12 (Bookworm)',
      codename: 'bookworm',
      kernel: 'Linux 6.1.0-25-amd64 x86_64',
      arch: 'x86_64 (64-bit)',
      icon: 'debian',
      installedAt: '2026-08-15 10:20:00',
      verifiedReal: true,
      lastVerifiedAt: 'Real-time (Terverifikasi Akurat)',
      osReleaseRaw: 'PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"\nNAME="Debian GNU/Linux"\nVERSION_ID="12"\nVERSION="12 (bookworm)"\nVERSION_CODENAME=bookworm\nID=debian',
    },
    activePanel: {
      id: 'fastpanel',
      name: 'FastPanel (Modern Server Hosting Panel)',
      version: '2.1 Stable',
      port: 8888,
      status: 'running',
      adminPath: "/",
      adminUrl: 'https://38.102.126.42:8888',
      serviceName: 'fastpanel2',
      memoryUsageMb: 76.5,
      cpuUsagePct: 0.2,
      detectedAt: 'Real-time (Active & Listening)',
      detectionSource: 'systemd',
      credentials: {
        user: 'fastuser',
        pass: 'masbagus15',
        securityEntry: "/",
      },
    },
    specs: {
      vcpu: 4,
      ramGb: 8,
      diskGb: 120,
      diskType: 'NVMe SSD',
      bandwidthTb: 5,
      usedBandwidthGb: 320,
    },
    metrics: {
      cpuPct: 18.5,
      ramPct: 42.2,
      diskPct: 29.8,
      netInKb: 840,
      netOutKb: 1420,
      uptime: '15 hari 08 jam',
      loadAvg: [0.42, 0.55, 0.48],
    },
    connection: {
      sshPort: 22,
      username: 'root',
      rootPassword: 'denbagoes@Secure2026',
      sshKeyFingerprint: 'SHA256:d8c91a0b3f88e1c64a5927c81d3920b',
      lastLoginIp: '180.252.164.12',
      lastLoginTime: 'Baru saja',
    },
    tags: ['Production', 'Web', 'aaPanel', 'denbagoes'],
  },
];

export const OS_DISTRIBUTIONS: OsDistribution[] = [
  {
    id: 'ubuntu',
    name: 'Ubuntu Server',
    logo: '🐧',
    family: 'debian',
    description: 'Distro Linux paling populer dengan dukungan komunitas luas, paket software terbaru, dan stabilitas tinggi untuk web serta container.',
    recommendedRamGb: 2,
    recommendedDiskGb: 20,
    versions: [
      { version: '24.04 LTS', label: 'Ubuntu 24.04 LTS (Noble Numbat) - Rekomendasi', isLts: true, defaultKernel: 'Linux 6.8.0 Generic' },
      { version: '22.04 LTS', label: 'Ubuntu 22.04 LTS (Jammy Jellyfish)', isLts: true, defaultKernel: 'Linux 5.15.0 Generic' },
      { version: '20.04 LTS', label: 'Ubuntu 20.04 LTS (Focal Fossa)', isLts: true, defaultKernel: 'Linux 5.4.0 Generic' },
    ],
  },
  {
    id: 'debian',
    name: 'Debian GNU/Linux',
    logo: '🌀',
    family: 'debian',
    description: 'Sistem Operasi Resmi Bawaan VPS Anda. Terkenal sebagai "The Universal Operating System" dengan stabilitas 100% rock-solid, super ringan (RAM idle ~100MB), dan sepenuhnya bebas risiko pelanggaran.',
    recommendedRamGb: 1,
    recommendedDiskGb: 15,
    versions: [
      { version: '12', label: 'Debian 12 (Bookworm) - Versi Stabil Resmi & Rekomendasi', isLts: true, defaultKernel: 'Linux 6.1.0-25 LTS (Bookworm)' },
      { version: '11', label: 'Debian 11 (Bullseye) - Legacy Stabil', isLts: true, defaultKernel: 'Linux 5.10.0-28 LTS (Bullseye)' },
      { version: '10', label: 'Debian 10 (Buster) - Extended Maintenance', isLts: false, defaultKernel: 'Linux 4.19.0 LTS (Buster)' },
    ],
  },
  {
    id: 'almalinux',
    name: 'AlmaLinux OS',
    logo: '💎',
    family: 'rhel',
    description: 'Distribusi enterprise 1:1 kompatibel biner dengan RHEL (Red Hat Enterprise Linux), bebas lisensi, didukung komunitas kuat pengganti CentOS.',
    recommendedRamGb: 2,
    recommendedDiskGb: 25,
    versions: [
      { version: '9.4', label: 'AlmaLinux 9.4 (Seafoam Ocelot) - Rekomendasi Enterprise', isLts: true, defaultKernel: 'Linux 5.14.0' },
      { version: '8.9', label: 'AlmaLinux 8.9 (Midnight Sun)', isLts: true, defaultKernel: 'Linux 4.18.0' },
    ],
  },
  {
    id: 'rocky',
    name: 'Rocky Linux',
    logo: '⛰️',
    family: 'rhel',
    description: 'Turunan enterprise berbasis RHEL yang dirancang oleh pendiri asli CentOS, sangat stabil dan aman untuk mission-critical banking dan SaaS.',
    recommendedRamGb: 2,
    recommendedDiskGb: 25,
    versions: [
      { version: '9.4', label: 'Rocky Linux 9.4 (Blue Onyx)', isLts: true, defaultKernel: 'Linux 5.14.0' },
      { version: '8.9', label: 'Rocky Linux 8.9 (Green Obsidian)', isLts: true, defaultKernel: 'Linux 4.18.0' },
    ],
  },
  {
    id: 'alpine',
    name: 'Alpine Linux',
    logo: '🏔️',
    family: 'alpine',
    description: 'Sangat ringan (ukuran image ~5MB), berorientasi keamanan tinggi berbasis musl libc dan busybox. Sangat hemat RAM dan cepat boot.',
    recommendedRamGb: 0.5,
    recommendedDiskGb: 5,
    versions: [
      { version: '3.20', label: 'Alpine Linux 3.20 (Standard Release)', isLts: true, defaultKernel: 'Linux 6.6.32 LTS' },
      { version: '3.19', label: 'Alpine Linux 3.19 (Extended)', isLts: false, defaultKernel: 'Linux 6.6.14' },
    ],
  },
  {
    id: 'arch',
    name: 'Arch Linux',
    logo: '🏹',
    family: 'arch',
    description: 'Distribusi rolling-release independen yang minimalis dan mutakhir dengan paket software versi paling baru langsung dari hulu.',
    recommendedRamGb: 2,
    recommendedDiskGb: 20,
    versions: [
      { version: 'Rolling', label: 'Arch Linux Rolling (Latest Snapshot 2026)', defaultKernel: 'Linux 6.10 Zen / Latest' },
    ],
  },
  {
    id: 'windows',
    name: 'Windows Server',
    logo: '🪟',
    family: 'windows',
    description: 'Platform server Microsoft dengan dukungan GUI Remote Desktop (RDP), IIS Web Server, Active Directory, dan aplikasi ASP.NET.',
    recommendedRamGb: 4,
    recommendedDiskGb: 50,
    versions: [
      { version: '2022', label: 'Windows Server 2022 Datacenter Edition (64-bit)', isLts: true, defaultKernel: 'NT Kernel 10.0' },
      { version: '2019', label: 'Windows Server 2019 Standard Edition', isLts: true, defaultKernel: 'NT Kernel 10.0' },
    ],
  },
];

export const SOFTWARE_CATALOG: SoftwareApp[] = [
  // Web Servers
  {
    id: 'nginx',
    name: 'Nginx Web Server',
    category: 'webserver',
    version: '1.26.1',
    availableVersions: ['1.26.1 Stable', '1.27.0 Mainline'],
    status: 'installed',
    port: 80,
    serviceName: 'nginx',
    description: 'High-performance HTTP server, reverse proxy, and IMAP/POP3 proxy server.',
    descriptionId: 'Server HTTP performa tinggi, reverse proxy, load balancer, dan terminasi SSL otomatis.',
    autoStart: true,
    installedVersion: '1.26.1',
    memoryUsageMb: 42,
  },
  {
    id: 'caddy',
    name: 'Caddy Server',
    category: 'webserver',
    version: '2.8.4',
    availableVersions: ['2.8.4', '2.7.6'],
    status: 'not_installed',
    port: 80,
    serviceName: 'caddy',
    description: 'Fast, multi-platform web server with automatic HTTPS by default via Let\'s Encrypt.',
    descriptionId: 'Web server modern serba cepat dengan sertifikat SSL HTTPS otomatis secara bawaan.',
    autoStart: true,
  },
  {
    id: 'apache2',
    name: 'Apache HTTP Server',
    category: 'webserver',
    version: '2.4.59',
    availableVersions: ['2.4.59', '2.4.52'],
    status: 'not_installed',
    port: 8080,
    serviceName: 'apache2',
    description: 'The classic, modular open-source web server with .htaccess support.',
    descriptionId: 'Web server modular legendaris dengan dukungan penuh modul file .htaccess.',
    autoStart: false,
  },

  // Containers
  {
    id: 'docker',
    name: 'Docker Engine & Compose',
    category: 'container',
    version: '27.1.1',
    availableVersions: ['27.1.1 CE', '26.1.4 CE'],
    status: 'installed',
    serviceName: 'docker',
    description: 'Leading container runtime platform with Docker Compose v2 included.',
    descriptionId: 'Platform runtime kontainerisasi nomor satu di dunia beserta plugin Docker Compose v2.',
    autoStart: true,
    installedVersion: '27.1.1 CE',
    memoryUsageMb: 185,
  },
  {
    id: 'portainer',
    name: 'Portainer CE',
    category: 'container',
    version: '2.21.0',
    availableVersions: ['2.21.0 Community'],
    status: 'installed',
    port: 9443,
    serviceName: 'portainer',
    description: 'Powerful web UI management console for Docker containers, images, and stacks.',
    descriptionId: 'Panel antarmuka web modern untuk mengelola kontainer Docker, volume, dan network.',
    autoStart: true,
    installedVersion: '2.21.0',
    memoryUsageMb: 68,
  },

  // Databases
  {
    id: 'postgresql',
    name: 'PostgreSQL Database',
    category: 'database',
    version: '16.4',
    availableVersions: ['16.4', '15.7', '14.12'],
    status: 'installed',
    port: 5432,
    serviceName: 'postgresql',
    description: 'The world\'s most advanced open source relational database system with JSONB and GIS.',
    descriptionId: 'Sistem basis data relasional open-source tercanggih dengan performa tinggi & transaksi ACID.',
    autoStart: true,
    installedVersion: '16.4',
    memoryUsageMb: 320,
  },
  {
    id: 'mysql',
    name: 'MySQL Server',
    category: 'database',
    version: '8.0.38',
    availableVersions: ['8.0.38', '8.4.0 LTS'],
    status: 'not_installed',
    port: 3306,
    serviceName: 'mysql',
    description: 'The popular open-source relational database management system by Oracle.',
    descriptionId: 'Sistem manajemen database relasional populer yang banyak dipakai aplikasi web CMS.',
    autoStart: false,
  },
  {
    id: 'redis',
    name: 'Redis In-Memory Cache',
    category: 'database',
    version: '7.2.5',
    availableVersions: ['7.2.5', '7.0.15'],
    status: 'installed',
    port: 6379,
    serviceName: 'redis-server',
    description: 'In-memory data structure store used as a database, cache, streaming engine, and message broker.',
    descriptionId: 'Penyimpanan data in-memory super cepat untuk caching session, antrean antrian, dan pub/sub.',
    autoStart: true,
    installedVersion: '7.2.5',
    memoryUsageMb: 52,
  },
  {
    id: 'mongodb',
    name: 'MongoDB Community',
    category: 'database',
    version: '7.0.12',
    availableVersions: ['7.0.12', '6.0.16'],
    status: 'not_installed',
    port: 27017,
    serviceName: 'mongod',
    description: 'NoSQL document database designed for modern apps with JSON-like document storage.',
    descriptionId: 'Database dokumen NoSQL fleksibel berkecepatan tinggi dengan format BSON/JSON.',
    autoStart: false,
  },

  // Runtimes
  {
    id: 'nodejs',
    name: 'Node.js & PM2 Process Manager',
    category: 'runtime',
    version: '22.6.0 LTS',
    availableVersions: ['22.6.0 LTS', '20.16.0 LTS', '18.20.4'],
    status: 'installed',
    serviceName: 'pm2',
    description: 'V8 JavaScript runtime engine with PM2 production process cluster manager.',
    descriptionId: 'Runtime JavaScript V8 lengkap dengan manajer proses PM2 untuk menjaga service selalu online.',
    autoStart: true,
    installedVersion: '22.6.0 LTS',
    memoryUsageMb: 110,
  },
  {
    id: 'python',
    name: 'Python 3 & Pip',
    category: 'runtime',
    version: '3.12.5',
    availableVersions: ['3.12.5', '3.11.9', '3.10.14'],
    status: 'installed',
    description: 'Python programming language with pip, virtualenv, and build-essential packages.',
    descriptionId: 'Bahasa pemrograman Python lengkap dengan manajer paket Pip dan virtualenv.',
    autoStart: false,
    installedVersion: '3.12.5',
  },
  {
    id: 'php',
    name: 'PHP 8.3 & PHP-FPM',
    category: 'runtime',
    version: '8.3.10',
    availableVersions: ['8.3.10', '8.2.22', '8.1.29'],
    status: 'not_installed',
    port: 9000,
    serviceName: 'php8.3-fpm',
    description: 'FastCGI Process Manager for PHP with common extensions (curl, mbstring, gd, zip, opcache).',
    descriptionId: 'PHP-FPM siap pakai untuk Nginx/Apache dengan ekstensi lengkap (curl, gd, mbstring, opcache).',
    autoStart: false,
  },
  {
    id: 'golang',
    name: 'Go Language SDK',
    category: 'runtime',
    version: '1.23.0',
    availableVersions: ['1.23.0', '1.22.6'],
    status: 'not_installed',
    description: 'Open source programming language that makes it easy to build simple, reliable software.',
    descriptionId: 'Kompiler Go resmi dari Google untuk kompilasi biner backend super efisien.',
    autoStart: false,
  },

  // Security & Tools
  {
    id: 'ufw',
    name: 'UFW Firewall (Uncomplicated Firewall)',
    category: 'security',
    version: '0.36.2',
    availableVersions: ['0.36.2'],
    status: 'installed',
    serviceName: 'ufw',
    description: 'Default firewall configuration tool for Ubuntu and Debian systems.',
    descriptionId: 'Alat firewall sistem operasi untuk mengamankan port terbuka dan menolak akses tak dikenal.',
    autoStart: true,
    installedVersion: '0.36.2',
  },
  {
    id: 'fail2ban',
    name: 'Fail2ban Intrusion Prevention',
    category: 'security',
    version: '1.0.2',
    availableVersions: ['1.0.2'],
    status: 'installed',
    serviceName: 'fail2ban',
    description: 'Scans log files and bans IPs that show malicious signs like brute-force password failures.',
    descriptionId: 'Memantau log akses dan memblokir otomatis alamat IP penyerang yang mencoba brute-force SSH.',
    autoStart: true,
    installedVersion: '1.0.2',
    memoryUsageMb: 36,
  },
  {
    id: 'certbot',
    name: 'Certbot (Let\'s Encrypt SSL)',
    category: 'security',
    version: '2.11.0',
    availableVersions: ['2.11.0'],
    status: 'installed',
    description: 'Automates fetching and deploying SSL/TLS certificates for your web servers.',
    descriptionId: 'Alat otomasi penerbitan dan perpanjangan sertifikat SSL/TLS gratis dari Let\'s Encrypt.',
    autoStart: false,
    installedVersion: '2.11.0',
  },
  {
    id: 'cloudflared',
    name: 'Cloudflare Tunnel (cloudflared)',
    category: 'tool',
    version: '2024.8.2',
    availableVersions: ['2024.8.2'],
    status: 'not_installed',
    serviceName: 'cloudflared',
    description: 'Expose local services securely to the internet without opening public inbound firewall ports.',
    descriptionId: 'Hubungkan aplikasi internal ke internet dengan aman via Cloudflare Edge tanpa membuka port publik.',
    autoStart: false,
  },
  {
    id: 'netdata',
    name: 'Netdata Real-time Telemetry',
    category: 'tool',
    version: '1.46.2',
    availableVersions: ['1.46.2'],
    status: 'not_installed',
    port: 19999,
    serviceName: 'netdata',
    description: 'Real-time performance and health monitoring for systems and applications.',
    descriptionId: 'Dasbor pemantauan performa real-time detik-per-detik untuk CPU, RAM, disk, dan network.',
    autoStart: false,
  },
  {
    id: 'wireguard',
    name: 'WireGuard VPN Server',
    category: 'security',
    version: '1.0.20210606',
    availableVersions: ['1.0'],
    status: 'not_installed',
    port: 51820,
    serviceName: 'wg-quick@wg0',
    description: 'Extremely simple yet fast and modern VPN utilizing state-of-the-art cryptography.',
    descriptionId: 'Protokol VPN modern berkecepatan tinggi dengan enkripsi mutakhir untuk tunnel privat.',
    autoStart: false,
  },

  // Control Panels (aaPanel, FastPanel, CyberPanel, CloudPanel, HestiaCP)
  {
    id: 'aapanel',
    name: 'aaPanel (Linux Control Panel)',
    category: 'panel',
    version: '7.0.8',
    availableVersions: ['7.0.8 English Stable', '6.8.37 Extended'],
    status: 'installed',
    installedVersion: '7.0.8 English Stable',
    memoryUsageMb: 84,
    port: 7800,
    serviceName: 'bt',
    description: 'Modular, visual web hosting control panel with 1-click LAMP/LNMP, FTP, Database, SSL, and file manager.',
    descriptionId: 'Panel hosting visual lengkap untuk mengelola website LAMP/LNMP, database, SSL, dan file manager tanpa ribet via browser.',
    autoStart: true,
    adminPath: '/aapanel_admin',
    defaultCredentials: {
      user: 'admin_aa',
      pass: 'aaPnl#2026@Pass',
      securityEntry: '/aapanel_admin',
      fullUrl: 'http://{IP}:7800/aapanel_admin',
    },
    installCommand: 'URL=https://www.aapanel.com/script/install_7.0_en.sh && if [ -f /usr/bin/curl ];then curl -ksSO "$URL" ;else wget --no-check-certificate -O install_7.0_en.sh "$URL";fi;bash install_7.0_en.sh aapanel -y',
  },
  {
    id: 'fastpanel',
    name: 'FastPanel Server Manager',
    category: 'panel',
    version: '1.11',
    availableVersions: ['1.11 Stable'],
    status: 'not_installed',
    port: 8888,
    serviceName: 'fastpanel',
    description: 'Simple, fast, and feature-rich server control panel with automated backups, mail server, and multi-PHP support.',
    descriptionId: 'Panel server modern, sangat responsif dan ringan dengan fitur multi-PHP, mail server, DNS, SSL, dan backup cloud.',
    autoStart: true,
    defaultCredentials: {
      user: 'fastuser',
      pass: 'fast#Pnl99*2026',
      fullUrl: 'https://{IP}:8888',
    },
    installCommand: 'rm -f /etc/lsb-release; apt-get update -y && apt-get install -y wget curl && wget http://repo.fastpanel.direct/install_fastpanel.sh -O - | bash -',
  },
  {
    id: 'cyberpanel',
    name: 'CyberPanel (OpenLiteSpeed)',
    category: 'panel',
    version: '2.3.5',
    availableVersions: ['2.3.5 (OpenLiteSpeed)', '2.3.5 (LiteSpeed Enterprise)'],
    status: 'not_installed',
    port: 8090,
    serviceName: 'lscpd',
    description: 'High-performance hosting control panel powered by OpenLiteSpeed with built-in LSCache for blazing fast WordPress.',
    descriptionId: 'Panel web hosting berkecepatan tinggi berbasis OpenLiteSpeed dengan akselerasi cache WordPress LSCache dan Redis bawaan.',
    autoStart: true,
    defaultCredentials: {
      user: 'admin',
      pass: 'Cyber#99Admin*Pass',
      fullUrl: 'https://{IP}:8090',
    },
    installCommand: 'bash <(curl -s https://cyberpanel.net/install.sh || wget -q -O - https://cyberpanel.net/install.sh)',
  },
  {
    id: 'cloudpanel',
    name: 'CloudPanel (PHP & Node.js)',
    category: 'panel',
    version: '2.4.2',
    availableVersions: ['2.4.2 CE'],
    status: 'not_installed',
    port: 8443,
    serviceName: 'cloudpanel',
    description: 'Modern server control panel built for PHP and Node.js applications with Nginx and MySQL 8.0 optimization.',
    descriptionId: 'Panel server ultra-efisien untuk aplikasi PHP, Laravel, WordPress, dan Node.js dengan optimasi Nginx tingkat tinggi.',
    autoStart: true,
    defaultCredentials: {
      user: 'cloudadmin',
      pass: 'cld#Pnl92*Secure',
      fullUrl: 'https://{IP}:8443',
    },
    installCommand: 'curl -sS https://installer.cloudpanel.io/ce/v2/install.sh -o install.sh && bash install.sh',
  },
  {
    id: 'hestiacp',
    name: 'Hestia Control Panel',
    category: 'panel',
    version: '1.8.12',
    availableVersions: ['1.8.12 Stable'],
    status: 'not_installed',
    port: 8083,
    serviceName: 'hestia',
    description: 'Lightweight, open-source web server control panel with Nginx cache, PHP-FPM, Mail, and DNS clustering.',
    descriptionId: 'Panel open-source ringan penerus VestaCP dengan web server Nginx + PHP-FPM, email server, dan sertifikat SSL gratis.',
    autoStart: true,
    defaultCredentials: {
      user: 'admin',
      pass: 'Hestia#Admin2026!',
      fullUrl: 'https://{IP}:8083',
    },
    installCommand: 'wget https://raw.githubusercontent.com/hestiacp/hestiacp/release/install/hst-install.sh && bash hst-install.sh --interactive no',
  },
];

export const UBUNTU_BYPASS_METHODS = [
  {
    id: 'in-memory-dd',
    title: 'Netboot DD Script (In-Memory Kexec)',
    titleId: 'Metode 1: Skrip Netboot DD In-Memory (Rekomendasi Utama)',
    description: 'Bootstraps an in-memory Alpine/Debian system into RAM, unmounts the hard drive, and writes official Ubuntu 24.04/22.04 LTS cloud image directly to /dev/vda.',
    descriptionId: 'Memuat micro-kernel ke dalam RAM (memori), melepas partisi hard drive (/dev/vda), lalu menimpa disk langsung dengan image resmi Ubuntu 24.04 LTS. Berhasil di 99% provider yang mengunci OS (seperti hanya menyediakan CentOS 7/8/Rocky/Windows).',
    recommendationLevel: 'recommended' as const,
    estimatedMinutes: 5,
    bashCommand: 'curl -fLO https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh || curl -fLO https://github.com/leitbogioro/Tools/releases/download/OS_Reinstall/InstallNET.sh && bash reinstall.sh ubuntu 24.04 --password "KataSandiBaruAnda"',
    features: [
      'Bekerja pada VPS apapun (KVM / Xen / VMware / Proxmox)',
      'Tidak memerlukan ISO dari panel provider',
      'Mendeteksi IP publik, gateway, dan DNS secara otomatis',
      'Menginjeksi password root & mengaktifkan OpenSSH port 22',
    ],
  },
  {
    id: 'rescue-dd',
    title: 'Rescue Mode Raw Disk Streaming',
    titleId: 'Metode 2: Rescue Mode Raw Streaming (Via Mode Penyelamatan)',
    description: 'Boot into provider Rescue Mode / Live CD, then pipe official Ubuntu cloudimg directly onto block storage via curl and dd.',
    descriptionId: 'Jika provider memiliki tombol "Rescue Mode" di dashboard mereka, nyalakan mode tersebut lalu salin image resmi Ubuntu langsung ke partisi fisik tanpa hambatan.',
    recommendationLevel: 'rescue' as const,
    estimatedMinutes: 8,
    bashCommand: 'curl -sSL https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.raw.tar.gz | tar -xzO | dd of=/dev/vda bs=4M status=progress && sync',
    features: [
      'Sangat aman karena partisi utama tidak sedang berjalan',
      'Menggunakan image resmi langsung dari server canonical ubuntu.com',
      'Dukungan penuh untuk format disk NVMe atau VirtIO SCSI (/dev/vda atau /dev/sda)',
    ],
  },
  {
    id: 'debootstrap-pivot',
    title: 'Debian-to-Ubuntu Debootstrap Pivot',
    titleId: 'Metode 3: Debootstrap Pivot (Jika Provider Hanya Punya Debian)',
    description: 'If your provider supports Debian but not Ubuntu, use debootstrap to install a fresh Ubuntu noble root filesystem and update GRUB.',
    descriptionId: 'Jika VPS Anda saat ini menjalankan Debian, Anda dapat menginstal paket sistem Ubuntu 24.04 langsung ke partisi baru dengan debootstrap tanpa mematikan server.',
    recommendationLevel: 'alternative' as const,
    estimatedMinutes: 10,
    bashCommand: 'apt-get update && apt-get install -y debootstrap && debootstrap --arch amd64 noble /mnt http://archive.ubuntu.com/ubuntu/',
    features: [
      'Tidak memutus sesi SSH saat instalasi berjalan',
      '100% kompatibel dengan kernel Debian yang sudah ada',
      'Bagus untuk cloud provider yang memblokir kexec',
    ],
  },
];

export const INITIAL_FIREWALL_RULES: FirewallRule[] = [
  {
    id: 'fw-1',
    port: '22',
    protocol: 'TCP',
    action: 'ALLOW',
    source: '0.0.0.0/0',
    description: 'OpenSSH Remote Management',
    active: true,
    createdAt: '2026-08-12',
  },
  {
    id: 'fw-2',
    port: '80',
    protocol: 'TCP',
    action: 'ALLOW',
    source: '0.0.0.0/0',
    description: 'HTTP Web Traffic (Nginx/Caddy)',
    active: true,
    createdAt: '2026-08-12',
  },
  {
    id: 'fw-3',
    port: '443',
    protocol: 'TCP',
    action: 'ALLOW',
    source: '0.0.0.0/0',
    description: 'HTTPS Encrypted Web Traffic',
    active: true,
    createdAt: '2026-08-12',
  },
  {
    id: 'fw-4',
    port: '5432',
    protocol: 'TCP',
    action: 'ALLOW',
    source: '103.147.154.21/32',
    description: 'PostgreSQL - Whitelisted Internal DB Only',
    active: true,
    createdAt: '2026-08-15',
  },
  {
    id: 'fw-5',
    port: '9443',
    protocol: 'TCP',
    action: 'ALLOW',
    source: '180.252.164.0/24',
    description: 'Portainer Web UI (Admin Office CIDR)',
    active: true,
    createdAt: '2026-08-20',
  },
  {
    id: 'fw-6',
    port: '6379',
    protocol: 'TCP',
    action: 'DENY',
    source: '0.0.0.0/0',
    description: 'Redis Public Access Blocked',
    active: true,
    createdAt: '2026-08-12',
  },
];

export const INITIAL_BANNED_IPS: BannedIp[] = [
  {
    ip: '194.26.29.112',
    jail: 'sshd',
    bannedAt: '12 Menit yang lalu',
    attempts: 14,
    country: '🇷🇺 Russia',
  },
  {
    ip: '45.154.255.89',
    jail: 'sshd',
    bannedAt: '48 Menit yang lalu',
    attempts: 23,
    country: '🇳🇱 Netherlands',
  },
  {
    ip: '185.196.220.14',
    jail: 'nginx-botsearch',
    bannedAt: '2 Jam yang lalu',
    attempts: 42,
    country: '🇨🇳 China',
  },
];

export const INITIAL_DOMAINS: DomainProxy[] = [
  {
    id: 'dom-1',
    domain: 'api.velacloud.net',
    targetPort: 3000,
    sslStatus: 'active',
    sslExpiry: '84 hari tersisa (Let\'s Encrypt)',
    forceHttps: true,
    websocket: true,
    active: true,
    createdAt: '2026-08-14',
  },
  {
    id: 'dom-2',
    domain: 'app.velacloud.net',
    targetPort: 8080,
    sslStatus: 'active',
    sslExpiry: '84 hari tersisa (Let\'s Encrypt)',
    forceHttps: true,
    websocket: false,
    active: true,
    createdAt: '2026-08-14',
  },
  {
    id: 'dom-3',
    domain: 'docker.velacloud.net',
    targetPort: 9443,
    sslStatus: 'active',
    sslExpiry: '58 hari tersisa (Let\'s Encrypt)',
    forceHttps: true,
    websocket: true,
    active: true,
    createdAt: '2026-08-20',
  },
];

export const INITIAL_CRON_TASKS: CronTask[] = [
  {
    id: 'cron-1',
    schedule: '0 2 * * *',
    humanSchedule: 'Setiap hari pukul 02:00 WIB',
    command: '/opt/scripts/backup-database.sh --all --upload-s3',
    description: 'Pencadangan database harian otomatis dan enkripsi ke S3 cloud storage',
    enabled: true,
    lastRun: 'Hari ini 02:00:14 WIB',
    lastStatus: 'success',
  },
  {
    id: 'cron-2',
    schedule: '*/15 * * * *',
    humanSchedule: 'Setiap 15 menit',
    command: 'curl -fsS https://hc-ping.com/a9c1e0-prod-heartbeat > /dev/null',
    description: 'Healthcheck heartbeat pinger untuk monitoring uptime eksternal',
    enabled: true,
    lastRun: '12 menit lalu',
    lastStatus: 'success',
  },
  {
    id: 'cron-3',
    schedule: '0 0 * * 0',
    humanSchedule: 'Setiap hari Minggu pukul 00:00 WIB',
    command: 'docker system prune -af --volumes',
    description: 'Pembersihan cache image Docker dan dangling container yang tidak terpakai',
    enabled: true,
    lastRun: '5 hari yang lalu',
    lastStatus: 'success',
  },
  {
    id: 'cron-4',
    schedule: '0 4 1 * *',
    humanSchedule: 'Tanggal 1 setiap bulan pukul 04:00 WIB',
    command: 'certbot renew --quiet && systemctl reload nginx',
    description: 'Pemeriksaan dan pembaruan sertifikat SSL Let\'s Encrypt',
    enabled: true,
    lastRun: '1 Sep 2026 04:00:02 WIB',
    lastStatus: 'success',
  },
];

export const INITIAL_CONFIG_FILES: SystemConfigFile[] = [
  {
    id: 'nginx-conf',
    path: '/etc/nginx/nginx.conf',
    title: 'Nginx Master Configuration',
    category: 'nginx',
    serviceToReload: 'nginx',
    content: `user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log warn;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 2048;
    multi_accept on;
    use epoll;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Virtual Host Configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}`,
  },
  {
    id: 'sshd-config',
    path: '/etc/ssh/sshd_config',
    title: 'OpenSSH Daemon Security Configuration',
    category: 'ssh',
    serviceToReload: 'ssh',
    content: `# OpenSSH Server Configuration
Port 22
AddressFamily any
ListenAddress 0.0.0.0
ListenAddress ::

# Host Keys
HostKey /etc/ssh/ssh_host_ed25519_key
HostKey /etc/ssh/ssh_host_rsa_key

# Authentication
PermitRootLogin prohibit-password
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys

# Password Authentication disabled for high security
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no

# Session Settings
X11Forwarding no
MaxAuthTries 4
MaxSessions 10
ClientAliveInterval 300
ClientAliveCountMax 2
UsePAM yes`,
  },
  {
    id: 'docker-daemon',
    path: '/etc/docker/daemon.json',
    title: 'Docker Engine Daemon Configuration',
    category: 'docker',
    serviceToReload: 'docker',
    content: `{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "live-restore": true,
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}`,
  },
  {
    id: 'sysctl-conf',
    path: '/etc/sysctl.d/99-network-tuning.conf',
    title: 'Linux Kernel & Network Tuning',
    category: 'system',
    serviceToReload: 'sysctl',
    content: `# TCP BBR Congestion Control & High Network Throughput
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr

# Increase connection backlog
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192

# Protect against SYN flood attacks
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_synack_retries = 2

# Memory tuning
vm.swappiness = 10
vm.vfs_cache_pressure = 50`,
  },
];

export const INITIAL_PROCESSES: SystemProcess[] = [
  { pid: 1, user: 'root', cpu: 0.1, mem: 0.2, time: '14:20', command: '/sbin/init splash' },
  { pid: 842, user: 'root', cpu: 0.0, mem: 0.3, time: '02:11', command: '/usr/sbin/sshd -D [listener]' },
  { pid: 1104, user: 'www-data', cpu: 2.4, mem: 1.8, time: '38:40', command: 'nginx: worker process' },
  { pid: 1105, user: 'www-data', cpu: 1.9, mem: 1.7, time: '36:12', command: 'nginx: worker process' },
  { pid: 1420, user: 'root', cpu: 1.2, mem: 4.5, time: '52:10', command: '/usr/bin/dockerd -H fd://' },
  { pid: 1530, user: 'node', cpu: 8.6, mem: 14.2, time: '120:44', command: 'node /app/server.js (api-gateway:3000)' },
  { pid: 1890, user: 'postgres', cpu: 4.8, mem: 22.4, time: '88:02', command: 'postgres: main cluster buffer pool' },
  { pid: 2012, user: 'redis', cpu: 0.8, mem: 3.1, time: '18:50', command: '/usr/bin/redis-server 127.0.0.1:6379' },
  { pid: 2450, user: 'root', cpu: 0.2, mem: 1.1, time: '04:15', command: '/usr/bin/python3 /usr/bin/fail2ban-server' },
  { pid: 2780, user: 'root', cpu: 0.0, mem: 0.1, time: '00:08', command: '/usr/sbin/cron -f' },
];

export const INITIAL_SNAPSHOTS: ServerSnapshot[] = [
  {
    id: 'snap-1',
    serverId: 'srv-sg-web01',
    name: 'Pre-Deployment-v2.4-Golden',
    sizeGb: 14.8,
    createdAt: '2026-09-20 23:45:10',
    status: 'ready',
  },
  {
    id: 'snap-2',
    serverId: 'srv-sg-web01',
    name: 'Auto-Weekly-Full-2026-09-15',
    sizeGb: 13.9,
    createdAt: '2026-09-15 03:00:00',
    status: 'ready',
  },
];
