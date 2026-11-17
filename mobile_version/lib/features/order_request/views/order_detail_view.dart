import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../../receipt/views/receipt_detail_view.dart';
import '../models/order_request_model.dart';
import '../viewmodels/order_viewmodel.dart';

/// Layar Detail & Pelacakan Status Permintaan Pesanan (FR-TRK-02 s/d FR-TRK-04)
class OrderDetailView extends StatefulWidget {
  final int orderId;
  final OrderRequestModel? initialOrder;

  const OrderDetailView({
    super.key,
    required this.orderId,
    this.initialOrder,
  });

  @override
  State<OrderDetailView> createState() => _OrderDetailViewState();
}

class _OrderDetailViewState extends State<OrderDetailView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderViewModel>().loadOrderDetail(widget.orderId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<OrderViewModel>();
    final order = viewModel.selectedOrder?.id == widget.orderId
        ? viewModel.selectedOrder
        : widget.initialOrder;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Detail Permintaan Pesanan',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Perbarui Status',
            onPressed: () => viewModel.loadOrderDetail(widget.orderId),
          ),
        ],
      ),
      body: viewModel.isLoadingDetail && order == null
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: AppColors.primary),
                  SizedBox(height: 16),
                  Text(
                    'Memuat status pesanan...',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                ],
              ),
            )
          : order == null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 64, color: AppColors.error),
                        const SizedBox(height: 16),
                        Text(
                          viewModel.errorMessage ?? 'Pesanan tidak ditemukan.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                          onPressed: () => viewModel.loadOrderDetail(widget.orderId),
                          child: const Text('Coba Lagi', style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => viewModel.loadOrderDetail(widget.orderId),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // 1. Status Badge Banner
                        _buildStatusBanner(order),
                        const SizedBox(height: 16),

                        // 2. Info Nomor & Waktu Pengajuan
                        _buildOrderMetaCard(context, order),
                        const SizedBox(height: 16),

                        // 3. Rincian Barang yang Dipesan
                        _buildOrderItemsCard(order),
                        const SizedBox(height: 16),

                        // 4. Catatan Pesanan
                        if (order.notes != null && order.notes!.trim().isNotEmpty) ...[
                          _buildNotesCard(order.notes!),
                          const SizedBox(height: 16),
                        ],

                        // 5. Total Estimasi Belanja
                        _buildTotalCard(order),
                        const SizedBox(height: 20),

                        // 6. Tombol Aksi Tautan Nota Resmi (FR-TRK-04)
                        if (order.status == OrderRequestStatus.completed && order.saleId != null) ...[
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF16A34A), // Hijau Sukses
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 2,
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ReceiptDetailView(saleId: order.saleId!),
                                ),
                              );
                            },
                            icon: const Icon(Icons.receipt_long_rounded, size: 22),
                            label: const Text(
                              'Lihat Nota Penjualan Resmi',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],

                        // 7. Tombol Simulasi Transaksi Kasir (OJT Demo / Testing Tool)
                        if (order.status == OrderRequestStatus.pending) ...[
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFBFDBFE)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                const Row(
                                  children: [
                                    Icon(Icons.point_of_sale_rounded, color: AppColors.primary, size: 20),
                                    SizedBox(width: 8),
                                    Text(
                                      'Simulasi Kasir Toko (OJT BPVP)',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                const Text(
                                  'Fitur simulasi untuk memvalidasi alur Modul 5 (Tracking) ke Modul 6 (Receipt) saat kasir menyelesaikan transaksi belanja.',
                                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary, height: 1.4),
                                ),
                                const SizedBox(height: 12),
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  onPressed: () async {
                                    final success = await viewModel.simulateCompleteOrder(order.id);
                                    if (mounted && success) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('Pesanan berhasil diselesaikan kasir! Nota telah terbit.'),
                                          backgroundColor: Color(0xFF16A34A),
                                          behavior: SnackBarBehavior.floating,
                                        ),
                                      );
                                    }
                                  },
                                  icon: const Icon(Icons.check_circle_outline, size: 18),
                                  label: const Text('Simulasikan Pembayaran Kasir'),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Tombol kembali
                        OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.cardBorder),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Kembali', style: TextStyle(color: AppColors.textPrimary)),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
    );
  }

  /// Banner Status Permintaan Pesanan Visual (FR-TRK-01)
  Widget _buildStatusBanner(OrderRequestModel order) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: order.status.backgroundColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: order.status.color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: Icon(order.status.icon, color: order.status.color, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order.status.label,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: order.status.color,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _getStatusExplanation(order.status),
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getStatusExplanation(OrderRequestStatus status) {
    switch (status) {
      case OrderRequestStatus.pending:
        return 'Pesanan telah masuk ke sistem antrean kasir toko dan menunggu untuk disiapkan.';
      case OrderRequestStatus.processing:
        return 'Petugas toko sedang menyiapkan barang belanjaan Anda di etalase fisik.';
      case OrderRequestStatus.completed:
        return 'Pesanan telah ditransaksikan dan nota resmi toko telah diterbitkan.';
      case OrderRequestStatus.cancelled:
        return 'Pesanan dibatalkan oleh petugas toko karena stok fisik tidak mencukupi.';
    }
  }

  /// Info Nomor Pesanan & Waktu
  Widget _buildOrderMetaCard(BuildContext context, OrderRequestModel order) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.cardBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Nomor Pesanan', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                Row(
                  children: [
                    Text(
                      order.orderNumber,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 6),
                    InkWell(
                      onTap: () {
                        Clipboard.setData(ClipboardData(text: order.orderNumber));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Nomor pesanan disalin ke clipboard'),
                            duration: Duration(seconds: 1),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                      child: const Icon(Icons.copy_rounded, size: 16, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ],
            ),
            const Divider(color: AppColors.cardBorder, height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Waktu Pengajuan', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                Text(
                  DateFormatter.formatFull(order.createdAt),
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
                ),
              ],
            ),
            if (order.updatedAt != null) ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Pembaruan Terakhir', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  Text(
                    DateFormatter.formatFull(order.updatedAt),
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Rincian Item Barang
  Widget _buildOrderItemsCard(OrderRequestModel order) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.cardBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Daftar Barang Belanja',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                Text(
                  '${order.items.length} Item',
                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                ),
              ],
            ),
            const Divider(color: AppColors.cardBorder, height: 20),
            ...order.items.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.inventory_2_outlined, size: 20, color: AppColors.primary),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.productName,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${item.quantity} Unit x ${CurrencyFormatter.format(item.unitPrice)}',
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        CurrencyFormatter.format(item.subtotal),
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }

  /// Catatan Pelanggan
  Widget _buildNotesCard(String notes) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.cardBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.notes_rounded, size: 18, color: AppColors.textSecondary),
                SizedBox(width: 8),
                Text(
                  'Catatan Pembeli',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              notes,
              style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  /// Total Estimasi
  Widget _buildTotalCard(OrderRequestModel order) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.cardBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Total Estimasi', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                Text(
                  'Harga resmi divalidasi kasir',
                  style: TextStyle(fontSize: 10, color: AppColors.textMuted),
                ),
              ],
            ),
            Text(
              CurrencyFormatter.format(order.totalEstimatedAmount),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

