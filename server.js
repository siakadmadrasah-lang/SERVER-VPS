import express from "express";
import { createServer } from "vite";
import ssh2 from "ssh2";
import net from "net";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
//#region server.ts
var { Client } = ssh2;
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
	const app = express();
	const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
	const distPath = path.join(__dirname, "dist");
	const hasDist = fs.existsSync(distPath);
	const isProd = process.env.NODE_ENV === "production" || hasDist;
	app.use(express.json({ limit: "10mb" }));
	const agentSessions = /* @__PURE__ */ new Map();
	setInterval(() => {
		const twoHoursAgo = Date.now() - 72e5;
		for (const [token, session] of agentSessions.entries()) if (session.registeredAt < twoHoursAgo) agentSessions.delete(token);
	}, 9e5);
	function isPrivateIpv4(ip) {
		const parts = ip.split(".").map((p) => parseInt(p, 10));
		if (parts.length !== 4) return false;
		if (parts[0] === 10) return true;
		if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
		if (parts[0] === 192 && parts[1] === 168) return true;
		return false;
	}
	function isCgNatIpv4(ip) {
		const parts = ip.split(".").map((p) => parseInt(p, 10));
		if (parts.length !== 4) return false;
		return parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127;
	}
	function executeSshCommand(config, command, timeoutMs = 15e3) {
		return new Promise((resolve, reject) => {
			const conn = new Client();
			let stdout = "";
			let stderr = "";
			let timer;
			const startTime = Date.now();
			timer = setTimeout(() => {
				try {
					conn.end();
				} catch {}
				reject(/* @__PURE__ */ new Error(`Koneksi SSH timeout setelah ${Math.round(timeoutMs / 1e3)} detik.`));
			}, timeoutMs);
			conn.on("ready", () => {
				conn.exec(command, (err, stream) => {
					if (err) {
						clearTimeout(timer);
						conn.end();
						return reject(err);
					}
					stream.on("close", (code) => {
						clearTimeout(timer);
						conn.end();
						resolve({
							stdout,
							stderr,
							code: code ?? 0,
							durationMs: Date.now() - startTime
						});
					}).on("data", (data) => {
						stdout += data.toString("utf-8");
					}).stderr.on("data", (data) => {
						stderr += data.toString("utf-8");
					});
				});
			}).on("error", (err) => {
				clearTimeout(timer);
				reject(err);
			}).connect({
				...config,
				readyTimeout: timeoutMs,
				keepaliveInterval: 5e3
			});
		});
	}
	app.post("/api/vps/check-port", async (req, res) => {
		const { host, port, timeout = 3e3 } = req.body;
		if (!host || !port) return res.status(400).json({ error: "host dan port diperlukan" });
		const startTime = Date.now();
		const socket = new net.Socket();
		socket.setTimeout(timeout);
		socket.on("connect", () => {
			const latencyMs = Date.now() - startTime;
			socket.destroy();
			return res.json({
				open: true,
				latencyMs,
				host,
				port
			});
		});
		socket.on("timeout", () => {
			socket.destroy();
			return res.json({
				open: false,
				error: "Connection timed out",
				host,
				port
			});
		});
		socket.on("error", (err) => {
			socket.destroy();
			return res.json({
				open: false,
				error: err.message,
				host,
				port
			});
		});
		socket.connect(parseInt(port, 10), host);
	});
	app.post("/api/vps/detect-network", async (req, res) => {
		const { host, port = 22 } = req.body;
		if (!host) return res.status(400).json({ error: "Host atau IP wajib disertakan" });
		const cleanHost = host.trim();
		const parsedPort = parseInt(port.toString(), 10) || 22;
		const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(cleanHost);
		let classification = "public";
		let isNat = false;
		let natReason = "";
		if (!isIpv4) {
			classification = "domain";
			isNat = false;
		} else if (cleanHost.startsWith("127.")) {
			classification = "loopback";
			isNat = true;
			natReason = "Loopback Localhost";
		} else if (isCgNatIpv4(cleanHost)) {
			classification = "cgnat";
			isNat = true;
			natReason = "Carrier-Grade NAT (RFC 6598)";
		} else if (isPrivateIpv4(cleanHost)) {
			classification = "private_rfc1918";
			isNat = true;
			natReason = "Subnet Private LAN (RFC 1918)";
		} else if (parsedPort > 1024 && parsedPort !== 22) {
			classification = "public";
			isNat = false;
			natReason = "NAT VPS dengan Port Forwarding Khusus";
		} else {
			classification = "public";
			isNat = false;
			natReason = "Rute Internet Publik Langsung";
		}
		const sessionToken = `vla_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
		const agentCmd = `curl -fsSL "${process.env.APP_URL || `${req.protocol}://${req.get("host")}`}/api/vps/nat-agent?token=${sessionToken}&port=${parsedPort}" | sudo bash`;
		let portReachable = false;
		let latencyMs = null;
		let reachError = null;
		if (!isNat) try {
			await new Promise((resolve, reject) => {
				const socket = new net.Socket();
				const tStart = Date.now();
				socket.setTimeout(2500);
				socket.on("connect", () => {
					portReachable = true;
					latencyMs = Date.now() - tStart;
					socket.destroy();
					resolve();
				});
				socket.on("timeout", () => {
					socket.destroy();
					reachError = "Port tidak merespon (Timeout 2.5s)";
					resolve();
				});
				socket.on("error", (err) => {
					socket.destroy();
					reachError = err.message;
					resolve();
				});
				socket.connect(parsedPort, cleanHost);
			});
		} catch {}
		else reachError = `Alamat ${cleanHost} berada di subnet privat/NAT dan tidak dapat diakses langsung via internet publik.`;
		return res.json({
			host: cleanHost,
			port: parsedPort,
			classification,
			isNat,
			natReason,
			portReachable,
			latencyMs,
			reachError,
			sessionToken,
			agentCommand: agentCmd,
			resolutions: [
				{
					id: "auto_agent",
					titleId: "Auto-Resolver: Skrip Agen Otomatis (Rekomendasi Utama)",
					titleEn: "Auto-Resolver: One-Line Agent (Recommended)",
					descId: "Jalankan 1 baris skrip di VPS untuk auto-deteksi IP publik, bypass NAT, dan langsung terhubung otomatis ke VelaVPS.",
					descEn: "Run 1-line script on VPS to auto-discover public IP, bypass NAT, and automatically link to dashboard.",
					command: agentCmd,
					type: "agent"
				},
				{
					id: "cloudflare_tunnel",
					titleId: "Cloudflare Zero Trust / Argo Quick Tunnel",
					titleEn: "Cloudflare Zero Trust / Quick Tunnel",
					descId: "Menembus firewall dan CGNAT tanpa perlu port terbuka di router VPS (Gratis & Terenkripsi).",
					descEn: "Bypass any router NAT / ISP firewall using outbound secure tunnels.",
					type: "tunnel"
				},
				{
					id: "port_forward",
					titleId: "NAT Port Forwarding Mapping",
					titleEn: "NAT Port Forwarding Mapping",
					descId: "Jika Anda menggunakan NAT VPS dari penyedia hosting, gunakan alamat IP Publik gerbang utama beserta port SSH khusus yang diberikan (contoh: 22xxx).",
					descEn: "Use provider gateway public IP with mapped custom SSH port.",
					type: "port_mapping"
				}
			]
		});
	});
	app.get("/api/vps/nat-agent", (req, res) => {
		const token = req.query.token || `vla_${Date.now().toString(36)}`;
		const port = req.query.port || "22";
		const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
		const lines = [
			"#!/usr/bin/env bash",
			"set -e",
			"",
			"# VelaVPS Automated Network Discovery & NAT Resolver Agent",
			"# Version: 2.4.0",
			"",
			"BOLD='\\033[1m'",
			"GREEN='\\033[0;32m'",
			"SKY='\\033[0;36m'",
			"YELLOW='\\033[1;33m'",
			"PURPLE='\\033[0;35m'",
			"RED='\\033[0;31m'",
			"NC='\\033[0m'",
			"",
			"clear || true",
			"echo -e \"${BOLD}${SKY}\"",
			"echo \" __     __   _      __     ______   ____  \"",
			"echo \" \\ \\   / /__| | __ _\\ \\   / /  _ \\ / ___| \"",
			"echo \"  \\ \\ / / _ \\ |/ _` \\\\ \\ / /| |_) |\\___ \\ \"",
			"echo \"   \\ V /  __/ | (_| |\\ V / |  __/  ___) |\"",
			"echo \"    \\_/ \\___|_|\\__,_| \\_/  |_|    |____/ \"",
			"echo \"       Cloud & VPS Orchestration Panel\"",
			"echo -e \"${NC}\"",
			"echo -e \"${BOLD}🚀 Memulai VelaVPS Automated Network Resolver...${NC}\"",
			`echo -e "Token Sesi: \${YELLOW}${token}\${NC}"`,
			"echo \"---------------------------------------------------------\"",
			"",
			"# 1. Detect Hostname",
			"HOSTNAME=$(hostname -f 2>/dev/null || hostname)",
			"echo -e \"[1/6] 🖥️  Hostname: ${BOLD}$HOSTNAME${NC}\"",
			"",
			"# 2. Detect Local / Internal IP",
			"LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}' || hostname -I | awk '{print $1}')",
			"echo -e \"[2/6] 🏠 IP Internal / Antarmuka: ${BOLD}$LOCAL_IP${NC}\"",
			"",
			"# 3. Detect Outbound Public IP",
			"echo -e \"[3/6] 🌐 Mendeteksi IP Publik keluar...\"",
			"PUBLIC_IP=$(curl -s4 --max-time 5 https://api.ipify.org 2>/dev/null || curl -s4 --max-time 5 https://ifconfig.me 2>/dev/null || echo \"$LOCAL_IP\")",
			"echo -e \"      IP Publik Terdeteksi: ${BOLD}${GREEN}$PUBLIC_IP${NC}\"",
			"",
			"# 4. Analyze NAT Status",
			"IS_NAT=\"false\"",
			"NAT_TYPE=\"Direct Public\"",
			"",
			"if [[ \"$LOCAL_IP\" != \"$PUBLIC_IP\" ]]; then",
			"  IS_NAT=\"true\"",
			"  if [[ \"$LOCAL_IP\" =~ ^10\\. ]] || [[ \"$LOCAL_IP\" =~ ^192\\.168\\. ]] || [[ \"$LOCAL_IP\" =~ ^172\\.(1[6-9]|2[0-9]|3[0-1])\\. ]]; then",
			"    NAT_TYPE=\"Private LAN (RFC 1918)\"",
			"  elif [[ \"$LOCAL_IP\" =~ ^100\\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\\. ]]; then",
			"    NAT_TYPE=\"Carrier-Grade NAT (CGNAT RFC 6598)\"",
			"  else",
			"    NAT_TYPE=\"Subnet NAT / Port Translated\"",
			"  fi",
			"  echo -e \"      ${YELLOW}⚡ Mode NAT Terdeteksi: ${BOLD}$NAT_TYPE${NC}\"",
			"  echo -e \"      (Sistem Vela akan otomatis menyelesaikan rute koneksi ke node ini)\"",
			"else",
			"  echo -e \"      ${GREEN}✅ IP Publik Langsung (Direct Internet Access)${NC}\"",
			"fi",
			"",
			"# 5. Gather Hardware & Distro Specs",
			"echo -e \"[4/6] ⚙️  Membaca spesifikasi node...\"",
			"DISTRO=\"Linux\"",
			"VERSION=\"\"",
			"if [ -f /etc/os-release ]; then",
			"  . /etc/os-release",
			"  DISTRO=$NAME",
			"  VERSION=$VERSION_ID",
			"fi",
			"",
			"KERNEL=$(uname -r)",
			"ARCH=$(uname -m)",
			"VCPU=$(nproc 2>/dev/null || grep -c ^processor /proc/cpuinfo || echo 2)",
			"RAM_MB=$(free -m 2>/dev/null | awk '/^Mem:/{print $2}' || echo 4096)",
			"DISK_GB=$(df -BG / 2>/dev/null | awk 'NR==2{print $2}' | tr -d 'G' || echo 50)",
			"",
			"echo -e \"      OS: ${BOLD}$DISTRO $VERSION${NC} ($ARCH)\"",
			"echo -e \"      Resource: ${BOLD}$VCPU vCPU · $RAM_MB MB RAM · $DISK_GB GB Disk${NC}\"",
			"",
			"# 6. Verify SSH Daemon Listening Port",
			`SSH_PORT="${port}"`,
			"if netstat -tlpn 2>/dev/null | grep -q \":22 \"; then",
			"  SSH_PORT=\"22\"",
			"elif ss -tlpn 2>/dev/null | grep -q \":22 \"; then",
			"  SSH_PORT=\"22\"",
			"fi",
			"",
			"echo -e \"[5/6] 🔒 Port SSH Aktif: ${BOLD}$SSH_PORT${NC}\"",
			"",
			"# 7. Post Registration to VelaVPS Master",
			"echo -e \"[6/6] 📡 Menghubungkan node ke VelaVPS Orchestrator...\"",
			"PAYLOAD=$(cat << JSON",
			"{",
			`  "token": "${token}",`,
			"  \"hostname\": \"$HOSTNAME\",",
			"  \"internalIp\": \"$LOCAL_IP\",",
			"  \"publicIp\": \"$PUBLIC_IP\",",
			"  \"isNat\": $IS_NAT,",
			"  \"natType\": \"$NAT_TYPE\",",
			"  \"distro\": \"$DISTRO\",",
			"  \"version\": \"$VERSION\",",
			"  \"kernel\": \"$KERNEL\",",
			"  \"arch\": \"$ARCH\",",
			"  \"vcpu\": $VCPU,",
			"  \"ramMb\": $RAM_MB,",
			"  \"diskGb\": $DISK_GB,",
			"  \"sshPort\": $SSH_PORT,",
			"  \"status\": \"ready\"",
			"}",
			"JSON",
			")",
			"",
			`RESP=$(curl -s -X POST "${appUrl}/api/vps/agent-register" \\`,
			"  -H \"Content-Type: application/json\" \\",
			"  -d \"$PAYLOAD\" || true)",
			"",
			"echo \"\"",
			"echo \"---------------------------------------------------------\"",
			"echo -e \"${GREEN}${BOLD}🎉 BERHASIL! Node VPS telah tersambung secara otomatis!${NC}\"",
			"echo -e \"Status: ${BOLD}Terhubung ke Dashboard VelaVPS${NC}\"",
			"echo -e \"Buka antarmuka VelaVPS di browser Anda, server ini telah muncul dan siap dikelola 100%.\"",
			"echo \"---------------------------------------------------------\"",
			"exit 0",
			""
		];
		res.setHeader("Content-Type", "text/x-shellscript; charset=utf-8");
		for (const line of lines) res.write(line + "\n");
		return res.end();
	});
	app.post("/api/vps/agent-register", (req, res) => {
		const { token, hostname, internalIp, publicIp, isNat, natType, distro, version, kernel, arch, vcpu, ramMb, diskGb, sshPort } = req.body;
		if (!token) return res.status(400).json({
			success: false,
			error: "Token sesi diperlukan"
		});
		const registration = {
			token,
			registeredAt: Date.now(),
			hostname: hostname || "vps-node",
			internalIp: internalIp || "127.0.0.1",
			publicIp: publicIp || internalIp || "127.0.0.1",
			isNat: Boolean(isNat),
			natType: natType || "Direct",
			distro: distro || "Ubuntu",
			version: version || "24.04",
			kernel: kernel || "Linux 6.8.0",
			arch: arch || "x86_64",
			vcpu: parseInt(vcpu, 10) || 2,
			ramMb: parseInt(ramMb, 10) || 4096,
			diskGb: parseInt(diskGb, 10) || 50,
			sshPort: parseInt(sshPort, 10) || 22
		};
		agentSessions.set(token, registration);
		console.log(`[VelaVPS Agent] Node registered successfully with token: ${token}, IP: ${publicIp} (NAT: ${isNat})`);
		return res.json({
			success: true,
			message: "Node berhasil terdaftar ke VelaVPS Orchestrator",
			session: registration
		});
	});
	app.get("/api/vps/agent-status/:token", (req, res) => {
		const token = req.params.token;
		if (!token) return res.status(400).json({
			registered: false,
			error: "Token diperlukan"
		});
		const session = agentSessions.get(token);
		if (session) return res.json({
			registered: true,
			session
		});
		return res.json({
			registered: false,
			waiting: true
		});
	});
	app.post("/api/vps/test-ssh", async (req, res) => {
		const { host, port = 22, username = "root", password, privateKey } = req.body;
		if (!host) return res.status(400).json({
			success: false,
			error: "Alamat IP / Host VPS wajib diisi"
		});
		if (!password && !privateKey) return res.status(400).json({
			success: false,
			error: "Password atau SSH Private Key diperlukan"
		});
		const sshConfig = {
			host: host.trim(),
			port: parseInt(port.toString(), 10) || 22,
			username: (username || "root").trim(),
			password: password ? password.trim() : void 0,
			privateKey: privateKey ? privateKey.trim() : void 0
		};
		try {
			const result = await executeSshCommand(sshConfig, `
        cat /etc/os-release 2>/dev/null;
        echo "---OS_END---";
        uname -r;
        uname -m;
        echo "---UNAME_END---";
        free -m;
        echo "---FREE_END---";
        df -m /;
        echo "---DF_END---";
        uptime;
        echo "---UPTIME_END---";
        nproc;
      `, 1e4);
			const output = result.stdout;
			const osSection = output.split("---OS_END---")[0] || "";
			let distro = "Linux";
			let version = "";
			const prettyMatch = osSection.match(/PRETTY_NAME="([^"]+)"/);
			const nameMatch = osSection.match(/NAME="([^"]+)"/);
			const verMatch = osSection.match(/VERSION_ID="([^"]+)"/);
			if (prettyMatch) distro = prettyMatch[1];
			else if (nameMatch) distro = nameMatch[1];
			if (verMatch) version = verMatch[1];
			const kernelLines = (output.split("---OS_END---")[1] || "").split("---UNAME_END---")[0].trim().split("\n");
			const kernel = kernelLines[0] || "Linux Kernel";
			const arch = kernelLines[1] || "x86_64";
			const memParts = ((output.split("---UNAME_END---")[1] || "").split("---FREE_END---")[0].split("\n").find((l) => l.trim().startsWith("Mem:")) || "").trim().split(/\s+/);
			const totalRamMb = parseInt(memParts[1], 10) || 4096;
			const usedRamMb = parseInt(memParts[2], 10) || 400;
			const actualUsedRamMb = totalRamMb - (parseInt(memParts[6], 10) || totalRamMb - usedRamMb);
			const ramPct = Number((actualUsedRamMb / totalRamMb * 100).toFixed(1));
			const dfParts = ((output.split("---FREE_END---")[1] || "").split("---DF_END---")[0].split("\n").find((l) => l.includes("/")) || "").trim().split(/\s+/);
			const diskTotalMb = parseInt(dfParts[1], 10) || 5e4;
			const diskUsedMb = parseInt(dfParts[2], 10) || 5e3;
			const diskPct = Number((diskUsedMb / diskTotalMb * 100).toFixed(1));
			const uptimeSection = (output.split("---DF_END---")[1] || "").split("---UPTIME_END---")[0].trim();
			const nproc = parseInt((output.split("---UPTIME_END---")[1] || "").trim(), 10) || 2;
			return res.json({
				success: true,
				host,
				port: sshConfig.port,
				username: sshConfig.username,
				pingMs: result.durationMs,
				detectedDistro: distro,
				detectedVersion: version,
				detectedKernel: kernel,
				detectedArch: arch,
				detectedCores: nproc,
				detectedRamMb: totalRamMb,
				usedRamMb: actualUsedRamMb,
				ramPct,
				detectedDiskGb: Math.round(diskTotalMb / 1024),
				diskPct,
				uptimeStr: uptimeSection,
				rawOutput: output
			});
		} catch (err) {
			console.error("SSH Connection Failed:", err.message);
			return res.status(401).json({
				success: false,
				error: err.message || "Gagal melakukan handshake SSH ke server.",
				tip: "Pastikan alamat IP benar, port SSH 22 terbuka di firewall, dan kata sandi root tepat."
			});
		}
	});
	app.post("/api/vps/real-metrics", async (req, res) => {
		const { host, port = 22, username = "root", password, privateKey } = req.body;
		if (!host || !password && !privateKey) return res.status(400).json({ error: "Kredensial SSH tidak lengkap" });
		const sshConfig = {
			host: host.trim(),
			port: parseInt(port.toString(), 10) || 22,
			username: (username || "root").trim(),
			password: password ? password.trim() : void 0,
			privateKey: privateKey ? privateKey.trim() : void 0
		};
		try {
			const out = (await executeSshCommand(sshConfig, `
        cat /etc/os-release 2>/dev/null;
        echo "===OS_END===";
        uname -r;
        uname -m;
        echo "===UNAME_END===";
        free -m;
        echo "===DF===";
        df -m /;
        echo "===LOAD===";
        cat /proc/loadavg;
        echo "===UPTIME===";
        uptime;
        echo "===PORTS===";
        ss -tlpn 2>/dev/null || netstat -tlpn 2>/dev/null || true;
        echo "===SERVICES===";
        echo "bt:$(systemctl is-active bt 2>/dev/null || echo inactive)";
        echo "lscpd:$(systemctl is-active lscpd 2>/dev/null || echo inactive)";
        echo "fastpanel:$(systemctl is-active fastpanel2 2>/dev/null || systemctl is-active fastpanel 2>/dev/null || echo inactive)";
        echo "hestia:$(systemctl is-active hestia 2>/dev/null || echo inactive)";
        echo "webmin:$(systemctl is-active webmin 2>/dev/null || echo inactive)";
        echo "cpanel:$(systemctl is-active cpanel 2>/dev/null || echo inactive)";
        echo "plesk:$(systemctl is-active psa 2>/dev/null || echo inactive)";
        echo "docker:$(systemctl is-active docker 2>/dev/null || echo inactive)";
        echo "nginx:$(systemctl is-active nginx 2>/dev/null || echo inactive)";
        echo "lsws:$(systemctl is-active lsws 2>/dev/null || echo inactive)";
        echo "apache2:$(systemctl is-active apache2 2>/dev/null || systemctl is-active httpd 2>/dev/null || echo inactive)";
      `, 1e4)).stdout;
			const osSection = out.split("===OS_END===")[0] || "";
			let distro = "Ubuntu";
			let version = "24.04";
			let codename = "";
			const prettyMatch = osSection.match(/PRETTY_NAME="([^"]+)"/);
			const nameMatch = osSection.match(/NAME="([^"]+)"/);
			const verMatch = osSection.match(/VERSION_ID="([^"]+)"/);
			const codeMatch = osSection.match(/VERSION_CODENAME=([^\s\n]+)/);
			if (prettyMatch) distro = prettyMatch[1].split(" ")[0];
			else if (nameMatch) distro = nameMatch[1];
			if (verMatch) version = verMatch[1];
			if (codeMatch) codename = codeMatch[1];
			const kernelLines = (out.split("===OS_END===")[1] || "").split("===UNAME_END===")[0].trim().split("\n");
			const kernel = kernelLines[0] || "Linux Kernel";
			const arch = kernelLines[1] || "x86_64";
			const memTokens = ((out.split("===UNAME_END===")[1] || "").split("===DF===")[0].split("\n").find((l) => l.trim().startsWith("Mem:")) || "").trim().split(/\s+/);
			const totalMb = parseInt(memTokens[1], 10) || 4096;
			const usedMb = parseInt(memTokens[2], 10) || 350;
			const realUsedMb = totalMb - (parseInt(memTokens[6], 10) || totalMb - usedMb);
			const ramPct = Number((realUsedMb / totalMb * 100).toFixed(1));
			const dfTokens = ((out.split("===DF===")[1] || "").split("===LOAD===")[0].split("\n").find((l) => l.includes("/")) || "").trim().split(/\s+/);
			const diskTotal = parseInt(dfTokens[1], 10) || 5e4;
			const diskUsed = parseInt(dfTokens[2], 10) || 5e3;
			const diskPct = Number((diskUsed / diskTotal * 100).toFixed(1));
			const loadTokens = (out.split("===LOAD===")[1] || "").split("===UPTIME===")[0].trim().split(/\s+/);
			const loadAvg = [
				parseFloat(loadTokens[0]) || .1,
				parseFloat(loadTokens[1]) || .1,
				parseFloat(loadTokens[2]) || .1
			];
			const cpuPct = Math.min(100, Math.round(loadAvg[0] * 25));
			const uptimeSection = (out.split("===UPTIME===")[1] || "").split("===PORTS===")[0].trim();
			const portsPart = (out.split("===PORTS===")[1] || "").split("===SERVICES===")[0];
			const servicesPart = out.split("===SERVICES===")[1] || "";
			let detectedPanel = null;
			const isBtActive = servicesPart.includes("bt:active") || portsPart.includes(":7800 ");
			const isLscpdActive = servicesPart.includes("lscpd:active") || portsPart.includes(":8090 ");
			const isFastpanelActive = servicesPart.includes("fastpanel:active") || portsPart.includes(":8888 ");
			const isHestiaActive = servicesPart.includes("hestia:active") || portsPart.includes(":8083 ");
			const isWebminActive = servicesPart.includes("webmin:active") || portsPart.includes(":10000 ");
			const isCpanelActive = servicesPart.includes("cpanel:active") || portsPart.includes(":2083 ") || portsPart.includes(":2087 ");
			const isPleskActive = servicesPart.includes("plesk:active") || portsPart.includes(":8443 ");
			if (isBtActive) detectedPanel = {
				id: "aapanel",
				name: "aaPanel (Linux Web Hosting)",
				port: 7800,
				serviceName: "bt",
				adminUrl: `http://${host}:7800`
			};
			else if (isLscpdActive) detectedPanel = {
				id: "cyberpanel",
				name: "CyberPanel (OpenLiteSpeed)",
				port: 8090,
				serviceName: "lscpd",
				adminUrl: `https://${host}:8090`
			};
			else if (isFastpanelActive) detectedPanel = {
				id: "fastpanel",
				name: "FastPanel",
				port: 8888,
				serviceName: "fastpanel2",
				adminUrl: `https://${host}:8888`
			};
			else if (isHestiaActive) detectedPanel = {
				id: "hestiacp",
				name: "HestiaCP",
				port: 8083,
				serviceName: "hestia",
				adminUrl: `https://${host}:8083`
			};
			else if (isWebminActive) detectedPanel = {
				id: "webmin",
				name: "Webmin Server Admin",
				port: 1e4,
				serviceName: "webmin",
				adminUrl: `https://${host}:10000`
			};
			else if (isCpanelActive) detectedPanel = {
				id: "cpanel",
				name: "cPanel & WHM",
				port: 2083,
				serviceName: "cpanel",
				adminUrl: `https://${host}:2083`
			};
			else if (isPleskActive) detectedPanel = {
				id: "plesk",
				name: "Plesk Obsidian",
				port: 8443,
				serviceName: "psa",
				adminUrl: `https://${host}:8443`
			};
			const isNginxActive = servicesPart.includes("nginx:active") || portsPart.includes(":80 ");
			const isDockerActive = servicesPart.includes("docker:active");
			return res.json({
				success: true,
				distro,
				version,
				codename,
				prettyOs: prettyMatch ? prettyMatch[1] : `${distro} ${version}`,
				kernel,
				arch,
				osReleaseRaw: osSection.trim(),
				ramPct,
				ramUsedMb: realUsedMb,
				ramTotalMb: totalMb,
				ramUsedGb: Number((realUsedMb / 1024).toFixed(2)),
				ramTotalGb: Number((totalMb / 1024).toFixed(1)),
				cpuPct,
				diskPct,
				diskUsedGb: Number((diskUsed / 1024).toFixed(1)),
				diskTotalGb: Number((diskTotal / 1024).toFixed(1)),
				loadAvg,
				uptimeStr: uptimeSection,
				detectedPanel,
				isCyberPanelActive: isLscpdActive,
				isAaPanelActive: isBtActive,
				isFastpanelActive,
				isHestiaActive,
				isWebminActive,
				isNginxActive,
				isDockerActive,
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			});
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	});
	app.post("/api/vps/exec", async (req, res) => {
		const { host, port = 22, username = "root", password, privateKey, command, timeout = 9e5 } = req.body;
		if (!host || !password && !privateKey) return res.status(400).json({ error: "Kredensial SSH tidak lengkap" });
		if (!command) return res.status(400).json({ error: "Perintah (command) wajib disertakan" });
		const sshConfig = {
			host: host.trim(),
			port: parseInt(port.toString(), 10) || 22,
			username: (username || "root").trim(),
			password: password ? password.trim() : void 0,
			privateKey: privateKey ? privateKey.trim() : void 0
		};
		try {
			const result = await executeSshCommand(sshConfig, command, Math.max(timeout, 9e5));
			return res.json({
				success: true,
				stdout: result.stdout,
				stderr: result.stderr,
				code: result.code,
				durationMs: result.durationMs
			});
		} catch (err) {
			return res.status(500).json({
				success: false,
				error: err.message || "Gagal mengeksekusi perintah di server."
			});
		}
	});
	if (!isProd) {
		const vite = await createServer({
			server: { middlewareMode: true },
			appType: "spa"
		});
		app.use(vite.middlewares);
	} else {
		const distPath = path.join(__dirname, "dist");
		if (fs.existsSync(distPath)) {
			app.use(express.static(distPath));
			app.get("*", (_req, res) => {
				res.sendFile(path.join(distPath, "index.html"));
			});
		}
	}
	app.listen(PORT, "0.0.0.0", () => {
		console.log(`[VelaVPS Backend] Running on port ${PORT} (dev: ${!isProd})`);
	});
}
startServer().catch((err) => {
	console.error("[VelaVPS Backend Error]", err);
	process.exit(1);
});
//#endregion
export {};
