// ==============================================================================
// FILE: frontend/src/pages/CashierPage.jsx
// DESKRIPSI: Halaman utama Kasir POS (Point of Sale) terintegrasi Loyalty Member.
// Fitur:
// 1. Katalog Barang: Memuat produk aktif dengan indikator stok warna (Hijau, Kuning, Merah).
// 2. Pencarian Cepat Barang: Menyaring produk secara real-time berdasarkan nama atau barcode SKU.
// 3. Modul Loyalty Member POS:
//    - Autocomplete pencarian member (No HP / Kode / Nama).
//    - Quick Register Member langsung dari meja kasir tanpa meninggalkan keranjang.
//    - Penukaran saldo poin member menjadi diskon belanja (1 Poin = Rp100).
//    - Estimasi perolehan poin transaksi baru berdasarkan tier keanggotaan.
// 4. Keranjang Kasir: Menambah, mengurangi, atau menghapus barang belanjaan pembeli.
// 5. Pembayaran Tunai: Tombol uang pas & shortcut pecahan uang (+10rb, +20rb, +50rb, +100rb).
// 6. Checkout Atomik: Mengirim transaksi ke backend dan langsung memunculkan modal nota struk.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import ReceiptModal from '../components/ReceiptModal';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  ArrowRight,
  Package,
  Award,
  UserCheck,
  UserPlus,
  Coins,
  Sparkles,
  X,
  Phone
} from 'lucide-react';

