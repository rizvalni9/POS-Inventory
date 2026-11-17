import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../models/receipt_model.dart';
import '../viewmodels/receipt_viewmodel.dart';

/// Layanan Tampilan Struk Nota Kasir Digital Resmi (FR-RCP-01 s/d FR-RCP-04)
class ReceiptDetailView extends StatefulWidget {
  final int saleId;

  const ReceiptDetailView({
    super.key,
    required this.saleId,
  });

  @override
  State<ReceiptDetailView> createState() => _ReceiptDetailViewState();
}

class _ReceiptDetailViewState extends State<ReceiptDetailView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ReceiptViewModel>().loadReceipt(widget.saleId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<ReceiptViewModel>();

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), // Slate background to make white thermal receipt pop
      appBar: AppBar(
        title: const Text(
          'Nota Belanja Resmi',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Segarkan Nota',
            onPressed: () => viewModel.loadReceipt(widget.saleId),
          ),
        ],
      ),
      body: Builder(
        builder: (context) {
          if (viewModel.state == ReceiptViewState.loading) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: AppColors.primary),
                  SizedBox(height: 16),
                  Text(
                    'Mengambil arsip nota resmi...',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                ],
              ),
            );
          }

          if (viewModel.state == ReceiptViewState.error) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.receipt_long_outlined, size: 64, color: AppColors.error),
                    const SizedBox(height: 16),
                    Text(
                      viewModel.errorMessage ?? 'Gagal memuat nota penjualan.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () => viewModel.loadReceipt(widget.saleId),
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Coba Lagi'),
                    ),
                  ],
                ),
              ),
            );
          }

          final receipt = viewModel.receipt;
          if (receipt == null) {
            return const Center(child: Text('Data nota tidak ditemukan.'));
          }

          return RefreshIndicator(
            onRefresh: () => viewModel.loadReceipt(widget.saleId),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              child: Column(
                children: [
                  _buildThermalReceiptCard(receipt),
                  const SizedBox(height: 24),
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.textSecondary,
                      side: const BorderSide(color: AppColors.cardBorder),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      backgroundColor: Colors.white,
                    ),
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back_rounded, size: 18),
                    label: const Text('Kembali ke Riwayat Pesanan'),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  /// Membangun Struk Thermal Resmi (FR-RCP-03 & FR-RCP-04)
  Widget _buildThermalReceiptCard(ReceiptModel receipt) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Header Toko
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.storefront_rounded, color: AppColors.primary, size: 32),
                ),
                const SizedBox(height: 12),
                Text(
                  receipt.storeInfo.name.toUpperCase(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  receipt.storeInfo.address,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 2),
                Text(
                  'Telp: ${receipt.storeInfo.phone}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),

          _buildDashedDivider(),

          // 2. Info Transaksi & Kasir
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              children: [
                _buildReceiptRow('No. Invoice', receipt.invoiceNumber, isBold: true),
                const SizedBox(height: 6),
                _buildReceiptRow('Tanggal & Jam', DateFormatter.formatFull(receipt.transactionDate)),
                const SizedBox(height: 6),
                _buildReceiptRow('Kasir', receipt.cashierName),
                if (receipt.member != null) ...[
                  const SizedBox(height: 6),
                  _buildReceiptRow(
                    'Pelanggan / Member',
                    '${receipt.member!.name} (${receipt.member!.memberCode})',
                  ),
                ],
              ],
            ),
          ),

          _buildDashedDivider(),

          // 3. Rincian Item Barang (Snapshot Belanja)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('ITEM BELANJA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                    Text('SUBTOTAL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                  ],
                ),
                const SizedBox(height: 10),
                ...receipt.items.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
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
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${item.quantity} x ${CurrencyFormatter.format(item.unitPrice)}',
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
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
                        ],
                      ),
                    )),
              ],
            ),
          ),

          _buildDashedDivider(),

          // 4. Ringkasan Finansial
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              children: [
                _buildReceiptRow('Subtotal Belanja', CurrencyFormatter.format(receipt.financials.subtotal)),
                if (receipt.financials.discountAmount > 0) ...[
                  const SizedBox(height: 6),
                  _buildReceiptRow(
                    'Diskon Poin Member',
                    '-${CurrencyFormatter.format(receipt.financials.discountAmount)}',
                    color: AppColors.error,
                  ),
                ],
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'TOTAL AKHIR',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                    Text(
                      CurrencyFormatter.format(receipt.financials.finalTotal),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                _buildReceiptRow('Metode Bayar', receipt.financials.paymentMethod),
                const SizedBox(height: 6),
                _buildReceiptRow('Nominal Tunai', CurrencyFormatter.format(receipt.financials.paymentAmount)),
                const SizedBox(height: 6),
                _buildReceiptRow('Kembalian', CurrencyFormatter.format(receipt.financials.changeAmount)),
              ],
            ),
          ),

          // 5. Poin Loyalitas Member (Jika Ada)
          if (receipt.member != null) ...[
            _buildDashedDivider(),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF9C3), // Soft yellow
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFFDE047)),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.stars_rounded, color: Color(0xFFD97706), size: 18),
                      const SizedBox(width: 8),
                      const Text(
                        'POIN LOYALITAS BELANJA',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFB45309),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Poin Diperoleh Hari Ini', style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
                      Text(
                        '+${receipt.member!.pointsEarned} Poin',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF16A34A)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Saldo Poin Anda', style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
                      Text(
                        '${receipt.member!.currentPoints} Poin',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],

          _buildDashedDivider(),

          // 6. Catatan Kaki (Footer Note)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            child: Column(
              children: [
                Text(
                  receipt.footerMessage,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 12,
                    fontStyle: FontStyle.italic,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 16),
                // Kode barcode dekoratif bergaya kasir
                Container(
                  height: 36,
                  width: 200,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: List.generate(
                      24,
                      (index) => Container(
                        width: index % 3 == 0 ? 3 : (index % 2 == 0 ? 2 : 1),
                        height: 24,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  receipt.invoiceNumber,
                  style: const TextStyle(
                    fontSize: 10,
                    fontFamily: 'monospace',
                    letterSpacing: 2,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value, {bool isBold = false, Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
              color: color ?? AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDashedDivider() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final boxWidth = constraints.constrainWidth();
          const dashWidth = 5.0;
          const dashHeight = 1.0;
          final dashCount = (boxWidth / (2 * dashWidth)).floor();
          return Flex(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            direction: Axis.horizontal,
            children: List.generate(dashCount, (_) {
              return SizedBox(
                width: dashWidth,
                height: dashHeight,
                child: const DecoratedBox(
                  decoration: BoxDecoration(color: Color(0xFFCBD5E1)),
                ),
              );
            }),
          );
        },
      ),
    );
  }
}

