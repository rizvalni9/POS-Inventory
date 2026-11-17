import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../cart/viewmodels/cart_viewmodel.dart';
import '../../home/views/main_navigation_shell.dart';
import '../models/product_model.dart';

/// Layar Rincian Produk Khusus Member Customer (FR-CAT-04)
/// Murni membaca data riil master produk dari database kasir toko
class ProductDetailView extends StatefulWidget {
  final ProductModel product;

  const ProductDetailView({super.key, required this.product});

  @override
  State<ProductDetailView> createState() => _ProductDetailViewState();
}

class _ProductDetailViewState extends State<ProductDetailView> {
  int _quantity = 1;

  @override
  void initState() {
    super.initState();
    // Jika stok produk kosong, kuantitas disetel ke 0
    if (widget.product.stock <= 0) {
      _quantity = 0;
    }
  }

  Color _getStockColor(String status) {
    switch (status.toLowerCase()) {
      case 'available':
        return AppColors.success;
      case 'limited':
      case 'low_stock':
        return const Color(0xFFD97706); // Amber untuk Produk Terbatas
      case 'out_of_stock':
      default:
        return AppColors.error;
    }
  }

  Color _getStockBgColor(String status) {
    switch (status.toLowerCase()) {
      case 'available':
        return AppColors.successLight;
      case 'limited':
      case 'low_stock':
        return AppColors.warningLight;
      case 'out_of_stock':
      default:
        return AppColors.errorLight;
    }
  }

  IconData _getStockIcon(String status) {
    switch (status.toLowerCase()) {
      case 'available':
        return Icons.check_circle_rounded;
      case 'limited':
      case 'low_stock':
        return Icons.warning_amber_rounded;
      case 'out_of_stock':
      default:
        return Icons.cancel_rounded;
    }
  }

  /// Fitur penambahan kuantitas terlimit sesuai stok fisik database toko
  void _increment() {
    if (!widget.product.isAvailable) return;
    if (_quantity < widget.product.stock) {
      setState(() {
        _quantity++;
      });
    } else {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Maksimum pemesanan adalah ${widget.product.stock} ${widget.product.unit} sesuai stok kasir.',
          ),
          backgroundColor: const Color(0xFFD97706),
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  /// Fitur pengurangan kuantitas minimal 1
  void _decrement() {
    if (_quantity > 1) {
      setState(() {
        _quantity--;
      });
    }
  }

  void _addToCart() {
    if (!widget.product.isAvailable || _quantity <= 0) return;

    final cartViewModel = context.read<CartViewModel>();
    cartViewModel.addItem(widget.product, quantity: _quantity);

    final totalPrice = widget.product.price * _quantity;
    final totalFormatted = CurrencyFormatter.format(totalPrice);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                '${widget.product.name} ($_quantity ${widget.product.unit}) berhasil masuk keranjang ($totalFormatted)',
                style: const TextStyle(fontSize: 13),
              ),
            ),
          ],
        ),
        action: SnackBarAction(
          label: 'Lihat',
          textColor: Colors.amberAccent,
          onPressed: () {
            ScaffoldMessenger.of(context).hideCurrentSnackBar();
            MainNavigationController.switchTo(1);
          },
        ),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final stockColor = _getStockColor(product.stockStatus);
    final stockBg = _getStockBgColor(product.stockStatus);
    final stockIcon = _getStockIcon(product.stockStatus);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Detail Produk',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Gambar / Avatar Header Produk
            Container(
              height: 180,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    AppColors.primaryLight,
                    Colors.white,
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.06),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.inventory_2_outlined,
                        size: 50,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      product.category,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Card Rincian Informasi Produk Riil dari Database Toko
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: AppColors.cardBorder),
              ),
              child: Padding(
                padding: const EdgeInsets.all(18.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Badge Status Stok Dinamis & Barcode SKU
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: stockBg,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: stockColor.withValues(alpha: 0.3)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(stockIcon, size: 14, color: stockColor),
                              const SizedBox(width: 5),
                              Text(
                                product.stockDisplay,
                                style: TextStyle(
                                  color: stockColor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (product.barcode != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.background,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: AppColors.cardBorder),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.qr_code_2_rounded, size: 14, color: AppColors.textSecondary),
                                const SizedBox(width: 4),
                                Text(
                                  product.barcode!,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColors.textSecondary,
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Nama Produk
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Harga Resmi Toko & Satuan
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          CurrencyFormatter.format(product.price),
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '/ ${product.unit}',
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Card Informasi Stok & Kebijakan Kasir Toko
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: AppColors.cardBorder),
              ),
              child: Padding(
                padding: const EdgeInsets.all(18.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.store_mall_directory_outlined, size: 18, color: AppColors.primary),
                        SizedBox(width: 8),
                        Text(
                          'Informasi Ketersediaan Toko',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    const Divider(color: AppColors.cardBorder, height: 20),
                    _buildInfoRow('Barcode / SKU', product.barcode ?? '-'),
                    const SizedBox(height: 10),
                    _buildInfoRow('Kategori Barang', product.category),
                    const SizedBox(height: 10),
                    _buildInfoRow('Satuan Penjualan', product.unit),
                    const SizedBox(height: 10),
                    _buildInfoRow(
                      'Stok Tersedia di Toko',
                      '${product.stock}',
                      highlightColor: product.stock > 0 ? stockColor : AppColors.error,
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline, size: 18, color: AppColors.primary),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Pesanan Anda akan disiapkan dan divalidasi langsung oleh kasir toko sesuai stok fisik yang tersedia.',
                              style: TextStyle(fontSize: 11, color: AppColors.textSecondary, height: 1.4),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 100), // Space for bottom bar
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 10,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Info pembatas stok toko (Requirement 3)
                if (product.isAvailable)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Kapasitas Maksimal:',
                          style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                        Text(
                          '${product.stock} ${product.unit} (Sesuai Stok Kasir)',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: _quantity >= product.stock ? const Color(0xFFD97706) : AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                Row(
                  children: [
                    // Tombol Kurang & Tambah QTY (Terlimit sampai stok toko)
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove, size: 18),
                            onPressed: (!product.isAvailable || _quantity <= 1) ? null : _decrement,
                          ),
                          Text(
                            '$_quantity',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add, size: 18),
                            // Terkunci jika kuantitas telah mencapai stok database toko
                            onPressed: (!product.isAvailable || _quantity >= product.stock)
                                ? null
                                : _increment,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Button Tambah ke Keranjang
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: product.isAvailable ? AppColors.primary : AppColors.textMuted,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: (product.isAvailable && _quantity > 0) ? _addToCart : null,
                        icon: const Icon(Icons.add_shopping_cart_rounded, size: 20),
                        label: Text(
                          product.isAvailable
                              ? 'Tambah • ${CurrencyFormatter.format(product.price * _quantity)}'
                              : 'Stok Sedang Habis',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {Color? highlightColor}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 150,
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textMuted,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        const Text(': ', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 12,
              color: highlightColor ?? AppColors.textPrimary,
              fontWeight: highlightColor != null ? FontWeight.bold : FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
