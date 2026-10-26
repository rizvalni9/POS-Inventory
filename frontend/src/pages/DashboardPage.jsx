import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import apiClient from '../api/axios';
import {
  DollarSign,
  Receipt,
  PackageCheck,
  Calendar,
  ArrowRight,
  ShoppingCart,
  ArrowDownToLine,
  Package,
  TrendingUp,
  Loader2
} from 'lucide-react';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [summary, setSummary] = useState({
    total_sales_count: 0,
    total_revenue: 0,
    total_items_sold: 0,
    sales: []
  });

  const fetchSummary = async (date) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/reports/daily-summary?date=${date}`);
      if (res.data?.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch daily summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate]);

  const formatRupiah = (val) => 'Rp' + Number(val || 0).toLocaleString('id-ID');

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Ringkasan Operasional Toko</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau arus kas harian, pergerakan transaksi kasir, dan volume penjualan secara real-time.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold bg-transparent text-slate-700 focus:outline-none pr-2"
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Omset */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white p-6 rounded-3xl shadow-lg shadow-brand-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-100">
                Penerimaan Kas (Omset)
              </span>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-3">
              {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : formatRupiah(summary.total_revenue)}
            </div>
            <p className="text-[11px] text-brand-200 mt-2 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Pendapatan kas bersih tervalidasi</span>
            </p>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Transaksi Selesai
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            {loading ? <Loader2 className="w-7 h-7 animate-spin text-slate-400" /> : `${summary.total_sales_count} Nota`}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Faktur belanja berhasil diproses
          </p>
        </div>

        {/* Total Item Terjual */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Barang Terjual
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            {loading ? <Loader2 className="w-7 h-7 animate-spin text-slate-400" /> : `${summary.total_items_sold} Unit`}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Total kuantitas barang keluar etalase
          </p>
        </div>
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NavLink
          to="/pos"
          className="group flex items-center justify-between p-4 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-2xl shadow-sm transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Buka Kasir POS</div>
              <div className="text-xs text-slate-500">Mulai transaksi penjualan baru</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </NavLink>

        <NavLink
          to="/stock-in"
          className="group flex items-center justify-between p-4 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl shadow-sm transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Input Stok Masuk</div>
              <div className="text-xs text-slate-500">Catat kiriman barang pemasok</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </NavLink>

        <NavLink
          to="/products"
          className="group flex items-center justify-between p-4 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-2xl shadow-sm transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Katalog Produk</div>
              <div className="text-xs text-slate-500">Kelola master harga & SKU</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
        </NavLink>
      </div>

      {/* Sales Transactions on Selected Date */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Daftar Transaksi Tanggal {selectedDate}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian faktur penjualan tunai yang diterbitkan pada hari ini.
            </p>
          </div>
          <NavLink
            to="/sales-history"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>Semua Riwayat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">No. Invoice</th>
                <th className="px-6 py-3.5">Waktu</th>
                <th className="px-6 py-3.5">Kasir</th>
                <th className="px-6 py-3.5">Jumlah Item</th>
                <th className="px-6 py-3.5 text-right">Total Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <span>Memuat data transaksi...</span>
                  </td>
                </tr>
              ) : summary.sales && summary.sales.length > 0 ? (
                summary.sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {sale.invoice_number}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(sale.transaction_date).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} WIB
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800">
                        {sale.cashier?.full_name || sale.cashier?.username}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {sale.items?.reduce((sum, it) => sum + it.quantity, 0)} item
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {formatRupiah(sale.total_amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">
                    Belum ada transaksi penjualan tunai pada tanggal {selectedDate}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
