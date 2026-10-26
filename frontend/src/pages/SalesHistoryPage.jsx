import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import ReceiptModal from '../components/ReceiptModal';
import {
  History,
  Calendar,
  Printer,
  Eye,
  Loader2,
  FileText
} from 'lucide-react';

const SalesHistoryPage = () => {
  const { role } = useAuth();
  const isOwner = role === 'owner';

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State (Owner only)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Sale for Reprint
  const [selectedSale, setSelectedSale] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    try {
      let query = '';
      if (isOwner && startDate && endDate) {
        query = `?start_date=${startDate}&end_date=${endDate}`;
      } else if (isOwner && startDate) {
        query = `?start_date=${startDate}`;
      }

      const res = await apiClient.get(`/sales${query}`);
      if (res.data?.success) {
        setSales(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load sales history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [startDate, endDate]);

  const handleOpenReceipt = async (saleId) => {
    try {
      const res = await apiClient.get(`/sales/${saleId}`);
      if (res.data?.success) {
        setSelectedSale(res.data.data.sale);
        setStoreData(res.data.data.store);
        setIsReceiptOpen(true);
      }
    } catch (err) {
      alert('Gagal mengambil rincian faktur transaksi.');
    }
  };

  const formatRupiah = (val) => 'Rp' + Number(val || 0).toLocaleString('id-ID');

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {isOwner ? 'Riwayat Transaksi Penjualan' : 'Riwayat Penjualan Hari Ini'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isOwner
              ? 'Arsip faktur transaksi penjualan tunai, pencarian histori, dan cetak ulang nota.'
              : 'Daftar transaksi kasir yang diterbitkan pada shift hari ini.'}
          </p>
        </div>

        {isOwner && (
          <div className="flex items-center space-x-2 self-start sm:self-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-700 focus:outline-none"
              title="Dari Tanggal"
            />
            <span className="text-xs text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-700 focus:outline-none pr-2"
              title="Sampai Tanggal"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">No. Invoice</th>
                <th className="px-6 py-3.5">Tanggal & Waktu</th>
                <th className="px-6 py-3.5">Kasir</th>
                <th className="px-6 py-3.5">Item Terjual</th>
                <th className="px-6 py-3.5">Uang Diterima</th>
                <th className="px-6 py-3.5">Kembalian</th>
                <th className="px-6 py-3.5 text-right">Total Belanja</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
                    <span>Memuat riwayat penjualan...</span>
                  </td>
                </tr>
              ) : sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {sale.invoice_number}
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(sale.transaction_date).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} WIB
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {sale.cashier?.full_name || sale.cashier?.username}
                    </td>
                    <td className="px-6 py-4">
                      {sale.items?.length || 0} macam ({sale.items?.reduce((s, it) => s + it.quantity, 0)} pcs)
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatRupiah(sale.cash_paid)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatRupiah(sale.change_returned)}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">
                      {formatRupiah(sale.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenReceipt(sale.id)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Nota</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 stroke-1 text-slate-300" />
                    <span>Belum ada transaksi pada periode yang dipilih.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal for Reprint */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        saleData={selectedSale}
        storeData={storeData}
      />
    </div>
  );
};

export default SalesHistoryPage;
