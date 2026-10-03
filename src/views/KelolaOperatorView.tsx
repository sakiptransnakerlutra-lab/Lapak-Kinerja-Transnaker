import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Key,
  Mail,
  Building,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  Search,
  Share2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { User } from '../types/sakip';

interface KelolaOperatorViewProps {
  users: User[];
  onSaveUsers: (users: User[]) => void;
  currentUser: User;
}

export const KelolaOperatorView: React.FC<KelolaOperatorViewProps> = ({
  users,
  onSaveUsers,
  currentUser,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('ALL');

  // Password visibility state map per user id
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  // Form password visibility
  const [showModalPassword, setShowModalPassword] = useState(false);

  // Copied feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator' as User['role'],
    unit: 'Bidang Pemberdayaan Tenaga Kerja',
    nip: '',
    phone: '',
    isActive: true,
  });

  const togglePasswordVisibility = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      triggerToast(`${label} berhasil disalin!`);
    } else {
      triggerToast(`${label}: ${text}`);
    }
  };

  const handleShareCredentials = (u: User) => {
    const pwd = u.password || (u.role === 'admin' ? 'Admin12345' : 'Operator123');
    const text = `*KREDENSIAL AKSES LAPAK KINERJA SAKIP*\n` +
      `Pemerintah Kabupaten Luwu Utara • Disnakertrans\n\n` +
      `Nama: ${u.name}\n` +
      `Unit Kerja: ${u.unit}\n` +
      `User ID: ${u.email}\n` +
      `Password: ${pwd}\n` +
      `Peran: ${u.role === 'admin' ? 'Administrator SAKIP' : 'Operator Bidang'}\n\n` +
      `Dikelola oleh Administrator SAKIP: sakip.transnakerlutra@gmail.com`;

    copyToClipboard(text, 'Akses Kredensial Lengkap');
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: 'Operator123',
      role: 'operator',
      unit: 'Bidang Pemberdayaan Tenaga Kerja',
      nip: '',
      phone: '',
      isActive: true,
    });
    setShowModalPassword(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password || (user.role === 'admin' ? 'Admin12345' : 'Operator123'),
      role: user.role,
      unit: user.unit,
      nip: user.nip || '',
      phone: user.phone || '',
      isActive: user.isActive,
    });
    setShowModalPassword(false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const finalPassword = formData.password.trim() || (formData.role === 'admin' ? 'Admin12345' : 'Operator123');

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formData.name.trim(),
              email: formData.email.trim(),
              password: finalPassword,
              role: formData.role,
              unit: formData.unit,
              nip: formData.nip.trim(),
              phone: formData.phone.trim(),
              isActive: formData.isActive,
            }
          : u
      );
      onSaveUsers(updated);
      triggerToast('Data operator & kata sandi berhasil diperbarui!');
    } else {
      // Check duplicate email
      const exists = users.some(
        (u) => u.email.toLowerCase() === formData.email.toLowerCase().trim()
      );
      if (exists) {
        alert('User ID / Email ini sudah terdaftar dalam sistem!');
        return;
      }

      const newUser: User = {
        id: 'usr-op-' + Date.now(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: finalPassword,
        role: formData.role,
        unit: formData.unit,
        nip: formData.nip.trim(),
        phone: formData.phone.trim(),
        isActive: formData.isActive,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onSaveUsers([...users, newUser]);
      triggerToast('User ID Operator baru berhasil dibuat!');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    if (target.role === 'admin' || target.email === 'sakip.transnakerlutra@gmail.com') {
      alert('Akun Administrator Utama SAKIP tidak dapat dihapus!');
      return;
    }

    if (id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini!');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun operator "${target.name}" (${target.email})?`)) {
      onSaveUsers(users.filter((u) => u.id !== id));
      triggerToast(`Akun operator "${target.name}" berhasil dihapus.`);
    }
  };

  const handleToggleStatus = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    if (target.role === 'admin' && target.email === 'sakip.transnakerlutra@gmail.com') {
      alert('Akun Administrator SAKIP harus selalu aktif!');
      return;
    }

    if (id === currentUser.id) {
      alert('Anda tidak dapat menonaktifkan akun sendiri yang sedang aktif.');
      return;
    }

    const updated = users.map((u) =>
      u.id === id ? { ...u, isActive: !u.isActive } : u
    );
    onSaveUsers(updated);
    triggerToast(`Status akun operator "${target.name}" diperbarui.`);
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.nip && u.nip.includes(searchQuery));

    const matchUnit = filterUnit === 'ALL' || u.unit === filterUnit;

    return matchQuery && matchUnit;
  });

  const totalOperators = users.filter((u) => u.role === 'operator').length;
  const activeOperators = users.filter((u) => u.role === 'operator' && u.isActive).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner: Pengendali Administrator SAKIP */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wide flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Pengendalian Terpusat SAKIP
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Admin SAKIP Pengendali Penuh
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <span>Kelola Akun Operator & Pantau Kredensial</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Administrator SAKIP (<strong className="text-blue-900 font-mono">sakip.transnakerlutra@gmail.com</strong>) bertindak sebagai pengendali utama dalam <strong>menambahkan User ID Operator</strong> baru, menentukan bidang tugas, serta <strong>dapat melihat User ID dan Kata Sandi</strong> seluruh Operator untuk kemudahan koordinasi.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {isAdmin ? (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah User ID Operator</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Mode Operator: Kredensial & Pengendalian diatur oleh Administrator SAKIP</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ringkasan Statistik Pengendalian */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Akun Terdaftar</p>
            <p className="text-lg font-black text-slate-900">{users.length} Akun</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Operator Aktif</p>
            <p className="text-lg font-black text-emerald-700">
              {activeOperators} / {totalOperators} Bidang
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5 sm:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-500">Akun Pengendali Utama</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-slate-900 truncate font-mono">
                sakip.transnakerlutra@gmail.com
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">
                Admin SAKIP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Pencarian Operator */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama operator, User ID (email), NIP, atau bidang..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Unit:</span>
          <select
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
          >
            <option value="ALL">Semua Unit Kerja ({users.length})</option>
            <option value="Bidang Pemberdayaan Tenaga Kerja">Bidang Pemberdayaan Tenaga Kerja</option>
            <option value="Bidang Hubungan Industrial">Bidang Hubungan Industrial</option>
            <option value="Bidang Pengembangan Kawasan Tranmigrasi">Bidang Pengembangan Kawasan Tranmigrasi</option>
            <option value="UPTD BLK">UPTD BLK</option>
            <option value="Sekretariat">Sekretariat / Perencanaan</option>
            <option value="Dinas Transmigrasi dan Tenaga Kerja">Dinas Transmigrasi dan Tenaga Kerja</option>
          </select>
        </div>
      </div>

      {/* Grid Akun Operator & Kredensial */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => {
          const isMe = u.id === currentUser.id;
          const isUserAdmin = u.role === 'admin';
          const isPasswordVisible = !!revealedPasswords[u.id];
          const userPassword = u.password || (isUserAdmin ? 'Admin12345' : 'Operator123');

          return (
            <div
              key={u.id}
              className={`bg-white rounded-xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${
                isMe
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Kartu Pengguna */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isUserAdmin
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {u.name}
                        </h3>
                        {isMe && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                            Anda
                          </span>
                        )}
                      </div>

                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 uppercase ${
                          isUserAdmin
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {isUserAdmin ? 'Administrator SAKIP' : 'Operator Bidang'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                      u.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {u.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aktif
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-400" /> Non-Aktif
                      </>
                    )}
                  </span>
                </div>

                {/* Profil Unit & Pegawai */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate font-medium">{u.unit}</span>
                  </div>

                  {u.nip && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">NIP:</span>
                      <span className="font-mono text-[11px] text-slate-700">{u.nip}</span>
                    </div>
                  )}

                  {u.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono text-[11px]">{u.phone}</span>
                    </div>
                  )}
                </div>

                {/* KOTAK KREDENSIAL LOGIN (User ID & Password) */}
                <div className="mt-3 bg-slate-50 border border-slate-200/90 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Key className="w-3 h-3 text-blue-600" />
                      Kredensial Login Operator
                    </span>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleShareCredentials(u)}
                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
                        title="Salin kredensial lengkap untuk dibagikan ke operator"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Salin Akses</span>
                      </button>
                    )}
                  </div>

                  {/* User ID / Email */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>User ID (Email):</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(u.email, 'User ID')}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-medium"
                        title="Salin User ID"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Salin</span>
                      </button>
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 flex items-center justify-between truncate">
                      <span className="truncate">{u.email}</span>
                    </div>
                  </div>

                  {/* Password Operator */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Kata Sandi (Password):</span>
                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-medium"
                            title={isPasswordVisible ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi Operator'}
                          >
                            {isPasswordVisible ? (
                              <>
                                <EyeOff className="w-2.5 h-2.5" />
                                <span>Tutup</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-2.5 h-2.5" />
                                <span>Lihat</span>
                              </>
                            )}
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(userPassword, 'Kata Sandi')}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-medium"
                            title="Salin Kata Sandi"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>Salin</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] flex items-center justify-between">
                      {isAdmin ? (
                        isPasswordVisible ? (
                          <span className="font-bold text-emerald-700 tracking-wide select-all">
                            {userPassword}
                          </span>
                        ) : (
                          <span className="text-slate-400 tracking-widest font-sans text-xs">
                            ••••••••••••
                          </span>
                        )
                      ) : isMe ? (
                        <span className="text-slate-500 italic text-[10px]">Tersimpan di akun Anda</span>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">Hanya Administrator SAKIP</span>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5 text-blue-600" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Administrator SAKIP */}
              {isAdmin && (
                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleStatus(u.id)}
                    disabled={isMe || isUserAdmin}
                    className={`text-[11px] font-semibold transition-colors ${
                      isMe || isUserAdmin
                        ? 'text-slate-300 cursor-not-allowed'
                        : u.isActive
                        ? 'text-amber-600 hover:text-amber-800'
                        : 'text-emerald-600 hover:text-emerald-800'
                    }`}
                  >
                    {u.isActive ? 'Non-aktifkan' : 'Aktifkan Akun'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-[11px] font-medium transition-colors"
                      title="Ubah User ID atau Kata Sandi Operator"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Kredensial</span>
                    </button>

                    {!isMe && !isUserAdmin && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Akun Operator"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">Tidak ada akun operator yang cocok.</p>
          <p className="text-xs text-slate-400 mt-1">
            Coba ubah kata kunci pencarian atau filter unit kerja.
          </p>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  {editingUser ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingUser ? 'Edit Data & Kredensial Operator' : 'Tambah User ID Operator Baru'}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Administrator SAKIP menentukan User ID dan Kata Sandi operator.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Hj. Ratna, S.Sos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  User ID / Email Login <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="operator.bidang@transnaker-lutra.go.id"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Digunakan operator untuk masuk (login) ke aplikasi LAPAK KINERJA.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Kata Sandi (Password) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPass = 'OpLutra' + Math.floor(100 + Math.random() * 900);
                      setFormData({ ...formData, password: randomPass });
                    }}
                    className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Acak Sandi
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Contoh: Operator123"
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Password dapat dilihat dan diperiksa kembali oleh Admin SAKIP kapan saja.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as User['role'] })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="operator">Operator Bidang</option>
                    <option value="admin">Administrator SAKIP</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP (Opsional)</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="1980xxxx..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit Kerja / Bidang</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="Bidang Pemberdayaan Tenaga Kerja">Bidang Pemberdayaan Tenaga Kerja</option>
                  <option value="Bidang Hubungan Industrial">Bidang Hubungan Industrial</option>
                  <option value="Bidang Pengembangan Kawasan Tranmigrasi">Bidang Pengembangan Kawasan Tranmigrasi</option>
                  <option value="UPTD BLK">UPTD BLK (Balai Latihan Kerja)</option>
                  <option value="Sekretariat">Sekretariat / Subag Perencanaan</option>
                  <option value="Dinas Transmigrasi dan Tenaga Kerja">Dinas Transmigrasi dan Tenaga Kerja (Pimpinan)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Kontak / WhatsApp (Opsional)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812xxxx..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Akun Langsung Aktif dan Siap Digunakan
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors"
                >
                  {editingUser ? 'Simpan Kredensial' : 'Terbitkan Akun Operator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
