import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  Key,
  ArrowRight,
  ShieldCheck,
  FileText,
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { User } from '../types/sakip';
import logoLuwuUtara from '../assets/logo_luwu_utara.png';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
  onRegister?: (newUser: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  allUsers,
}) => {
  const [userIdOrEmail, setUserIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanInput = userIdOrEmail.toLowerCase().trim();

    // Find user by direct email or ID or friendly alias
    let targetUser = allUsers.find(
      (u) =>
        u.email.toLowerCase().trim() === cleanInput ||
        u.id.toLowerCase() === cleanInput
    );

    if (!targetUser) {
      if (cleanInput === 'admin' || cleanInput === 'admin sakip' || cleanInput === 'administrator') {
        targetUser =
          allUsers.find((u) => u.email === 'sakip.transnakerlutra@gmail.com') ||
          allUsers.find((u) => u.role === 'admin');
      } else if (cleanInput === 'op_ptk' || cleanInput === 'operator_ptk' || cleanInput === 'ptk') {
        targetUser = allUsers.find(
          (u) => u.email.includes('ptk') || u.unit.toLowerCase().includes('pemberdayaan')
        );
      } else if (cleanInput === 'op_hi' || cleanInput === 'operator_hi' || cleanInput === 'hi') {
        targetUser = allUsers.find(
          (u) => u.email.includes('hi') || u.unit.toLowerCase().includes('industrial')
        );
      } else if (cleanInput === 'op_trans' || cleanInput === 'trans') {
        targetUser = allUsers.find(
          (u) => (u.email.includes('trans') && u.role === 'operator') || u.unit.toLowerCase().includes('tranmigrasi')
        );
      } else if (cleanInput === 'op_blk' || cleanInput === 'blk') {
        targetUser = allUsers.find(
          (u) => u.email.includes('blk') || u.unit.toLowerCase().includes('blk')
        );
      } else if (cleanInput === 'op_sekretariat' || cleanInput === 'sekretariat') {
        targetUser = allUsers.find((u) => u.unit.toLowerCase().includes('sekretariat'));
      }
    }

    if (!targetUser) {
      setErrorMsg('User ID atau Email tidak terdaftar dalam sistem LAPAK KINERJA.');
      return;
    }

    if (!targetUser.isActive) {
      setErrorMsg('Akun ini sedang dinonaktifkan oleh Administrator SAKIP.');
      return;
    }

    // Verify Password
    const validPassword =
      targetUser.password ||
      (targetUser.role === 'admin' ? 'Admin12345' : 'Operator123');

    if (password !== validPassword) {
      setErrorMsg('Kata sandi yang Anda masukkan salah. Hubungi Administrator SAKIP.');
      return;
    }

    onLoginSuccess(targetUser);
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-200 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background radial gradient overlay matching the uploaded image */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,33,65,0.45)_0%,rgba(7,13,24,0.95)_70%,#070d18_100%)] pointer-events-none" />

      {/* Main Two-Column Layout */}
      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Left Side: Branding, Tagline, Feature Cards, 5 Integrated Units */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Pill Badge */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1d36]/80 border border-blue-500/30 text-blue-400 text-xs font-medium shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Pemerintah Kabupaten Luwu Utara</span>
            </div>
          </div>

          {/* Logo & Application Title */}
          <div className="flex items-center gap-3.5">
            <img
              src={logoLuwuUtara}
              alt="Logo Kabupaten Luwu Utara"
              className="w-12 h-14 sm:w-14 sm:h-16 object-contain filter-none drop-shadow-lg"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide leading-none uppercase">
                LAPAK KINERJA
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-blue-400 mt-1">
                Dinas Transmigrasi dan Tenaga Kerja Kabupaten Luwu Utara
              </p>
            </div>
          </div>

          {/* Quotation / Tagline with Left Blue Line */}
          <div className="border-l-2 border-blue-500 pl-3.5 py-0.5 space-y-1">
            <p className="text-sm font-bold text-white leading-snug">
              “Layanan Pemantauan dan Akses Data Dukung Evaluasi Akuntabilitas Kinerja”
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Aplikasi Pengelolaan Sistem Akuntabilitas Kinerja Instansi Pemerintah (SAKIP) yang terintegrasi untuk menyimpan, mengelola, mencari, dan mengarsipkan data dukung kinerja dinas.
            </p>
          </div>

          {/* Two Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-[#0b1527] border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <h3 className="text-xs font-bold text-white">Kepatuhan SAKIP</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                PermenPAN-RB No 88 & 89 tentang evaluasi akuntabilitas kinerja instansi pemerintah.
              </p>
            </div>

            <div className="bg-[#0b1527] border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <h3 className="text-xs font-bold text-white">8 Dokumen Wajib</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Penyimpanan terpadu Renstra, IKU, Renja, Perjanjian Kinerja, LKjIP, Renaksi, Monev, SOP.
              </p>
            </div>
          </div>

          {/* 5 Bidang / Unit Kerja Terintegrasi */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              5 BIDANG / UNIT KERJA TERINTEGRASI:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-[#0b1527] border border-slate-800 rounded-lg p-2.5">
                <p className="font-bold text-white text-xs">Sekretariat</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Sekretariat Dinas</p>
              </div>

              <div className="bg-[#0b1527] border border-slate-800 rounded-lg p-2.5">
                <p className="font-bold text-white text-xs">Bidang Pemberdayaan TK</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Bidang Pemberdayaan Tenaga Kerja</p>
              </div>

              <div className="bg-[#0b1527] border border-slate-800 rounded-lg p-2.5">
                <p className="font-bold text-white text-xs">Bidang HI</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Bidang Hubungan Industrial</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-[#0b1527] border border-slate-800 rounded-lg p-2.5">
                <p className="font-bold text-white text-xs">Bidang Penyiapan Kawasan</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                  Bidang Penyiapan dan Pembangunan Kawasan Transmigrasi
                </p>
              </div>

              <div className="bg-[#0b1527] border border-slate-800 rounded-lg p-2.5">
                <p className="font-bold text-white text-xs">Bidang Pengembangan Kawasan</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                  Bidang Pengembangan Kawasan Transmigrasi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-[#0d182b] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            {/* Header of Login Card */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/90 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Masuk ke Sistem</h2>
                <p className="text-xs text-slate-400">Gunakan User ID atau Email Kedinasan Anda</p>
              </div>
            </div>

            {/* Akses Akun Terpusat Box */}
            <div className="bg-blue-950/30 border border-blue-500/40 rounded-xl p-3.5 my-5 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Akses Akun Terpusat</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                  Akun operator dibuat dan dikelola secara terpusat oleh{' '}
                  <strong className="text-white font-semibold">Administrator SAKIP</strong>. Hubungi Admin dinas jika Anda memerlukan akses baru.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {/* Field 1: User ID / Email Kedinasan */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-200">
                    User ID / Email Kedinasan
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Contoh: admin atau op_ptk
                  </span>
                </div>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userIdOrEmail}
                    onChange={(e) => setUserIdOrEmail(e.target.value)}
                    placeholder="Masukkan User ID atau Email"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#08101e] border border-slate-700/80 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-xs"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Field 2: Kata Sandi (Password) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-200">
                    Kata Sandi (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#08101e] border border-slate-700/80 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-xs"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all mt-6 text-xs cursor-pointer"
              >
                <span>Masuk ke Sistem LAPAK KINERJA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
