// ==============================================================================
// FILE: frontend/src/components/ReceiptModal.jsx
// DESKRIPSI: Modal popup struk transaksi penjualan kasir.
// Didesain presisi menyerupai kertas printer thermal POS (58mm / 80mm).
// Menggunakan CSS print:
// - 'no-print': elemen yang disembunyikan saat dicetak (seperti tombol cetak & tutup).
// - 'print-receipt-container': area struk yang dicetak ke kertas thermal fisik.
// ==============================================================================

import React from 'react';
import { Printer, CheckCircle2, X } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, saleData, storeData }) => {
  // Jika modal sedang ditutup atau belum ada data nota, jangan render apapun
  if (!isOpen || !saleData) return null;

  // Fungsi memicu dialog cetak printer bawaan browser
  const handlePrint = () => {
    window.print();
  };

  // Helper format rupiah (contoh: Rp15.000)
  const formatRupiah = (val) => {
    return 'Rp' + Number(val || 0).toLocaleString('id-ID');
  };

  // Helper format tanggal dan jam transaksi (WIB)
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Latar Belakang Gelap Modal (Otomatis disembunyikan saat cetak via class 'no-print') */}
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm no-print" onClick={onClose} />

        {/* Kotak Kontainer Dialog Struk */}
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-md border border-slate-200">
          
          {/* Header Dialog (Hanya tampil di layar monitor) */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100 no-print">
            <div className="flex items-center space-x-2 text-brand-700">
              <CheckCircle2 className="w-5 h-5 text-brand-600" />
              <span className="font-semibold text-sm">Transaksi Berhasil</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ============================================================== */}
          {/* AREA STRUK THERMAL (Dicetak ke Kertas Printer Fisik)            */}
          {/* ============================================================== */}
          <div className="p-6 bg-white print-receipt-container font-mono text-xs text-slate-800">
            {/* 1. Header Identitas Toko */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
                {storeData?.store_name || 'Toko Berkah OJT'}
              </h2>
              {storeData?.address && (
                <p className="text-[11px] text-slate-600 mt-1">{storeData.address}</p>
              )}
              {storeData?.phone && (
                <p className="text-[11px] text-slate-600">Telp: {storeData.phone}</p>
              )}
            </div>

            {/* 2. Metadata Transaksi (Nomor Faktur, Waktu, dan Kasir) */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Nota:</span>
                <span className="font-bold text-slate-900">{saleData.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{formatDate(saleData.transaction_date || saleData.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span>{saleData.cashier?.full_name || saleData.cashier?.username || 'Kasir'}</span>
              </div>
              {saleData.member && (
                <div className="flex justify-between text-brand-700 font-semibold">
                  <span className="text-slate-500">Member:</span>
                  <span>{saleData.member.name} ({saleData.member.tier})</span>
                </div>
              )}
            </div>

            {/* 3. Daftar Item Barang yang Dibeli */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
              {saleData.items && saleData.items.map((item, index) => (
                <div key={item.id || index} className="space-y-0.5">
                  <div className="font-semibold text-slate-900">{item.product_name_at_sale}</div>
                  <div className="flex justify-between text-slate-600 pl-2">
                    <span>
                      {item.quantity} x {formatRupiah(item.price_at_sale)}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Rincian Total, Diskon Poin, Uang Tunai, dan Kembalian */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-xs">
              {saleData.discount_amount > 0 && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatRupiah(saleData.subtotal_amount || (saleData.total_amount + saleData.discount_amount))}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon Poin ({saleData.points_redeemed} Pts):</span>
                    <span>-{formatRupiah(saleData.discount_amount)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900">
                <span>TOTAL:</span>
                <span>{formatRupiah(saleData.total_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Tunai (Cash):</span>
                <span>{formatRupiah(saleData.cash_paid)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Kembalian:</span>
                <span>{formatRupiah(saleData.change_returned)}</span>
              </div>
            </div>

            {/* 5. Informasi Poin Loyalty Member */}
            {saleData.member && (
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px] bg-slate-50/60 p-2 rounded-lg my-1">
                <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider text-center">
                  -- PROGRAM LOYALTY MEMBER --
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kode Member:</span>
                  <span className="font-mono font-semibold">{saleData.member.member_code}</span>
                </div>
                {saleData.points_earned > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Poin Didapat (TRX Ini):</span>
                    <span>+{saleData.points_earned} Pts</span>
                  </div>
                )}
                {saleData.points_redeemed > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Poin Ditukar:</span>
                    <span>-{saleData.points_redeemed} Pts</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Saldo Poin:</span>
                  <span className="text-amber-600">{saleData.member.points} Pts</span>
                </div>
              </div>
            )}

            {/* 6. Catatan Kaki Struk (Footer Pesan Toko) */}
            <div className="pt-4 text-center text-[10px] text-slate-500 italic space-y-1">
              <p>{storeData?.receipt_footer || 'Terima kasih atas kunjungan Anda.'}</p>
              <p className="text-[9px] text-slate-400">--- Sistem Kasir & Stok P01 ---</p>
            </div>
          </div>

          {/* Tombol Aksi di Layar (Tutup & Cetak Nota) */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3 no-print">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Nota</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
