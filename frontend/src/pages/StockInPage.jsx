import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import {
  ArrowDownToLine,
  PlusCircle,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package
} from 'lucide-react';

const StockInPage = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, movRes] = await Promise.all([
        apiClient.get('/products?is_active=true'),
        apiClient.get('/stock-movements')
      ]);

      if (prodRes.data?.success) setProducts(prodRes.data.data);
      if (movRes.data?.success) setMovements(movRes.data.data);
    } catch (err) {
      console.error('Failed to load stock in data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const parsedQty = parseInt(quantity, 10);
    if (!selectedProductId || isNaN(parsedQty) || parsedQty <= 0) {
      setError('Pilih produk dan masukkan kuantitas masuk berupa bilangan bulat positif.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiClient.post('/stock-movements', {
        product_id: Number(selectedProductId),
        quantity: parsedQty,
        reference_number: referenceNumber,
        notes: notes
      });

      if (res.data?.success) {
        setMessage(res.data.message);
        // Reset form
        setSelectedProductId('');
        setQuantity('');
        setReferenceNumber('');
        setNotes('');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mencatat stok masuk.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Pencatatan Stok Masuk (Stock-In)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Form resmi mutasi penambahan barang masuk dari pemasok/distributor dan jurnal audit riwayat stok.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form Box */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
            <PlusCircle className="w-5 h-5 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-800">Formulir Barang Masuk</h2>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Produk
              </label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">-- Pilih Barang Dagangan --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name} (Sisa Stok: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="p-3 bg-brand-50/60 border border-brand-100 rounded-xl flex items-center justify-between text-xs text-brand-900">
                <span className="font-medium">Stok fisik saat ini:</span>
                <span className="font-extrabold text-brand-700 bg-white px-2.5 py-0.5 rounded-lg border border-brand-200">
                  {selectedProduct.stock} Unit
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jumlah Kuantitas Masuk (Unit)
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Contoh: 25"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor Surat Jalan / Faktur (Opsional)
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Contoh: SJ-2026-10-001"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Kiriman supplier beras langsung dari gudang"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Simpan Mutasi Masuk</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Audit Log Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">Jurnal Riwayat Mutasi Stok Masuk</h2>
              <p className="text-[11px] text-slate-400">Jejak audit permanen siapa dan kapan barang ditambahkan.</p>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5">Nama Produk</th>
                  <th className="px-5 py-3.5 text-center">Jumlah</th>
                  <th className="px-5 py-3.5">No. Referensi / Surat Jalan</th>
                  <th className="px-5 py-3.5">Pencatat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Memuat riwayat stok...</span>
                    </td>
                  </tr>
                ) : movements.length > 0 ? (
                  movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                        {new Date(mov.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {mov.product?.name || 'Produk'}
                        <span className="block text-[10px] font-mono text-slate-400">{mov.product?.sku}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-extrabold bg-green-100 text-green-800">
                          +{mov.quantity} Unit
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <span className="font-mono">{mov.reference_number || '-'}</span>
                        {mov.notes && <span className="block text-[10px] text-slate-400 italic">{mov.notes}</span>}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {mov.creator?.full_name || mov.creator?.username || 'Owner'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400">
                      Belum ada catatan mutasi stok masuk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInPage;
