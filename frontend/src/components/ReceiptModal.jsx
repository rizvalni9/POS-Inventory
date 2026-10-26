import React from 'react';
import { Printer, CheckCircle2, X } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, saleData, storeData }) => {
  if (!isOpen || !saleData) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (val) => {
    return 'Rp' + Number(val || 0).toLocaleString('id-ID');
  };

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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm no-print" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-md border border-slate-200">
          {/* Header Actions (Screen Only) */}
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

          {/* Thermal Receipt Paper (Visible on screen and during print) */}
          <div className="p-6 bg-white print-receipt-container font-mono text-xs text-slate-800">
            {/* Store Header */}
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

            {/* Transaction Metadata */}
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
            </div>

            {/* Items List */}
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

            {/* Calculation Totals */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-xs">
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

            {/* Store Receipt Footer */}
            <div className="pt-4 text-center text-[10px] text-slate-500 italic space-y-1">
              <p>{storeData?.receipt_footer || 'Terima kasih atas kunjungan Anda.'}</p>
              <p className="text-[9px] text-slate-400">--- Sistem Kasir & Stok P01 ---</p>
            </div>
          </div>

          {/* Screen Actions (No-print) */}
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