const CashierPage = () => {
  // === STATE DATA PRODUK ETALASE ===
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // === STATE KERANJANG BELANJA (CART) ===
  const [cart, setCart] = useState([]);

  // === STATE LOYALTY MEMBER DI KASIR ===
  const [memberQuery, setMemberQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [isSearchingMember, setIsSearchingMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isRedeemingPoints, setIsRedeemingPoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  // Quick Register Member Modal
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [quickRegForm, setQuickRegForm] = useState({ name: '', phone: '', email: '', tier: 'Bronze' });
  const [quickRegSubmitting, setQuickRegSubmitting] = useState(false);
  const [quickRegError, setQuickRegError] = useState(null);

  // === STATE PEMBAYARAN & TRANSAKSI ===
  const [cashPaid, setCashPaid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // === STATE MODAL STRUK BELANJA ===
  const [completedSale, setCompletedSale] = useState(null);
  const [storeProfile, setStoreProfile] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // ----------------------------------------------------------------------------
  // 1. MENGAMBIL DAFTAR PRODUK DARI BACKEND
  // ----------------------------------------------------------------------------
  const fetchCatalog = async () => {
    setLoadingProducts(true);
    try {
      const res = await apiClient.get('/products?is_active=true');
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat katalog produk:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // ----------------------------------------------------------------------------
  // 2. AUTOCOMPLETE PENCARIAN MEMBER DI LAYAR KASIR
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (!memberQuery || memberQuery.trim().length < 2) {
      setMemberSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingMember(true);
      try {
        const res = await apiClient.get(`/members/search-quick?q=${encodeURIComponent(memberQuery.trim())}`);
        if (res.data?.success) {
          setMemberSearchResults(res.data.data);
        }
      } catch (err) {
        console.error('Gagal mencari member:', err);
      } finally {
        setIsSearchingMember(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [memberQuery]);

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setMemberQuery('');
    setMemberSearchResults([]);
    setIsRedeemingPoints(false);
    setPointsToRedeem(0);
  };

  const handleRemoveMember = () => {
    setSelectedMember(null);
    setIsRedeemingPoints(false);
    setPointsToRedeem(0);
  };

  // ----------------------------------------------------------------------------
  // 3. PENDAFTARAN CEPAT MEMBER BARU (QUICK REGISTER)
  // ----------------------------------------------------------------------------
  const handleQuickRegister = async (e) => {
    e.preventDefault();
    setQuickRegError(null);
    setQuickRegSubmitting(true);

    try {
      const res = await apiClient.post('/members', {
        name: quickRegForm.name,
        phone: quickRegForm.phone,
        email: quickRegForm.email || null,
        tier: quickRegForm.tier || 'Bronze',
        initial_points: 10
      });

      if (res.data?.success) {
        // Otomatis pilih member baru ini ke transaksi kasir saat ini
        setSelectedMember(res.data.data);
        setIsQuickRegisterOpen(false);
        setQuickRegForm({ name: '', phone: '', email: '', tier: 'Bronze' });
      }
    } catch (err) {
      setQuickRegError(err.response?.data?.message || 'Gagal mendaftarkan member baru.');
    } finally {
      setQuickRegSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------------
  // 4. OPERASI KERANJANG BELANJA (CART OPERATIONS)
  // ----------------------------------------------------------------------------
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert(`Stok produk '${product.name}' habis!`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Jumlah melebihi stok yang tersedia (${product.stock} unit).`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            product_id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            stock: product.stock,
            quantity: 1,
            subtotal: product.price
          }
        ];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              alert(`Kuantitas tidak boleh melebihi stok tersedia (${item.stock} unit).`);
              return item;
            }
            if (newQty <= 0) return null;
            return { ...item, quantity: newQty, subtotal: newQty * item.price };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCashPaid('');
    setCheckoutError(null);
    setSelectedMember(null);
    setIsRedeemingPoints(false);
    setPointsToRedeem(0);
  };

  // ----------------------------------------------------------------------------
  // 5. PERHITUNGAN FINANSIAL & LOYALTY POINTS DI FRONTEND
  // ----------------------------------------------------------------------------
  const subtotalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Perhitungan Diskon Poin Member
  // Maksimal poin yang bisa ditukar dibatasi oleh saldo member atau total belanja (1 Poin = Rp100)
  const maxRedeemablePoints = selectedMember
    ? Math.min(selectedMember.points, Math.floor(subtotalAmount / 100))
    : 0;

  // Jika opsi tukar poin aktif, default tukar seluruh poin yang memungkinkan
  useEffect(() => {
    if (isRedeemingPoints) {
      setPointsToRedeem(maxRedeemablePoints);
    } else {
      setPointsToRedeem(0);
    }
  }, [isRedeemingPoints, maxRedeemablePoints]);

  const discountAmount = isRedeemingPoints ? pointsToRedeem * 100 : 0;
  const netTotal = Math.max(0, subtotalAmount - discountAmount);

  // Estimasi Poin Baru yang Diperoleh
  let estimatedPointsEarned = 0;
  if (selectedMember && netTotal > 0) {
    const multiplierMap = { Bronze: 1.0, Silver: 1.2, Gold: 1.5, Platinum: 2.0 };
    const mult = multiplierMap[selectedMember.tier] || 1.0;
    estimatedPointsEarned = Math.floor((netTotal / 10000) * mult);
  }

  const parsedCashPaid = parseInt(cashPaid, 10) || 0;
  const changeReturned = parsedCashPaid - netTotal;
  const isCashSufficient = parsedCashPaid >= netTotal && netTotal > 0;

  // Tombol jalan pintas pembayaran (Shortcut Buttons)
  const setExactCash = () => setCashPaid(String(netTotal));
  const addCashAmount = (amount) => {
    setCashPaid((prev) => String((parseInt(prev, 10) || 0) + amount));
  };

  // ----------------------------------------------------------------------------
  // 6. MEMPROSES CHECKOUT KE SERVER
  // ----------------------------------------------------------------------------
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!isCashSufficient) {
      setCheckoutError('Nominal uang tunai yang diserahkan kurang dari total belanja.');
      return;
    }

    setCheckoutError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        cash_paid: parsedCashPaid,
        items: cart.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity
        })),
        member_id: selectedMember ? selectedMember.id : null,
        redeem_points: isRedeemingPoints ? pointsToRedeem : 0
      };

      const res = await apiClient.post('/sales/checkout', payload);

      if (res.data?.success) {
        setCompletedSale(res.data.data.sale);
        setStoreProfile(res.data.data.store);
        setIsReceiptOpen(true);
        clearCart();
        fetchCatalog();
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Gagal memproses transaksi kasir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val) => 'Rp' + Number(val || 0).toLocaleString('id-ID');

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-4rem)]">
        {/* ============================================================== */}
        {/* BAGIAN KIRI: ETALASE PRODUK & PENCARIAN (7 Kolom)               */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Pencarian Barang */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pencarian cepat barang (ketik nama atau barcode/SKU)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={fetchCatalog}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Refresh</span>
            </button>
          </div>

          {/* Grid Katalog Produk */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
            {loadingProducts ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && addToCart(p)}
                      className={`relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all select-none ${
                        isOutOfStock
                          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                          : 'bg-white border-slate-200 hover:border-brand-500 hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:scale-95'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-mono text-[10px] text-slate-500 font-semibold px-2 py-0.5 bg-slate-100 rounded-md">
                            {p.sku}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              p.stock > 10
                                ? 'bg-emerald-50 text-emerald-700'
                                : p.stock > 0
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            Stok: {p.stock}
                          </span>
                        </div>
                        <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                          {p.name}
                        </h3>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-brand-700">
                          {formatRupiah(p.price)}
                        </span>
                        <div className="p-1 rounded-lg bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <Package className="w-10 h-10 mb-2 stroke-1" />
                <span className="text-xs">Tidak ditemukan barang yang sesuai.</span>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* BAGIAN KANAN: KERANJANG KASIR & LOYALTY MEMBER (5 Kolom)        */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Keranjang Kasir */}
          <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900">Keranjang Kasir</h2>
              <span className="bg-brand-100 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} item
              </span>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
              >
                Kosongkan
              </button>
            )}
          </div>

          {/* ============================================================== */}
          {/* SEKSI LOYALTY MEMBER DI ATAS KERANJANG                          */}
          {/* ============================================================== */}
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            {!selectedMember ? (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      placeholder="Cari Member (No HP / Kode / Nama)..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {isSearchingMember && (
                      <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3 top-2.5" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsQuickRegisterOpen(true)}
                    className="px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold flex items-center space-x-1 shrink-0 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Member</span>
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {memberSearchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {memberSearchResults.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMember(m)}
                        className="p-2.5 hover:bg-brand-50/70 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{m.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {m.phone} • {m.member_code}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {m.tier}
                          </span>
                          <div className="text-[11px] font-bold text-amber-600 mt-0.5">
                            {m.points} Pts
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* KARTU MEMBER AKTIF DI KASIR */
              <div className="p-2.5 bg-white border border-brand-200 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-brand-50 text-brand-600 rounded-xl">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                        <span>{selectedMember.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                          {selectedMember.tier}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {selectedMember.phone} • {selectedMember.member_code}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveMember}
                    title="Lepas Member"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Saldo Poin & Penukaran Diskon */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 font-bold text-amber-600">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>Saldo: {selectedMember.points} Pts</span>
                    <span className="text-slate-400 font-normal">
                      (≈ {formatRupiah(selectedMember.points * 100)})
                    </span>
                  </div>

                  {selectedMember.points >= 10 && subtotalAmount > 0 && (
                    <label className="flex items-center space-x-1.5 text-xs font-semibold text-brand-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isRedeemingPoints}
                        onChange={(e) => setIsRedeemingPoints(e.target.checked)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span>Tukarkan Poin</span>
                    </label>
                  )}
                </div>

                {/* Preview perolehan poin transaksi ini */}
                {estimatedPointsEarned > 0 && (
                  <div className="text-[11px] text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-xl flex items-center justify-between">
                    <span>Estimasi poin belanja ini:</span>
                    <span className="font-bold">+{estimatedPointsEarned} Pts</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Daftar Barang di Keranjang */}
          <div className="flex-1 p-4 overflow-y-auto divide-y divide-slate-100">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.product_id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {formatRupiah(item.price)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, -1)}
                        className="p-1 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, 1)}
                        className="p-1 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-16 text-right font-bold text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product_id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                <ShoppingCart className="w-8 h-8 mb-2 stroke-1 text-slate-300" />
                <span className="text-xs">Keranjang masih kosong.</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Pilih barang dari katalog di sebelah kiri.</span>
              </div>
            )}
          </div>

          {/* Kotak Bagian Pembayaran & Tombol Bayar */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 space-y-2.5">
            {checkoutError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Rincian Finansial */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Barang:</span>
                <span className="font-semibold text-slate-800">{formatRupiah(subtotalAmount)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Diskon Poin ({pointsToRedeem} Pts):</span>
                  </span>
                  <span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Total Tagihan:
                </span>
                <span className="text-xl font-black text-brand-700">
                  {formatRupiah(netTotal)}
                </span>
              </div>
            </div>

            {/* Input Uang Tunai */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Uang Tunai Diserahkan (Cash)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={cashPaid}
                  onChange={(e) => setCashPaid(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Tombol Pecahan Cepat */}
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={setExactCash}
                  disabled={netTotal === 0}
                  className="p-1.5 text-[10px] font-bold bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40"
                >
                  Uang Pas
                </button>
                <button
                  type="button"
                  onClick={() => addCashAmount(10000)}
                  className="p-1.5 text-[10px] font-bold bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700"
                >
                  +10rb
                </button>
                <button
                  type="button"
                  onClick={() => addCashAmount(20000)}
                  className="p-1.5 text-[10px] font-bold bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700"
                >
                  +20rb
                </button>
                <button
                  type="button"
                  onClick={() => addCashAmount(50000)}
                  className="p-1.5 text-[10px] font-bold bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700"
                >
                  +50rb
                </button>
                <button
                  type="button"
                  onClick={() => addCashAmount(100000)}
                  className="p-1.5 text-[10px] font-bold bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700"
                >
                  +100rb
                </button>
              </div>
            </div>

            {/* Display Uang Kembalian */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="font-semibold text-slate-600">Uang Kembalian:</span>
              <span
                className={`font-black ${
                  changeReturned >= 0 ? 'text-slate-900' : 'text-red-600'
                }`}
              >
                {changeReturned >= 0
                  ? formatRupiah(changeReturned)
                  : `Kurang ${formatRupiah(Math.abs(changeReturned))}`}
              </span>
            </div>

            {/* Tombol Eksekusi Checkout */}
            <button
              type="button"
              disabled={!isCashSufficient || isSubmitting || cart.length === 0}
              onClick={handleCheckout}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 shadow-lg shadow-brand-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses Transaksi...</span>
                </>
              ) : (
                <>
                  <span>Proses Bayar & Cetak Nota</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL PENDAFTARAN CEPAT MEMBER (QUICK REGISTER)                */}
      {/* ============================================================== */}
      {isQuickRegisterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsQuickRegisterOpen(false)}
            />

            <div className="relative bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 z-10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-brand-700">
                  <UserPlus className="w-5 h-5 text-brand-600" />
                  <h3 className="font-bold text-sm text-slate-900">Daftar Member Cepat</h3>
                </div>
                <button
                  onClick={() => setIsQuickRegisterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {quickRegError && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{quickRegError}</span>
                </div>
              )}

              <form onSubmit={handleQuickRegister} className="mt-3 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quickRegForm.name}
                    onChange={(e) => setQuickRegForm({ ...quickRegForm, name: e.target.value })}
                    placeholder="Contoh: Rahmat Hidayat"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={quickRegForm.phone}
                    onChange={(e) => setQuickRegForm({ ...quickRegForm, phone: e.target.value })}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email (Opsional)</label>
                  <input
                    type="email"
                    value={quickRegForm.email}
                    onChange={(e) => setQuickRegForm({ ...quickRegForm, email: e.target.value })}
                    placeholder="email@contoh.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="p-2.5 bg-brand-50 rounded-xl text-[11px] text-brand-800">
                  ✨ Otomatis mendapatkan <span className="font-bold">10 Poin Selamat Datang</span> dan Tier Bronze.
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickRegisterOpen(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={quickRegSubmitting}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-md shadow-brand-600/20 disabled:opacity-50"
                  >
                    {quickRegSubmitting ? 'Mendaftarkan...' : 'Simpan & Pilih'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Popup Nota Cetak Belanja */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        saleData={completedSale}
        storeData={storeProfile}
      />
    </>
  );
};

export default CashierPage;
