import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Building,
  ArrowRight,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { User } from '../types/sakip';
import logoLuwuUtara from '../assets/logo_luwu_utara.png';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
  onRegister: (newUser: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  allUsers,
  onRegister,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Bidang Pemberdayaan Tenaga Kerja');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetUser = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!targetUser) {
      setErrorMsg('Email tidak terdaftar dalam sistem LAPAK KINERJA.');
      return;
    }

    if (!targetUser.isActive) {
      setErrorMsg('Akun ini sedang dinonaktifkan oleh Administrator SAKIP.');
      return;
    }

    onLoginSuccess(targetUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !email) {
      setErrorMsg('Harap lengkapi semua kolom.');
      return;
    }

    const existing = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
    if (existing) {
      setErrorMsg('Email tersebut sudah terdaftar.');
      return;
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name,
      email: email.trim(),
      role: 'operator',
      unit,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onRegister(newUser);
    onLoginSuccess(newUser);
  };

  const handleQuickLogin = (targetEmail: string) => {
    const user = allUsers.find((u) => u.email === targetEmail);
    if (user) {
      onLoginSuccess(user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Logo Asli Luwu Utara yang diunggah */}
        <div className="mx-auto flex items-center justify-center mb-4">
          <img
            src={logoLuwuUtara}
            alt="Logo Kabupaten Luwu Utara"
            className="h-20 w-auto object-contain filter-none drop-shadow-lg"
          />
        </div>

        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-white">LAPAK KINERJA</h1>
          <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase">
            SAKIP
          </span>
        </div>
        <p className="text-xs text-blue-200 mt-1 font-medium">
          Layanan Pemantauan dan Akses Data Dukung Evaluasi Akuntabilitas Kinerja
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Dinas Transmigrasi dan Tenaga Kerja Kabupaten Luwu Utara
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isRegisterMode ? 'Daftar Akun Operator' : 'Masuk ke Sistem'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {isRegisterMode
                  ? 'Isi formulir untuk pendaftaran operator bidang'
                  : 'Gunakan email dan kata sandi kedinasan'}
              </p>
            </div>
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg(null);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              {isRegisterMode ? 'Sudah punya akun? Masuk' : 'Daftar Baru'}
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isRegisterMode ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Kedinasan</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@transnaker-lutra.go.id"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors text-xs"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Muh. Firman, S.STP"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@transnaker-lutra.go.id"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bidang / Unit Kerja</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="Bidang Pemberdayaan Tenaga Kerja">Bidang Pemberdayaan Tenaga Kerja</option>
                  <option value="Bidang Hubungan Industrial">Bidang Hubungan Industrial</option>
                  <option value="Bidang Pengembangan Kawasan Tranmigrasi">Bidang Pengembangan Kawasan Tranmigrasi</option>
                  <option value="UPTD BLK">UPTD BLK</option>
                  <option value="Sekretariat">Sekretariat / Subag Perencanaan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-colors text-xs"
              >
                Daftar Akun Operator
              </button>
            </form>
          )}

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Akses Cepat (Demo / Uji Coba)
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@transnaker-lutra.go.id')}
                className="p-2 border border-blue-200 bg-blue-50/70 hover:bg-blue-100 rounded-lg text-left transition-colors text-blue-900"
              >
                <div className="flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Admin SAKIP</span>
                </div>
                <p className="text-[10px] text-blue-600 mt-0.5">Akses Kelola & Hapus Penuh</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('operator.ptk@transnaker-lutra.go.id')}
                className="p-2 border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 rounded-lg text-left transition-colors text-emerald-900"
              >
                <div className="flex items-center gap-1 font-bold">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Operator PTK</span>
                </div>
                <p className="text-[10px] text-emerald-600 mt-0.5">Akses Input & Edit Data</p>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          © 2026 Pemerintah Kabupaten Luwu Utara • Dinas Transmigrasi dan Tenaga Kerja
        </p>
      </div>
    </div>
  );
};
