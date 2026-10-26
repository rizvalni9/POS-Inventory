import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { Store, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';

const StoreProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    store_name: '',
    address: '',
    phone: '',
    receipt_footer: ''
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/business-profile');
      if (res.data?.success && res.data?.data) {
        setFormData({
          store_name: res.data.data.store_name || '',
          address: res.data.data.address || '',
          phone: res.data.data.phone || '',
          receipt_footer: res.data.data.receipt_footer || ''
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);

    try {
      const res = await apiClient.put('/business-profile', formData);
      if (res.data?.success) {
        setMessage('Identitas profil usaha berhasil diperbarui.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan profil usaha.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Konfigurasi Profil Usaha & Toko</h1>
        <p className="text-xs text-slate-500 mt-1">
          Identitas resmi toko fisik yang akan otomatis dicetak pada header dan footer nota kasir.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Settings */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          {message && (
            <div className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-start space-x-2 text-xs text-green-700">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Toko
                </label>
                <input
                  type="text"
                  required
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  placeholder="Contoh: Toko Berkah Kelontong"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alamat Lengkap Toko
                </label>
                <textarea
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Jl. Khatib Sulaiman No. 18, Padang"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nomor Telepon / Kontak
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pesan Footer Nota (Struk Belanja)
                </label>
                <input
                  type="text"
                  value={formData.receipt_footer}
                  onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })}
                  placeholder="Contoh: Barang yang sudah dibeli tidak dapat ditukar. Terima kasih!"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan Profil</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Struk Preview */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Pratinjau Nota Cetak
            </h3>
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl font-mono text-[11px] text-slate-800 space-y-3">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <div className="font-bold uppercase text-slate-900">
                  {formData.store_name || 'NAMA TOKO ANDA'}
                </div>
                <div className="text-[10px] text-slate-500">{formData.address || 'Alamat Toko'}</div>
                <div className="text-[10px] text-slate-500">Telp: {formData.phone || '-'}</div>
              </div>

              <div className="text-center py-2 text-[10px] text-slate-400">
                [... Rincian Transaksi Belanja ...]
              </div>

              <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[10px] italic text-slate-500">
                {formData.receipt_footer || 'Terima kasih atas kunjungan Anda.'}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center">
            Perubahan nama dan alamat langsung tertera pada dialog cetak struk kasir browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreProfilePage;
