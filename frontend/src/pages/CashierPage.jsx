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
  Package
} from 'lucide-react';

const CashierPage = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);

  // Payment State
  const [cashPaid, setCashPaid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // Completed Receipt Modal State
  const [completedSale, setCompletedSale] = useState(null);
  const [storeProfile, setStoreProfile] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const fetchCatalog = async () => {
    setLoadingProducts(true);
    try {
      const res = await apiClient.get('/products?is_active=true');
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load active catalog:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Cart operations
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
  };

  // Calculations
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const parsedCashPaid = parseInt(cashPaid, 10) || 0;
  const changeReturned = parsedCashPaid - totalAmount;
  const isCashSufficient = parsedCashPaid >= totalAmount && totalAmount > 0;

  // Preset cash buttons
  const setExactCash = () => setCashPaid(String(totalAmount));
  const addCashAmount = (amount) => {
    setCashPaid((prev) => String((parseInt(prev, 10) || 0) + amount));
  };

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
        }))
      };

      const res = await apiClient.post('/sales/checkout', payload);

      if (res.data?.success) {
        setCompletedSale(res.data.data.sale);
        setStoreProfile(res.data.data.store);
        setIsReceiptOpen(true);
        clearCart();
        // Refresh catalog to reflect new remaining stock
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
        {/* Left Side: Product Catalog Picker (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Catalog Search Header */}
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
              onClick={fetchCatalog}
              className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-end sm:self-auto"
            >
              Refresh Katalog
            </button>
          </div>

          {/* Product Items Grid */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
            {loadingProducts ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-brand-600" />
                <span className="text-xs">Memuat katalog produk etalase...</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product)}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${isOutOfStock
                          ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                          : 'bg-white hover:bg-brand-50/50 border-slate-200 hover:border-brand-300 hover:shadow-md active:scale-95'
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {product.sku}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${product.stock > 10
                                ? 'bg-green-100 text-green-800'
                                : product.stock > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                          >
                            Stok: {product.stock}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                          {product.name}
                        </h4>
                      </div>
                      <div className="mt-3 text-xs font-black text-brand-700">
                        {formatRupiah(product.price)}
                      </div>
                    </button>
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

        {/* Right Side: Cart, Payment & Checkout (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
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

          {/* Cart Items List */}
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

          {/* Payment & Checkout Section */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 space-y-3">
            {checkoutError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Total Grand Amount */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Total Belanja:
              </span>
              <span className="text-xl font-black text-brand-700">
                {formatRupiah(totalAmount)}
              </span>
            </div>

            {/* Cash Input */}
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

              {/* Quick Cash Buttons */}
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={setExactCash}
                  disabled={totalAmount === 0}
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

            {/* Change Display */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="font-semibold text-slate-600">Uang Kembalian:</span>
              <span
                className={`font-black ${changeReturned >= 0 ? 'text-slate-900' : 'text-red-600'
                  }`}
              >
                {changeReturned >= 0 ? formatRupiah(changeReturned) : `Kurang ${formatRupiah(Math.abs(changeReturned))}`}
              </span>
            </div>

            {/* Checkout Submit Button */}
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

      {/* Completed Sale Receipt Modal */}
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
