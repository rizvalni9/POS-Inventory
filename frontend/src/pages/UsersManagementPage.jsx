import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  KeyRound,
  AlertCircle,
  Loader2
} from 'lucide-react';

const UsersManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create User Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    full_name: '',
    role: 'cashier',
    password: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Reset Password Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users');
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError(null);

    if (createForm.password.length < 6) {
      setCreateError('Password minimal 6 karakter.');
      return;
    }

    setCreateLoading(true);

    try {
      const res = await apiClient.post('/users', createForm);
      if (res.data?.success) {
        setIsCreateModalOpen(false);
        setCreateForm({ username: '', full_name: '', role: 'cashier', password: '' });
        fetchUsers();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Gagal membuat pengguna baru.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser.id) {
      alert('Anda tidak dapat menonaktifkan akun Anda sendiri!');
      return;
    }

    const action = user.is_active ? 'menonaktifkan' : 'mengaktifkan';
    if (!window.confirm(`Apakah Anda yakin ingin ${action} akun '${user.username}'? Jika dinonaktifkan, seluruh sesi login aktif pengguna ini akan langsung dicabut.`)) {
      return;
    }

    try {
      await apiClient.patch(`/users/${user.id}/status`, {
        is_active: !user.is_active
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui status akun.');
    }
  };

  const handleOpenResetModal = (user) => {
    setTargetUser(user);
    setNewPassword('');
    setResetError(null);
    setIsResetModalOpen(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 6) {
      setResetError('Password baru minimal 6 karakter.');
      return;
    }

    setResetLoading(true);

    try {
      const res = await apiClient.patch(`/users/${targetUser.id}/reset-password`, {
        new_password: newPassword
      });

      if (res.data?.success) {
        alert(res.data.message);
        setIsResetModalOpen(false);
      }
    } catch (err) {
      setResetError(err.response?.data?.message || 'Gagal mereset password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Manajemen Akun & Hak Akses</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kebijakan Enterprise: Registrasi publik dinonaktifkan. Seluruh pembuatan personil kasir dikontrol oleh Pemilik Toko.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError(null);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Username</th>
                <th className="px-6 py-3.5">Nama Lengkap</th>
                <th className="px-6 py-3.5">Peran (Role)</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5">Terdaftar Sejak</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
                    <span>Memuat daftar personil pengguna...</span>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-400">#{u.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 font-mono">
                        {u.username}
                        {isCurrent && (
                          <span className="ml-2 text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                            (Anda)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{u.full_name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            u.role === 'owner'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role === 'owner' ? (
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                          ) : (
                            <UserCheck className="w-3 h-3 text-blue-600" />
                          )}
                          <span className="capitalize">{u.role}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {u.is_active ? (
                          <span className="inline-flex items-center space-x-1 text-green-700 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-red-600 font-semibold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Non-Aktif</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(u.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenResetModal(u)}
                          title="Reset Password Akun"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        {!isCurrent && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            title={u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.is_active
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-brand-600 hover:bg-brand-50'
                            }`}
                          >
                            {u.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    Belum ada data pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tambah Akun Personil Baru"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{createError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username Login
            </label>
            <input
              type="text"
              required
              disabled={createLoading}
              value={createForm.username}
              onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              placeholder="Contoh: kasir2"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Personil
            </label>
            <input
              type="text"
              required
              disabled={createLoading}
              value={createForm.full_name}
              onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Peran Hak Akses (Role)
            </label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="cashier">Kasir (Hanya Modul Penjualan POS & Riwayat Hari Ini)</option>
              <option value="owner">Pemilik Toko (Otoritas Penuh & Seluruh Laporan)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password Awal (Min 6 Karakter)
            </label>
            <input
              type="password"
              required
              disabled={createLoading}
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder="Masukkan password awal"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={createLoading}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {createLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Buat Akun</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={`Reset Password: ${targetUser?.username}`}
      >
        <form onSubmit={handleResetSubmit} className="space-y-4">
          {resetError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resetError}</span>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Masukkan password baru untuk akun <strong>{targetUser?.full_name} ({targetUser?.username})</strong>. Seluruh sesi aktif pengguna ini di perangkat lain akan otomatis diputus.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password Baru (Min 6 Karakter)
            </label>
            <input
              type="password"
              required
              disabled={resetLoading}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan password baru"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              disabled={resetLoading}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={resetLoading}
              className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {resetLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Terapkan Password Baru</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersManagementPage;
