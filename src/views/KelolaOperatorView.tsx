import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Mail,
  Building,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
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

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'operator',
      unit: 'Bidang Pemberdayaan Tenaga Kerja',
      nip: '',
      phone: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      unit: user.unit,
      nip: user.nip || '',
      phone: user.phone || '',
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              unit: formData.unit,
              nip: formData.nip,
              phone: formData.phone,
              isActive: formData.isActive,
            }
          : u
      );
      onSaveUsers(updated);
    } else {
      const newUser: User = {
        id: 'usr-' + Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        unit: formData.unit,
        nip: formData.nip,
        phone: formData.phone,
        isActive: formData.isActive,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onSaveUsers([...users, newUser]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun yang sedang aktif!');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus akun pengguna ini?')) {
      onSaveUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    if (id === currentUser.id) return;
    const updated = users.map((u) =>
      u.id === id ? { ...u, isActive: !u.isActive } : u
    );
    onSaveUsers(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">
                Manajemen Pengguna
              </span>
              <span className="text-xs text-slate-500 font-medium">Hak Akses Role-Based SAKIP</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Pengelolaan Akun Administrator & Operator Bidang
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin dapat membuat akun operator baru untuk setiap bidang kerja agar dapat melakukan penginputan dan verifikasi data SAKIP.
            </p>
          </div>

          {isAdmin ? (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Buat Akun Operator Baru</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Mode Operator (Hanya Administrator yang dapat menambah akun)</span>
            </div>
          )}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const isMe = u.id === currentUser.id;
          const isUserAdmin = u.role === 'admin';

          return (
            <div
              key={u.id}
              className={`bg-white rounded-xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${
                isMe ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isUserAdmin
                          ? 'bg-blue-900 text-white'
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

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{u.unit}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate font-mono text-[11px]">{u.email}</span>
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
              </div>

              {/* Actions */}
              {isAdmin && (
                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleStatus(u.id)}
                    disabled={isMe}
                    className={`text-[11px] font-medium ${
                      isMe
                        ? 'text-slate-300 cursor-not-allowed'
                        : u.isActive
                        ? 'text-amber-600 hover:text-amber-800'
                        : 'text-emerald-600 hover:text-emerald-800'
                    }`}
                  >
                    {u.isActive ? 'Non-aktifkan' : 'Aktifkan'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Akun"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {!isMe && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Hapus Akun"
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

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Akun Operator Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Hj. Ratna, S.Sos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Login <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="operator.bidang@transnaker-lutra.go.id"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
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
                    <option value="operator">Operator (Input & Edit)</option>
                    <option value="admin">Administrator (Penuh)</option>
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
                <label className="block font-semibold text-slate-700 mb-1">No. Kontak / WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812xxxx..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
