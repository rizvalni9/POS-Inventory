// ==============================================================================
// FILE: frontend/src/pages/MembersPage.jsx
// DESKRIPSI: Halaman Manajemen Loyalty Member & Program Poin Pelanggan.
// Akses Role:
// - Owner: Akses penuh (analitik, penyesuaian poin manual dengan catatan audit, ubah tier, aktivasi/hapus).
// - Cashier: Melihat daftar, pencarian member, pendaftaran member baru, dan melihat riwayat poin.
// ==============================================================================

import { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { Award, Users, Search, Plus, Coins, Sparkles, CreditCard, Phone, Mail, CheckCircle2, AlertCircle, X, Edit2, SlidersHorizontal, History, Trash2, TrendingUp, RefreshCw, HelpCircle, Loader2 } from 'lucide-react';

const MembersPage = () => {
  const { role } = useAuth();
  const isOwner = role === 'owner';

  // === STATE DATA & FILTER ===
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // === STATE MODAL ===
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // === STATE MEMBER AKTIF DI MODAL ===
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetail, setMemberDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // === FORM STATES ===
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    tier: 'Bronze',
    notes: '',
    initial_points: 10
  });

  const [adjustData, setAdjustData] = useState({
    mode: 'add', // 'add' or 'deduct'
    points: '',
    reason: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ----------------------------------------------------------------------------
  // 1. MEMUAT DATA MEMBER & RINGKASAN DARI BACKEND
  // ----------------------------------------------------------------------------
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (tierFilter) params.tier = tierFilter;
      if (statusFilter) params.is_active = statusFilter;

      const res = await apiClient.get('/members', { params });
      if (res.data?.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat data member:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await apiClient.get('/members/summary/stats');
      if (res.data?.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat analitik loyalty:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchSummary();
  }, [tierFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // ----------------------------------------------------------------------------
  // 2. AMBIL DETAIL MEMBER & RIWAYAT POIN
  // ----------------------------------------------------------------------------
  const openDetailModal = async (member) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await apiClient.get(`/members/${member.id}`);
      if (res.data?.success) {
        setMemberDetail(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat detail member:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ----------------------------------------------------------------------------
  // 3. TAMBAH MEMBER BARU
  // ----------------------------------------------------------------------------
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      tier: 'Bronze',
      notes: '',
      initial_points: 10
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await apiClient.post('/members', formData);
      if (res.data?.success) {
        setSuccessMessage(`Member '${res.data.data.name}' berhasil didaftarkan!`);
        setTimeout(() => setSuccessMessage(null), 4000);
        setIsAddModalOpen(false);
        fetchMembers();
        fetchSummary();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal mendaftarkan member baru.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------------
  // 4. EDIT DATA MEMBER
  // ----------------------------------------------------------------------------
  const handleOpenEditModal = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      address: member.address || '',
      tier: member.tier,
      is_active: member.is_active,
      notes: member.notes || ''
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await apiClient.put(`/members/${selectedMember.id}`, formData);
      if (res.data?.success) {
        setSuccessMessage('Data member berhasil diperbarui!');
        setTimeout(() => setSuccessMessage(null), 4000);
        setIsEditModalOpen(false);
        fetchMembers();
        fetchSummary();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal memperbarui data member.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------------
  // 5. PENYESUAIAN POIN MANUAL (OWNER ONLY)
  // ----------------------------------------------------------------------------
  const handleOpenAdjustModal = (member) => {
    setSelectedMember(member);
    setAdjustData({
      mode: 'add',
      points: '',
      reason: ''
    });
    setFormError(null);
    setIsAdjustModalOpen(true);
  };

  const handleAdjustPoints = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    setFormError(null);
    setSubmitting(true);

    const numPoints = parseInt(adjustData.points, 10);
    if (!numPoints || numPoints <= 0) {
      setFormError('Jumlah poin harus berupa angka positif.');
      setSubmitting(false);
      return;
    }

    const delta = adjustData.mode === 'add' ? numPoints : -numPoints;

    try {
      const res = await apiClient.post(`/members/${selectedMember.id}/adjust-points`, {
        points_delta: delta,
        reason: adjustData.reason
      });

      if (res.data?.success) {
        setSuccessMessage(res.data.message);
        setTimeout(() => setSuccessMessage(null), 4000);
        setIsAdjustModalOpen(false);
        fetchMembers();
        fetchSummary();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyesuaikan saldo poin member.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------------
  // 6. TOGGLE STATUS AKTIF / HAPUS MEMBER (OWNER ONLY)
  // ----------------------------------------------------------------------------
  const handleToggleStatus = async (member) => {
    const action = member.is_active ? 'menonaktifkan' : 'mengaktifkan';
    if (!window.confirm(`Yakin ingin ${action} member '${member.name}'?`)) return;

    try {
      const res = await apiClient.patch(`/members/${member.id}/toggle-status`);
      if (res.data?.success) {
        fetchMembers();
        fetchSummary();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status member.');
    }
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Yakin ingin menghapus member '${member.name}'? Tindakan ini tidak dapat dibatalkan.`)) return;

    try {
      const res = await apiClient.delete(`/members/${member.id}`);
      if (res.data?.success) {
        setSuccessMessage(res.data.message);
        setTimeout(() => setSuccessMessage(null), 4000);
        fetchMembers();
        fetchSummary();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus member.');
    }
  };

  // Helper tampilan badge Tier
  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60';
      case 'Gold':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60';
      case 'Silver':
        return 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60';
    }
  };

  const formatRupiah = (val) => 'Rp' + Number(val || 0).toLocaleString('id-ID');

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. HEADER HALAMAN & NOTIFIKASI SUKSES                          */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Award className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            <span>Loyalty Member & Program Poin</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola pelanggan setia toko, pantau akumulasi poin belanja, dan aturan tier keanggotaan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Panduan Poin & Kasir</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-md shadow-brand-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Member Baru</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. KARTU STATISTIK LOYALTY MEMBER                              */}
      {/* ============================================================== */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors duration-200">
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Member Terdaftar</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {summary.total_members} <span className="text-xs font-normal text-slate-400">orang</span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                {summary.active_members} member aktif
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors duration-200">
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Saldo Poin Beredar</div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {Number(summary.total_points_in_circulation).toLocaleString('id-ID')}{' '}
                <span className="text-xs font-normal text-slate-400">Pts</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Nilai diskon: {formatRupiah(summary.total_points_in_circulation * 100)}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors duration-200">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Poin Pernah Ditukar</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {Number(summary.total_points_redeemed).toLocaleString('id-ID')}{' '}
                <span className="text-xs font-normal text-slate-400">Pts</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Diskon dinikmati: {formatRupiah(summary.total_points_redeemed * 100)}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors duration-200">
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Tier Terbanyak</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center space-x-1.5">
                <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  Gold: {summary.tier_distribution?.Gold || 0}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  Silver: {summary.tier_distribution?.Silver || 0}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Bronze: {summary.tier_distribution?.Bronze || 0} | Plat: {summary.tier_distribution?.Platinum || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. BAR FILTER & PENCARIAN                                       */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between transition-colors duration-200">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari member (nama, no. HP, kode)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Semua Tier</option>
            <option value="Bronze">Bronze (1x Poin)</option>
            <option value="Silver">Silver (1.2x Poin)</option>
            <option value="Gold">Gold (1.5x Poin)</option>
            <option value="Platinum">Platinum (2x Poin)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Non-Aktif</option>
          </select>

          <button
            onClick={() => {
              fetchMembers();
              fetchSummary();
            }}
            title="Muat Ulang"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. TABEL DAFTAR MEMBER                                         */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
        {/* overflow-x-auto digunakan untuk menampilkan scrollbar kiri dan kanan */}
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Member & Kontak</th>
                <th className="py-3.5 px-4">Kode Member</th>
                <th className="py-3.5 px-4">
                  <div>Tier</div>
                  <div className="text-[10px] font-normal text-slate-400 normal-case">Pengali Poin</div>
                </th>
                <th className="py-3.5 px-4">
                  <div>Saldo Poin</div>
                  <div className="text-[10px] font-normal text-amber-600 normal-case">1 Pts = Rp 100</div>
                </th>
                <th className="py-3.5 px-4">Total Belanja</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    Memuat data member...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Belum ada data member yang sesuai.</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Klik tombol "+ Tambah Member Baru" untuk mendaftarkan pelanggan pertama.
                    </p>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Kolom Nama & Kontak */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</div>
                      <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{member.phone}</span>
                        </span>
                        {member.email && (
                          <span className="hidden sm:flex items-center space-x-1 text-slate-400">
                            <Mail className="w-3 h-3" />
                            <span>{member.email}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Kolom Kode Member */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
                        {member.member_code}
                      </span>
                    </td>

                    {/* Kolom Tier */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTierBadge(
                          member.tier
                        )}`}
                      >
                        {member.tier}
                      </span>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {member.tier === 'Platinum'
                          ? 'Pengali 2.0x'
                          : member.tier === 'Gold'
                          ? 'Pengali 1.5x'
                          : member.tier === 'Silver'
                          ? 'Pengali 1.2x'
                          : 'Pengali 1.0x'}
                      </div>
                    </td>

                    {/* Kolom Saldo Poin */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-600 dark:text-amber-400">
                        <Coins className="w-4 h-4 flex-shrink-0" />
                        <span>{Number(member.points).toLocaleString('id-ID')} Pts</span>
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        ≈ {formatRupiah(member.points * 100)}
                      </div>
                    </td>

                    {/* Kolom Total Belanja */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {formatRupiah(member.total_spent)}
                    </td>

                    {/* Kolom Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          member.is_active
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        {member.is_active ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>

                    {/* Kolom Aksi */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* 1. Detail & Kartu Member (Owner & Cashier) */}
                        <button
                          onClick={() => openDetailModal(member)}
                          title="Lihat Kartu & Riwayat Poin"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* 2. Edit Data Kontak (Owner & Cashier) */}
                        <button
                          onClick={() => handleOpenEditModal(member)}
                          title="Edit Member"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* 3. Penyesuaian Poin Manual (Owner Only) */}
                        {isOwner && (
                          <button
                            onClick={() => handleOpenAdjustModal(member)}
                            title="Penyesuaian Poin Manual"
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                        )}

                        {/* 4. Hapus Member (Owner Only) */}
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteMember(member)}
                            title="Hapus Member"
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. MODAL TAMBAH MEMBER BARU                                    */}
      {/* ============================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Pendaftaran Member Baru"
        icon={<Award className="w-5 h-5" />}
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateMember} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Member <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Rahmat Hidayat"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 disabled:text-slate-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor HP / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Contoh: 08123456789"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 disabled:text-slate-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email (Opsional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@contoh.com"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 disabled:text-slate-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tier Awal</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 disabled:text-slate-500"
              >
                <option value="Bronze">Bronze (Pengali 1.0x)</option>
                <option value="Silver">Silver (Pengali 1.2x)</option>
                <option value="Gold">Gold (Pengali 1.5x)</option>
                <option value="Platinum">Platinum (Pengali 2.0x)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bonus Poin Perdana</label>
              <input
                type="number"
                min="0"
                value={formData.initial_points}
                onChange={(e) => setFormData({ ...formData, initial_points: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 disabled:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat (Opsional)</label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat domisili member..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 disabled:text-slate-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] rounded-xl shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitting ? 'Menyimpan...' : 'Daftarkan Member'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* 6. MODAL EDIT MEMBER                                           */}
      {/* ============================================================== */}
      <Modal
        isOpen={isEditModalOpen && Boolean(selectedMember)}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Data Member (${selectedMember?.member_code || ''})`}
        icon={<Edit2 className="w-5 h-5" />}
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {selectedMember && (
          <form onSubmit={handleUpdateMember} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Member</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor HP</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {isOwner && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tier Keanggotaan</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Bronze">Bronze (1.0x)</option>
                    <option value="Silver">Silver (1.2x)</option>
                    <option value="Gold">Gold (1.5x)</option>
                    <option value="Platinum">Platinum (2.0x)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Keaktifan</label>
                  <select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Non-Aktif (Diarsipkan)</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat</label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] rounded-xl shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? 'Menyimpan...' : 'Perbarui Member'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ============================================================== */}
      {/* 7. MODAL DETAIL, KARTU MEMBER & RIWAYAT POIN                   */}
      {/* ============================================================== */}
      <Modal
        isOpen={isDetailModalOpen && Boolean(selectedMember)}
        onClose={() => setIsDetailModalOpen(false)}
        title="Kartu Member & Riwayat Mutasi Poin"
        icon={<CreditCard className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
        maxWidth="max-w-2xl"
      >
        {selectedMember && (
          <div className="space-y-6">
            {/* KARTU VIP MEMBER VISUAL */}
            <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 border border-slate-700/80">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
                    VIP LOYALTY CARD
                  </span>
                  <h2 className="text-xl font-extrabold tracking-wide mt-1">{selectedMember.name}</h2>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">{selectedMember.member_code}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
                    selectedMember.tier === 'Platinum'
                      ? 'bg-purple-500 text-white'
                      : selectedMember.tier === 'Gold'
                      ? 'bg-amber-400 text-slate-900'
                      : selectedMember.tier === 'Silver'
                      ? 'bg-slate-300 text-slate-900'
                      : 'bg-orange-600 text-white'
                  }`}
                >
                  {selectedMember.tier} TIER
                </span>
              </div>

              <div className="mt-8 flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Total Akumulasi Belanja</div>
                  <div className="text-sm font-bold text-white">
                    {formatRupiah(selectedMember.total_spent)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-amber-300 uppercase font-semibold">Saldo Poin Aktif</div>
                  <div className="text-2xl font-black text-amber-400 flex items-center justify-end space-x-1">
                    <Coins className="w-5 h-5 text-amber-400 inline" />
                    <span>{Number(selectedMember.points).toLocaleString('id-ID')} Pts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIWAYAT MUTASI POIN */}
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center space-x-2">
                <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Jejak Riwayat Mutasi Poin (Audit Trail)</span>
              </h4>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto overflow-x-auto bg-white dark:bg-slate-900">
                {loadingDetail ? (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">Memuat riwayat poin...</div>
                ) : !memberDetail?.point_histories || memberDetail.point_histories.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                    Belum ada transaksi poin untuk member ini.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        <th className="py-2.5 px-3">Waktu</th>
                        <th className="py-2.5 px-3">Jenis</th>
                        <th className="py-2.5 px-3">Mutasi Poin</th>
                        <th className="py-2.5 px-3">Saldo Akhir</th>
                        <th className="py-2.5 px-3">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {memberDetail.point_histories.map((hist) => (
                        <tr key={hist.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(hist.created_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                hist.type === 'EARN'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                                  : hist.type === 'REDEEM'
                                  ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                                  : hist.type === 'BONUS'
                                  ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60'
                                  : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60'
                              }`}
                            >
                              {hist.type}
                            </span>
                          </td>
                          <td
                            className={`py-2 px-3 font-bold ${
                              hist.points > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {hist.points > 0 ? `+${hist.points}` : hist.points} Pts
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {hist.balance_after} Pts
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400 max-w-md truncate" title={hist.description}>
                            {hist.description || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================== */}
      {/* 8. MODAL PENYESUAIAN POIN MANUAL (OWNER ONLY)                  */}
      {/* ============================================================== */}
      <Modal
        isOpen={isAdjustModalOpen && Boolean(selectedMember) && isOwner}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Penyesuaian Poin Manual"
        icon={<SlidersHorizontal className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        maxWidth="max-w-md"
      >
        {selectedMember && (
          <form onSubmit={handleAdjustPoints} className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Member: </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{selectedMember.name}</span>
              <span className="text-slate-400 dark:text-slate-500"> • Saldo Saat Ini: </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{selectedMember.points} Pts</span>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Aksi Penyesuaian</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustData({ ...adjustData, mode: 'add' })}
                  className={`py-2 px-3 rounded-xl font-semibold border text-center transition-all ${
                    adjustData.mode === 'add'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  + Tambah Poin
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustData({ ...adjustData, mode: 'deduct' })}
                  className={`py-2 px-3 rounded-xl font-semibold border text-center transition-all ${
                    adjustData.mode === 'deduct'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  - Kurangi Poin
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Poin</label>
              <input
                type="number"
                min="1"
                required
                value={adjustData.points}
                onChange={(e) => setAdjustData({ ...adjustData, points: e.target.value })}
                placeholder="Contoh: 50"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {adjustData.points && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Estimasi saldo baru:{' '}
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {adjustData.mode === 'add'
                      ? selectedMember.points + parseInt(adjustData.points || 0, 10)
                      : Math.max(0, selectedMember.points - parseInt(adjustData.points || 0, 10))}{' '}
                    Pts
                  </span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alasan / Catatan Audit <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="3"
                required
                value={adjustData.reason}
                onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                placeholder="Contoh: Kompensasi gangguan kasir atau promo ulang tahun..."
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Catatan ini akan tersimpan permanen di riwayat mutasi poin sebagai jejak audit.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] rounded-xl shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? 'Memproses...' : 'Simpan Penyesuaian'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ============================================================== */}
      {/* 9. MODAL DIALOG PANDUAN NILAI POIN & PENGALI TIER KASIR         */}
      {/* ============================================================== */}
      <Modal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        title="Panduan Kasir: Cara Menjelaskan Poin & Pengali Tier ke Pelanggan"
        icon={<HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-5 text-slate-800 dark:text-slate-200">
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
            Gunakan acuan dan contoh kalimat di bawah ini saat melayani transaksi atau pendaftaran member baru.
          </p>

          {/* Sub-banner Nilai Tukar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-gradient-to-r from-indigo-50 via-amber-50/60 to-indigo-50/40 dark:from-slate-800/80 dark:via-indigo-950/40 dark:to-slate-800/80 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 gap-2">
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>
                Setiap kelipatan belanja bersih <strong>Rp 10.000</strong> mendapatkan <strong>1 Poin Dasar</strong> dikalikan rasio Tier.
              </span>
            </div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-800/60 flex-shrink-0 self-start sm:self-auto">
              <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Nilai Tetap: 1 Poin = Rp 100</span>
            </div>
          </div>

          {/* 4 KARTU TIER & PENGALI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-orange-200 dark:border-orange-900/50 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
                  Bronze
                </span>
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Pengali 1.0x</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Syarat: Member baru (&lt; Rp1 jt)</p>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Belanja Rp100.000:</div>
                <div className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  +10 Pts <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">(≈ Rp1.000)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
                  Silver
                </span>
                <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-400">Pengali 1.2x</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Syarat: Total belanja &ge; Rp1 jt</p>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Belanja Rp100.000:</div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  +12 Pts <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">(≈ Rp1.200)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-amber-300 dark:border-amber-900/50 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                  Gold
                </span>
                <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">Pengali 1.5x</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Syarat: Total belanja &ge; Rp5 jt</p>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Belanja Rp100.000:</div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  +15 Pts <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">(≈ Rp1.500)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-purple-300 dark:border-purple-900/50 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  Platinum
                </span>
                <span className="text-xs font-extrabold text-purple-700 dark:text-purple-400">Pengali 2.0x</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Syarat: Total belanja &ge; Rp15 jt</p>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Belanja Rp100.000:</div>
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  +20 Pts <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">(≈ Rp2.000)</span>
                </div>
              </div>
            </div>
          </div>

          {/* CONTOH SKRIP BICARA KASIR */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-slate-700 dark:text-slate-300">
            <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Contoh Kalimat (Skrip Siap Pakai) Kasir ke Pelanggan:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">1. Saat Menjelaskan 1 Poin:</div>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  "Kak, 1 poin kami senilai Rp100 diskon tunai langsung. Misal Kakak punya 68 Poin, bisa langsung dipakai memotong belanjaan sebesar Rp6.800 hari ini."
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">2. Saat Menjelaskan Cara Dapat:</div>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  "Setiap belanja kelipatan Rp10.000, Kakak otomatis dapat poin belanja. Poinnya tersimpan aman dan tidak akan hangus."
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">3. Saat Menjelaskan Pengali Tier:</div>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  "Makin sering belanja di sini, level Kakak otomatis naik. Kalau sudah Gold pengalinya 1.5x, jadi perolehan poinnya 50% lebih cepat banyak!"
                </p>
              </div>
            </div>
          </div>

          {/* Footer Modal */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsGuideModalOpen(false)}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MembersPage;
