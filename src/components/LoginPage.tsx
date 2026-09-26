import React, { useState } from 'react';
import { useVps } from '../context/VpsContext';
import {
  Server,
  Lock,
  User,
  Globe,
  Radio,
  ArrowRight,
  Shield,
  ShieldCheck,
  Zap,
  Terminal,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, lang, setLang } = useVps();

  const [hostname, setHostname] = useState('denbagoes.my.id');
  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('');
  const [sshPort, setSshPort] = useState(22);
  const [customIp, setCustomIp] = useState('');
  const [showPort, setShowPort] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [authStep, setAuthStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostname.trim() || !username.trim()) {
      setErrorMessage(
        lang === 'id'
          ? 'Mohon masukkan Hostname / IP dan Username VPS Anda.'
          : 'Please enter VPS Hostname/IP and Username.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Step-by-step connection simulation feedback
      setAuthStep(lang === 'id' ? `Menghubungkan ke ${hostname}:${sshPort}...` : `Connecting to ${hostname}:${sshPort}...`);
      await new Promise((r) => setTimeout(r, 600));

      setAuthStep(lang === 'id' ? `Melakukan SSH Handshake & verifikasi kredensial ${username}...` : `Performing SSH Handshake for ${username}...`);
      await new Promise((r) => setTimeout(r, 800));

      setAuthStep(lang === 'id' ? 'Memverifikasi OS akurat & mendeteksi panel aktif...' : 'Probing verified OS & active panel...');
      await new Promise((r) => setTimeout(r, 700));

      const result = await login(hostname.trim(), username.trim(), password, sshPort, customIp.trim());
      if (!result.success) {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal tersambung ke VPS. Periksa kembali hostname dan kata sandi.');
    } finally {
      setIsLoading(false);
      setAuthStep('');
    }
  };

  const handleQuickLoginDenBagoes = () => {
    setHostname('denbagoes.my.id');
    setUsername('root');
    setPassword('denbagoes@Secure2026');
    setSshPort(22);
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar with Language Selector */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              VelaVPS Orchestrator
            </h1>
            <span className="text-[10px] text-slate-400 font-mono">
              Secure Cloud & VPS Gateway
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setLang('id')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                lang === 'id' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                lang === 'en' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 mb-2 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {lang === 'id' ? 'Masuk ke Server VPS Anda' : 'Connect to Your VPS Node'}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {lang === 'id'
                ? 'Gunakan Hostname, Username, dan Password terdaftar pada VPS Anda untuk masuk ke sistem manajemen.'
                : 'Enter your VPS Hostname/IP, registered Username, and Password to authenticate.'}
            </p>
          </div>

          {/* Quick Connect Badge for denbagoes.my.id */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="text-slate-400 text-[10px] block leading-none">Target VPS Domain:</span>
                <span className="font-mono font-semibold text-white truncate block">
                  denbagoes.my.id
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickLoginDenBagoes}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-[11px] transition-colors shrink-0 flex items-center gap-1"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>{lang === 'id' ? 'Gunakan Node Ini' : 'Use This Node'}</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Loading status text */}
          {isLoading && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
              <span className="font-mono text-[11px]">{authStep}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Hostname or IP Input */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'id' ? 'Hostname / Alamat IP VPS' : 'VPS Hostname or IP Address'}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Fqdn / IPv4</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  placeholder="denbagoes.my.id atau 103.xxx.xxx.xxx"
                  className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'id' ? 'Username VPS (SSH User)' : 'VPS Username (SSH User)'}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="root atau username admin"
                  className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'id' ? 'Password VPS (Root Password)' : 'VPS Password (Root)'}</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Optional Port & IP Config Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowPort(!showPort)}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <span>{showPort ? '▲ Sembunyikan Opsi Lanjutan' : '▼ Opsi Port SSH & IP Publik Asli'}</span>
              </button>

              {showPort && (
                <div className="mt-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-300 font-mono block">
                      Port SSH VPS:
                    </label>
                    <input
                      type="number"
                      value={sshPort}
                      onChange={(e) => setSshPort(Number(e.target.value))}
                      min={1}
                      max={65535}
                      className="w-32 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Default: 22. Ubah jika VPS Anda menggunakan custom SSH port.
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <label className="text-[11px] text-slate-300 font-mono block">
                      IP Publik Asli VPS (Opsional):
                    </label>
                    <input
                      type="text"
                      value={customIp}
                      onChange={(e) => setCustomIp(e.target.value)}
                      placeholder="Contoh: 103.xxx.xxx.xxx"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Diisi jika hostname Anda diproxy Cloudflare dan Anda ingin aplikasi langsung mengunci IP VPS asli Anda.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{lang === 'id' ? 'Memverifikasi Akses VPS...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>{lang === 'id' ? 'Masuk ke Server VPS' : 'Connect & Log In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Assurance Footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>SSH 2.0 Enkripsi End-to-End</span>
            </span>
            <span className="font-mono">Port {sshPort}</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900/80 py-4 text-center text-xs text-slate-500 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VelaVPS Orchestrator · Panel Orkestrasi Server & Cloud</span>
          <span className="font-mono text-[11px]">Domain Target: denbagoes.my.id</span>
        </div>
      </footer>
    </div>
  );
};
