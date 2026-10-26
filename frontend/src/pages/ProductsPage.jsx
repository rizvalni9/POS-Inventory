import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import {
  Package,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';

const ProductsPage = () => {
  const { role } = useAuth();
  const isOwner = role === 'owner';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: ''
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = '';
      if (activeFilter === 'active') query += '?is_active=true';
      if (activeFilter === 'inactive') query += '?is_active=false';

      const res = await apiClient.get(`/products${query}`);
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeFilter]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({ sku: '', name: '', price: '' });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      price: product.price
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      if (editingProduct) {
        // Edit product (Name & Price only, Stock cannot be manipulated)
        await apiClient.put(`/products/${editingProduct.id}`, {
          name: formData.name,
          price: formData.price
        });
      } else {
        // Add new product
        await apiClient.post('/products', {
          sku: formData.sku,
          name: formData.name,
          price: formData.price
        });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Gagal menyimpan produk.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (product) => {
    const action = product.is_active ? 'menonaktifkan' : 'mengaktifkan';
    if (!window.confirm(`Apakah Anda yakin ingin ${action} produk '${product.name}'?`)) {
      return;
    }

    try {
      await apiClient.patch(`/products/${product.id}/status`, {
        is_active: !product.is_active
      });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui status produk.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const formatRupiah = (val) => 'Rp' + Number(val || 0).toLocaleString('id-ID');

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Katalog Master Produk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar komoditas barang dagangan, SKU/Barcode, harga jual, dan stok saat ini.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama produk atau SKU/Barcode..."
            className="w-full pl-10 pr-4 py-2.5 bg-white text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-4 py-2.5 bg-white text-xs font-semibold text-slate-700 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">Semua Status</option>
          <option value="active">Hanya Produk Aktif</option>
          <option value="inactive">Hanya Produk Non-Aktif</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">SKU / Barcode</th>
                <th className="px-6 py-3.5">Nama Produk</th>
                <th className="px-6 py-3.5">Harga Jual</th>
                <th className="px-6 py-3.5 text-center">Stok Saat Ini</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                {isOwner && <th className="px-6 py-3.5 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={isOwner ? 6 : 5} className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <span>Memuat katalog produk...</span>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 block">{product.name}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          product.stock > 10
                            ? 'bg-green-100 text-green-800'
                            : product.stock > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.stock} Unit
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.is_active ? (
                        <span className="inline-flex items-center space-x-1 text-green-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-slate-400 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Diarsipkan</span>
                        </span>
                      )}
                    </td>
                    {isOwner && (
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          title="Edit Produk"
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product)}
                          title={product.is_active ? 'Nonaktifkan Produk' : 'Aktifkan Produk'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            product.is_active
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-brand-600 hover:bg-brand-50'
                          }`}
                        >
                          {product.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isOwner ? 6 : 5} className="text-center py-12 text-slate-400">
                    Tidak ditemukan produk yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Master Produk' : 'Tambah Produk Baru'}
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SKU / Barcode {editingProduct && '(Tidak dapat diubah)'}
            </label>
            <input
              type="text"
              required
              disabled={Boolean(editingProduct) || modalLoading}
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Contoh: BRG-001"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Produk
            </label>
            <input
              type="text"
              required
              disabled={modalLoading}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Beras Ramos 5kg"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Harga Jual (Rp)
            </label>
            <input
              type="number"
              required
              min="1"
              step="1"
              disabled={modalLoading}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Contoh: 68000"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {editingProduct ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-2 text-xs text-slate-500">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Aturan Bisnis: Stok produk saat ini adalah <strong>{editingProduct.stock} unit</strong>. Mutasi stok hanya dapat dilakukan melalui menu <em>Stok Masuk</em> atau <em>Kasir</em>.
              </span>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
              💡 Stok awal produk baru otomatis <strong>0</strong>. Silakan tambahkan kuantitas barang melalui menu <strong>Stok Masuk</strong> setelah produk disimpan.
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={modalLoading}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingProduct ? 'Perbarui Produk' : 'Simpan Produk'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
