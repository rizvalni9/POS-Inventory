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

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await apiClient.get('/business-profile');
        if (res.data?.success && res.data?.data) {
          setStoreData(res.data.data);
        }
      } catch (e) {
        // Abaikan jika gagal memuat profil usaha
      }
    };
    fetchStore();
  }, []);

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

  // Akumulasi total semua record penjualan yang ditampilkan
  const totalSalesAmount = sales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const totalItemsSold = sales.reduce((sum, s) => sum + (s.items?.reduce((itSum, it) => itSum + it.quantity, 0) || 0), 0);
  const totalCashPaid = sales.reduce((sum, s) => sum + Number(s.cash_paid || 0), 0);
  const totalChangeReturned = sales.reduce((sum, s) => sum + Number(s.change_returned || 0), 0);

  // ==============================================================================
  // FUNGSI: handlePrintReport
  // DESKRIPSI: Mencetak dokumen Laporan Rekapitulasi Penjualan (A4 / PDF)
  // Menjamin latar belakang putih bersih (tidak blank/hitam) di semua browser & tema.
  // ==============================================================================
  const handlePrintReport = () => {
    if (!sales || sales.length === 0) {
      alert('Tidak ada data transaksi penjualan untuk dicetak pada periode ini.');
      return;
    }

    // 1. Tentukan teks label periode tanggal
    let periodeLabel = 'Semua Periode / Hari Ini';
    if (startDate && endDate) {
      periodeLabel = `${startDate} s/d ${endDate}`;
    } else if (startDate) {
      periodeLabel = `Mulai Tanggal ${startDate}`;
    } else if (endDate) {
      periodeLabel = `Sampai Tanggal ${endDate}`;
    }

    const storeName = storeData?.store_name || 'TOKO BERKAH KELONTONG';
    const storeAddress = storeData?.address || 'Padang, Sumatera Barat';
    const storePhone = storeData?.phone ? `Telp: ${storeData.phone}` : '';

    // 2. Susun baris-baris tabel laporan secara dinamis
    const tableRows = sales
      .map((item, index) => {
        const tgl = new Date(item.transaction_date).toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const kasirName = item.cashier?.full_name || item.cashier?.username || '-';
        const memberInfo = item.member ? `${item.member.name} (${item.member.tier})` : '-';
        const totalPcs = item.items?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0;

        return `
          <tr>
            <td style="text-align: center; padding: 6px 4px; border: 1px solid #94a3b8;">${index + 1}</td>
            <td style="font-family: monospace; font-weight: bold; padding: 6px; border: 1px solid #94a3b8;">${item.invoice_number}</td>
            <td style="padding: 6px; border: 1px solid #94a3b8; white-space: nowrap;">${tgl} WIB</td>
            <td style="padding: 6px; border: 1px solid #94a3b8;">${kasirName}</td>
            <td style="padding: 6px; border: 1px solid #94a3b8;">${memberInfo}</td>
            <td style="text-align: center; padding: 6px; border: 1px solid #94a3b8;">${totalPcs} pcs</td>
            <td style="text-align: right; font-weight: bold; padding: 6px; border: 1px solid #94a3b8; white-space: nowrap;">${formatRupiah(item.total_amount)}</td>
          </tr>
        `;
      })
      .join('');

    // 3. Template Dokumen HTML Cetak Resmi (Standar Kertas A4 & Putih Bersih)
    const reportHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>Laporan_Penjualan_${periodeLabel.replace(/[\/\s:]+/g, '_')}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          *, *:before, *:after {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-scheme: light !important;
          }
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            width: 100%;
          }
          .header-container {
            text-align: center;
            border-bottom: 2px solid #000000;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .store-title {
            font-size: 18px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 2px 0;
            color: #000000 !important;
          }
          .store-sub {
            font-size: 10px;
            color: #334155 !important;
            margin: 0 0 4px 0;
          }
          .report-name {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            margin: 4px 0 2px 0;
            color: #166534 !important;
          }
          .period-badge {
            font-size: 10px;
            color: #334155 !important;
            margin: 2px 0 0 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 10px;
          }
          th {
            background-color: #f1f5f9 !important;
            color: #000000 !important;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 9.5px;
            padding: 7px 5px;
            border: 1px solid #94a3b8;
            text-align: left;
          }
          td {
            padding: 5px 6px;
            border: 1px solid #cbd5e1;
            color: #000000 !important;
            vertical-align: middle;
          }
          tr:nth-child(even) td {
            background-color: #f8fafc !important;
          }
          tfoot tr td {
            background-color: #f1f5f9 !important;
            border: 1px solid #94a3b8;
            font-weight: bold;
            color: #000000 !important;
          }
          .signature-container {
            margin-top: 35px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .sig-box {
            text-align: center;
            width: 200px;
            font-size: 11px;
          }
          .sig-space {
            height: 50px;
          }
          .sig-name {
            border-top: 1px solid #000000;
            padding-top: 4px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="store-title">${storeName}</div>
          <div class="store-sub">${storeAddress} ${storePhone ? '| ' + storePhone : ''}</div>
          <div class="report-name">Laporan Rekapitulasi Penjualan</div>
          <div class="period-badge">Periode: <strong>${periodeLabel}</strong> | Waktu Cetak: ${new Date().toLocaleString('id-ID')} WIB</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 28px; text-align: center;">No</th>
              <th style="width: 120px;">No. Invoice</th>
              <th>Tanggal &amp; Waktu</th>
              <th>Kasir</th>
              <th>Member</th>
              <th style="width: 65px; text-align: center;">Item</th>
              <th style="width: 115px; text-align: right;">Total Belanja</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="text-align: right; font-weight: bold; font-size: 10px;">TOTAL KESELURUHAN (${sales.length} TRANSAKSI):</td>
              <td style="text-align: center; font-weight: bold;">${totalItemsSold} pcs</td>
              <td style="text-align: right; font-weight: 800; font-size: 11.5px; color: #166534 !important;">${formatRupiah(totalSalesAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <div class="signature-container">
          <div class="sig-box">
            <div>Dibuat / Diperiksa oleh,</div>
            <div class="sig-space"></div>
            <div class="sig-name">Petugas Kasir</div>
          </div>
          <div class="sig-box">
            <div>Padang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div>Mengetahui,</div>
            <div class="sig-space"></div>
            <div class="sig-name">Pemilik Toko (Owner)</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // 4. Buat iframe dengan ukuran A4 riil agar browser tidak merender halaman kosong
    const oldFrame = document.getElementById('reportPrintFrame');
    if (oldFrame && document.body.contains(oldFrame)) {
      document.body.removeChild(oldFrame);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'reportPrintFrame';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(reportHtml);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print failed:', err);
      } finally {
        setTimeout(() => {
          const frame = document.getElementById('reportPrintFrame');
          if (frame && document.body.contains(frame)) {
            document.body.removeChild(frame);
          }
        }, 1500);
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {isOwner ? 'Riwayat Transaksi Penjualan' : 'Riwayat Penjualan Hari Ini'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isOwner
              ? 'Arsip faktur transaksi penjualan tunai, pencarian histori, dan cetak ulang nota.'
              : 'Daftar transaksi kasir yang diterbitkan pada shift hari ini.'}
          </p>
        </div>

        {isOwner && (
          <div className="flex items-center space-x-2 self-start sm:self-auto bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-300 ml-2" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
              title="Dari Tanggal"
            />
            <span className="text-xs text-slate-400 dark:text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none pr-2 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
              title="Sampai Tanggal"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
                    <span>Memuat riwayat penjualan...</span>
                  </td>
                </tr>
              ) : sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      <div>{sale.invoice_number}</div>
                      {sale.member && (
                        <div className="font-sans text-[11px] font-semibold text-brand-700 dark:text-brand-400 flex items-center space-x-1 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[9px] font-bold">
                            {sale.member.tier}
                          </span>
                          <span>{sale.member.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(sale.transaction_date).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} WIB
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                      {sale.cashier?.full_name || sale.cashier?.username}
                    </td>
                    <td className="px-6 py-4">
                      {sale.items?.length || 0} macam ({sale.items?.reduce((s, it) => s + it.quantity, 0)} pcs)
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {formatRupiah(sale.cash_paid)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {formatRupiah(sale.change_returned)}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-slate-100">
                      {formatRupiah(sale.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenReceipt(sale.id)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
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
            {sales.length > 0 && (
              <tfoot className="bg-slate-50/90 dark:bg-slate-800/80 border-t-2 border-slate-200 dark:border-slate-700">
                <tr>
                  <td colSpan="3" className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Total ({sales.length} Transaksi)
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {totalItemsSold} pcs
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatRupiah(totalCashPaid)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatRupiah(totalChangeReturned)}
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Ringkasan Footer Bawah Tabel */}
        {!loading && sales.length > 0 && (
          <div className="p-4 sm:px-6 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-end gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Total Semua Penjualan:</span>
                <span className="text-sm sm:text-base font-black text-brand-600 dark:text-brand-400">
                  {formatRupiah(totalSalesAmount)}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePrintReport}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 shadow-md shadow-brand-500/20 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Laporan</span>
              </button>
            </div>
          </div>
        )}
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
