import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import Modal from './Modal';
import { 
  PlusCircle, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ListFilter, 
  DollarSign, 
  Tag, 
  FileText 
} from 'lucide-react';
import { TbMoneybagMove } from 'react-icons/tb';

const DEFAULT_CATEGORIES = [
  'Utilitas (Listrik & Air)',
  'Sewa Toko / Tempat Usaha',
  'Gaji Karyawan & Kasir',
  'Transportasi & Logistik',
  'Perlengkapan Toko & Plastik',
  'Internet & Komunikasi',
  'Perawatan & Perbaikan',
  'Kebersihan Toko',
  'Promosi & Pemasaran',
  'Administrasi Bank & EDC',
  'Lain-lain'
];

export const formatRupiah = (val) => 'Rp ' + Number(val || 0).toLocaleString('id-ID');

const OperationalExpenseModal = ({ isOpen, onClose, onExpenseSaved }) => {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  
  // Form State
  const [expenseName, setExpenseName] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // UI State
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [submitting, setSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // History State
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/operational-expenses/categories');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCategories(res.data.data);
      }
    } catch {
      // Fallback to default
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  // Fetch History
  const fetchExpenses = async () => {
    setHistoryLoading(true);
    try {
      const res = await apiClient.get('/operational-expenses');
      if (res.data?.success && res.data.data) {
        setExpenses(res.data.data.expenses || []);
        setTotalAmount(res.data.data.total_amount || 0);
      }
    } catch (err) {
      console.error('Gagal memuat histori biaya:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      fetchCategories();
      fetchExpenses();
    }
  }, [isOpen]);

  const resetForm = () => {
    setExpenseName('');
    setCategory(categories[0] || DEFAULT_CATEGORIES[0]);
    setIsCustomCategory(false);
    setCustomCategory('');
    setAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === '__CUSTOM__') {
      setIsCustomCategory(true);
      setCustomCategory('');
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const finalCategory = isCustomCategory ? customCategory.trim() : category.trim();

    if (!expenseName.trim()) {
      setError('Nama pengeluaran wajib diisi.');
      return;
    }

    if (!finalCategory) {
      setError('Kategori pengeluaran wajib dipilih atau diisi.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Nominal pengeluaran harus berupa angka lebih besar dari 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        expense_name: expenseName.trim(),
        category: finalCategory,
        amount: numAmount,
        expense_date: expenseDate,
        notes: notes.trim() || null
      };

      const res = await apiClient.post('/operational-expenses', payload);
      if (res.data?.success) {
        setSuccessMsg(`Biaya operasional "${payload.expense_name}" berhasil dicatat.`);
        resetForm();
        fetchExpenses();
        fetchCategories();
        if (onExpenseSaved) onExpenseSaved();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan biaya operasional.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus catatan biaya "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await apiClient.delete(`/operational-expenses/${id}`);
      if (res.data?.success) {
        setSuccessMsg(`Catatan biaya berhasil dihapus.`);
        fetchExpenses();
        if (onExpenseSaved) onExpenseSaved();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus biaya operasional.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Form Biaya Operasional Toko"
      icon={<TbMoneybagMove className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Pengeluaran</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              fetchExpenses();
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Riwayat Pengeluaran ({expenses.length})</span>
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-800 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-600 hover:text-rose-800 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* TAB 1: FORM INPUT BIAYA OPERASIONAL */}
        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Catat pengeluaran untuk kegiatan operasional toko.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Biaya ini akan otomatis mengurangi laba kotor pada Laporan Ringkasan Dashboard Toko.
              </p>
            </div>

            {/* Nama Pengeluaran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Pengeluaran <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  placeholder="Contoh: Pembayaran listrik bulan November"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Kategori Pengeluaran */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Pengeluaran <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={isCustomCategory ? '__CUSTOM__' : category}
                    onChange={handleCategoryChange}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__CUSTOM__">+ Kategori Kustom / Baru...</option>
                  </select>
                </div>
              </div>

              {/* Tanggal Pengeluaran */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Pengeluaran <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Jika memilih kategori kustom */}
            {isCustomCategory && (
              <div>
                <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
                  Ketik Nama Kategori Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Contoh: Pajak Daerah, Keamanan Lingkungan, Parkir Toko"
                  className="w-full px-3.5 py-2.5 text-xs bg-rose-50/50 dark:bg-rose-950/20 text-slate-900 dark:text-slate-100 border border-rose-300 dark:border-rose-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            {/* Nominal Pengeluaran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nominal Pengeluaran (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Quick Nominal Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[50000, 100000, 250000, 500000, 1000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    +{formatRupiah(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Catatan (Opsional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan (Opsional)
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Keterangan tambahan atau nomor bukti transaksi..."
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Card Total Pengeluaran */}
            <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white shadow-md border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Pengeluaran
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                  {formatRupiah(amount || 0)}
                </div>
                <p className="text-[11px] text-slate-400">
                  {amount && Number(amount) > 0 
                    ? 'Nominal pengeluaran yang akan dicatat & memotong laba toko' 
                    : 'Masukkan nominal pengeluaran pada kolom di atas'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <TbMoneybagMove className="w-6 h-6" />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <TbMoneybagMove className="w-4 h-4" />
                    <span>Simpan Pengeluaran</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: RIWAYAT BIAYA OPERASIONAL */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Summary Box */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
              <div>
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                  Total Biaya Operasional Tercatat
                </span>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                  {formatRupiah(totalAmount)}
                </div>
              </div>
              <div className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                {expenses.length} Transaksi
              </div>
            </div>

            {/* Expense Items List */}
            {historyLoading ? (
              <div className="py-12 flex justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs">
                Belum ada biaya operasional yang dicatat.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {exp.expense_name}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {exp.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                        <span>{exp.expense_date}</span>
                        {exp.notes && (
                          <span className="italic truncate max-w-xs">• {exp.notes}</span>
                        )}
                        {exp.recorded_by && (
                          <span>• Oleh: {exp.recorded_by.full_name || exp.recorded_by.username}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                        {formatRupiah(exp.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(exp.id, exp.expense_name)}
                        disabled={deletingId === exp.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                        title="Hapus Pengeluaran"
                      >
                        {deletingId === exp.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OperationalExpenseModal;
