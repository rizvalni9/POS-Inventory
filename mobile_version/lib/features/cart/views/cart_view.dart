import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/errors/app_exception.dart';
import '../../order_request/viewmodels/order_viewmodel.dart';
import '../../order_request/views/order_detail_view.dart';
import '../models/cart_item_model.dart';
import '../viewmodels/cart_viewmodel.dart';

/// Tampilan Layar Keranjang Belanja Interaktif Pelanggan (FR-CART-01 s/d FR-CART-04)
class CartView extends StatefulWidget {
  final VoidCallback? onBrowseCatalog;

  const CartView({
    super.key,
    this.onBrowseCatalog,
  });

  @override
  State<CartView> createState() => _CartViewState();
}

class _CartViewState extends State<CartView> {
  late TextEditingController _notesController;

  @override
  void initState() {
    super.initState();
    final cartViewModel = context.read<CartViewModel>();
    _notesController = TextEditingController(text: cartViewModel.notes);
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  /// Dialog Konfirmasi Penghapusan 1 Item dari Keranjang (FR-CART-02)
  void _showRemoveItemDialog(
    BuildContext context,
    CartViewModel viewModel,
    CartItemModel item,
  ) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 24),
            SizedBox(width: 8),
            Text(
              'Hapus Barang?',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Text(
          'Apakah Anda yakin ingin menghapus "${item.product.name}" dari keranjang belanja?',
          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              viewModel.removeItem(item.product.id);
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('${item.product.name} telah dihapus dari keranjang.'),
                  backgroundColor: AppColors.textPrimary,
                  behavior: SnackBarBehavior.floating,
                  duration: const Duration(seconds: 2),
                ),
              );
            },
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
  }

  /// Dialog Konfirmasi Mengosongkan Seluruh Keranjang
  void _showClearCartDialog(BuildContext context, CartViewModel viewModel) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.remove_shopping_cart_outlined, color: AppColors.error, size: 24),
            SizedBox(width: 8),
            Text(
              'Kosongkan Keranjang?',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: const Text(
          'Seluruh daftar barang yang telah dipilih akan dihapus dari keranjang belanja Anda.',
          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              viewModel.clearCart();
              _notesController.clear();
              Navigator.pop(ctx);
            },
            child: const Text('Kosongkan'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cartViewModel = context.watch<CartViewModel>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Keranjang Belanja',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        centerTitle: true,
        actions: [
          if (cartViewModel.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep_outlined, color: AppColors.error),
              tooltip: 'Kosongkan Keranjang',
              onPressed: () => _showClearCartDialog(context, cartViewModel),
            ),
        ],
      ),
      body: cartViewModel.isEmpty
          ? _buildEmptyState(context)
          : Column(
              children: [
                Expanded(
                  child: _buildCartContent(context, cartViewModel),
                ),
                _buildBottomCheckoutBar(context, cartViewModel),
              ],
            ),
    );
  }

  /// 1. Tampilan Saat Keranjang Masih Kosong
  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: const BoxDecoration(
                color: AppColors.primaryLight,
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Icon(
                  Icons.shopping_bag_outlined,
                  size: 52,
                  color: AppColors.primary,
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Keranjang Belanja Masih Kosong',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Jelajahi katalog toko kami dan tambahkan berbagai produk kebutuhan Anda ke keranjang.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              onPressed: () {
                if (widget.onBrowseCatalog != null) {
                  widget.onBrowseCatalog!();
                } else if (Navigator.canPop(context)) {
                  Navigator.pop(context);
                }
              },
              icon: const Icon(Icons.storefront_rounded, size: 18),
              label: const Text(
                'Mulai Belanja',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// 2. Tampilan Daftar Item Keranjang
  Widget _buildCartContent(BuildContext context, CartViewModel viewModel) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Info Jumlah Item
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Daftar Produk (${viewModel.uniqueItemCount} jenis barang)',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${viewModel.totalQuantity} Unit Total',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Daftar Card Item (FR-CART-01 & FR-CART-02)
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: viewModel.items.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (ctx, index) {
              final item = viewModel.items[index];
              return _buildCartItemCard(context, viewModel, item);
            },
          ),
          const SizedBox(height: 18),

          // Card Catatan Pesanan Khusus (FR-CART-04)
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: const BorderSide(color: AppColors.cardBorder),
            ),
            child: Padding(
              padding: const EdgeInsets.all(14.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.edit_note_rounded, size: 20, color: AppColors.primary),
                      SizedBox(width: 6),
                      Text(
                        'Catatan Pesanan (Opsional)',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _notesController,
                    maxLines: 2,
                    maxLength: 200,
                    style: const TextStyle(fontSize: 12),
                    decoration: InputDecoration(
                      hintText:
                          'Contoh: Tolong pilihkan kemasan yang rapi dan masa kedaluwarsa paling lama.',
                      hintStyle: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                      contentPadding: const EdgeInsets.all(12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.cardBorder),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                      ),
                      counterText: '',
                    ),
                    onChanged: (val) {
                      viewModel.setNotes(val);
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Banner Penjelasan Estimasi Transparan (FR-CART-03)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF), // Soft Blue
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFBFDBFE)),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline_rounded, size: 18, color: AppColors.primary),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Estimasi total belanja (akan divalidasi ulang saat pemrosesan pesanan oleh kasir toko). Ketersediaan stok fisik dapat berubah sewaktu-waktu.',
                    style: TextStyle(
                      fontSize: 11,
                      color: Color(0xFF1E40AF),
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  /// 3. Card Per Item di Keranjang
  Widget _buildCartItemCard(
    BuildContext context,
    CartViewModel viewModel,
    CartItemModel item,
  ) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: AppColors.cardBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Box Avatar Icon Produk
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.inventory_2_outlined,
                      size: 26,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Nama & Harga Satuan
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.product.name,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${item.priceFormatted} / ${item.product.unit}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),

                // Tombol Hapus Satuan
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, size: 20, color: AppColors.error),
                  tooltip: 'Hapus barang',
                  onPressed: () => _showRemoveItemDialog(context, viewModel, item),
                ),
              ],
            ),
            const Divider(color: AppColors.cardBorder, height: 16),

            // Stepper Kuantitas & Subtotal Harga
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Stepper QTY (FR-CART-01 & FR-CART-02)
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Row(
                    children: [
                      // Tombol Minus: Jika kuantitas 1, memicu dialog hapus
                      InkWell(
                        onTap: () {
                          if (item.quantity == 1) {
                            _showRemoveItemDialog(context, viewModel, item);
                          } else {
                            viewModel.decrementItem(item.product.id);
                          }
                        },
                        borderRadius: const BorderRadius.horizontal(left: Radius.circular(8)),
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          child: Icon(Icons.remove, size: 16, color: AppColors.textPrimary),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        color: AppColors.background,
                        child: Text(
                          '${item.quantity}',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                      // Tombol Plus: Terkunci jika mencapai stok toko
                      InkWell(
                        onTap: item.isStockMaxReached
                            ? null
                            : () {
                                final success = viewModel.incrementItem(item.product.id);
                                if (!success) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        'Maksimal ${item.product.stock} ${item.product.unit} (sesuai stok toko).',
                                      ),
                                      backgroundColor: const Color(0xFFD97706),
                                      behavior: SnackBarBehavior.floating,
                                      duration: const Duration(seconds: 2),
                                    ),
                                  );
                                }
                              },
                        borderRadius: const BorderRadius.horizontal(right: Radius.circular(8)),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          child: Icon(
                            Icons.add,
                            size: 16,
                            color: item.isStockMaxReached ? AppColors.textMuted : AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Subtotal Nominal
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      'Subtotal',
                      style: TextStyle(fontSize: 10, color: AppColors.textMuted),
                    ),
                    Text(
                      item.subtotalFormatted,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// 4. Bilah Bawah Estimasi & Konfirmasi Pembelian (FR-CART-03)
  Widget _buildBottomCheckoutBar(BuildContext context, CartViewModel viewModel) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(
          top: BorderSide(color: AppColors.cardBorder, width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // Ringkasan Estimasi Subtotal
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Total Estimasi:',
                  style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                ),
                Text(
                  viewModel.totalEstimatedAmountFormatted,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),

          // Tombol Konfirmasi Pembelian
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            onPressed: () {
              _showOrderConfirmationSheet(context, viewModel);
            },
            icon: const Icon(Icons.shopping_cart_checkout_rounded, size: 20),
            label: const Text(
              'Konfirmasi Pembelian',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  /// Eksekusi Pengajuan Permintaan Pesanan ke Kasir Toko (FR-ORD-01 s/d FR-ORD-06)
  Future<void> _handleConfirmOrder(BuildContext sheetContext, CartViewModel cartViewModel) async {
    final orderViewModel = context.read<OrderViewModel>();

    // FR-ORD-01: Validasi keranjang belanja tidak kosong
    if (cartViewModel.items.isEmpty) {
      Navigator.pop(sheetContext);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Keranjang belanja masih kosong.'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final itemsPayload = cartViewModel.items.map((it) => {
      'product_id': it.product.id,
      'quantity': it.quantity,
      'price': it.product.price,
    }).toList();

    try {
      final orderResult = await orderViewModel.submitOrder(
        items: itemsPayload,
        notes: cartViewModel.notes,
      );

      if (!mounted) return;

      if (orderResult != null) {
        // FR-ORD-06: Kosongkan keranjang belanja lokal secara otomatis
        cartViewModel.clearCart();
        Navigator.pop(sheetContext); // Tutup lembar konfirmasi

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_outline, color: Colors.white),
                const SizedBox(width: 8),
                Expanded(
                  child: Text('Pesanan #${orderResult.orderNumber} berhasil diajukan!'),
                ),
              ],
            ),
            backgroundColor: const Color(0xFF16A34A),
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 3),
          ),
        );

        // FR-ORD-06: Navigasi langsung ke Layar Detail Permintaan Pesanan
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => OrderDetailView(
              orderId: orderResult.id,
              initialOrder: orderResult,
            ),
          ),
        );
      }
    } on ConflictException catch (e) {
      // FR-ORD-05 / R01: Konflik harga atau stok produk berubah
      if (!mounted) return;
      Navigator.pop(sheetContext);
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: AppColors.warning),
              SizedBox(width: 8),
              Text('Penyesuaian Toko', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Text(
            e.message,
            style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, height: 1.4),
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Tinjau Keranjang', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(sheetContext);
      if (e is! UnauthorizedException) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(orderViewModel.errorMessage ?? 'Gagal mengajukan pesanan. Silakan periksa jaringan.'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            action: SnackBarAction(
              label: 'Coba Lagi',
              textColor: Colors.white,
              onPressed: () {
                orderViewModel.retrySubmitWithSameKey();
              },
            ),
          ),
        );
      }
    }
  }

  /// Lembar Konfirmasi Pembelian (FR-ORD-01 s/d FR-ORD-03)
  void _showOrderConfirmationSheet(BuildContext context, CartViewModel viewModel) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) => Consumer<OrderViewModel>(
        builder: (context, orderViewModel, _) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.cardBorder,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Row(
                  children: [
                    Icon(Icons.shopping_bag_outlined, color: AppColors.primary, size: 24),
                    SizedBox(width: 8),
                    Text(
                      'Konfirmasi Pembelian',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Pesanan Anda akan dikirim ke kasir toko untuk disiapkan. Pembayaran dan pemotongan stok resmi dilakukan saat transaksi di kasir.',
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
                ),
                const Divider(color: AppColors.cardBorder, height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Barang', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
                    Text('${viewModel.totalQuantity} Unit', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Estimasi', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
                    Text(
                      viewModel.totalEstimatedAmountFormatted,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.primary),
                    ),
                  ],
                ),
                if (viewModel.notes.trim().isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Catatan', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          viewModel.notes,
                          textAlign: TextAlign.end,
                          style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: AppColors.textSecondary),
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 20),
                // FR-ORD-03: Tombol otomatis disabled dan loading state saat sedang submit
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: AppColors.primary.withOpacity(0.6),
                    disabledForegroundColor: Colors.white70,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: orderViewModel.isSubmitting
                      ? null
                      : () => _handleConfirmOrder(sheetContext, viewModel),
                  icon: orderViewModel.isSubmitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.check_circle_outline, size: 20),
                  label: Text(
                    orderViewModel.isSubmitting ? 'Mengirim Pesanan...' : 'Konfirmasi & Ajukan Pesanan',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
