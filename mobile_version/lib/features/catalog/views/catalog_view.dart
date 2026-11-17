import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../models/product_model.dart';
import '../viewmodels/catalog_viewmodel.dart';
import 'product_detail_view.dart';

/// Layar Utama Penjelajahan Katalog Produk Customer (FR-CAT-01 s/d FR-CAT-05)
class CatalogView extends StatefulWidget {
  const CatalogView({super.key});

  @override
  State<CatalogView> createState() => _CatalogViewState();
}

class _CatalogViewState extends State<CatalogView> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();

  final List<String> _categories = [
    'Semua',
    'Sembako & Ritel',
    'Beras',
    'Minyak',
    'Gula & Bumbu',
    'Minuman',
  ];

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CatalogViewModel>().loadProducts();
    });
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      context.read<CatalogViewModel>().loadMore();
    }
  }

  Color _getStockColor(String status) {
    switch (status.toLowerCase()) {
      case 'available':
        return AppColors.success;
      case 'limited':
      case 'low_stock':
        return const Color(0xFFD97706);
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

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<CatalogViewModel>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Katalog Toko',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Segarkan Katalog',
            onPressed: viewModel.isLoading ? null : viewModel.refresh,
          ),
        ],
      ),
      body: Column(
        children: [
          // 1. Bilah Pencarian Produk Instan dengan Debounce (FR-CAT-02)
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
            child: TextField(
              controller: _searchController,
              onChanged: (val) {
                viewModel.setSearchQuery(val);
                setState(() {}); // Untuk toggle icon clear
              },
              decoration: InputDecoration(
                hintText: 'Cari nama produk atau barcode...',
                hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary, size: 22),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18, color: AppColors.textSecondary),
                        onPressed: () {
                          _searchController.clear();
                          viewModel.setSearchQuery('');
                          setState(() {});
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.background,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.cardBorder),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.cardBorder),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                ),
              ),
            ),
          ),

          // 2. Kategori Filter Chips Bar
          Container(
            color: Colors.white,
            height: 48,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              separatorBuilder: (context, index) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final category = _categories[index];
                final isSelected = viewModel.selectedCategory == category;

                return ChoiceChip(
                  label: Text(
                    category,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: AppColors.primary,
                  backgroundColor: AppColors.background,
                  showCheckmark: false,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected ? AppColors.primary : AppColors.cardBorder,
                    ),
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      viewModel.setCategory(category);
                    }
                  },
                );
              },
            ),
          ),
          const Divider(height: 1, color: AppColors.cardBorder),

          // 3. Area Tampilan State (Loading, Error, Empty, Success) (FR-CAT-01 s/d FR-CAT-05)
          Expanded(
            child: _buildContent(viewModel),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(CatalogViewModel viewModel) {
    // 3.1. Loading State
    if (viewModel.isLoading || viewModel.state == CatalogViewState.initial) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(height: 16),
            Text(
              'Memuat katalog produk aktif...',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
          ],
        ),
      );
    }

    // 3.2. Error State
    if (viewModel.isError) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: AppColors.errorLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.cloud_off_rounded, size: 48, color: AppColors.error),
              ),
              const SizedBox(height: 16),
              const Text(
                'Gagal Memuat Produk',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 8),
              Text(
                viewModel.errorMessage ?? 'Terjadi kesalahan sistem saat menghubungi server toko.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () => viewModel.loadProducts(),
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      );
    }

    // 3.3. Empty State
    if (viewModel.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: AppColors.primaryLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.search_off_rounded, size: 48, color: AppColors.primary),
              ),
              const SizedBox(height: 16),
              const Text(
                'Produk Tidak Ditemukan',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 8),
              Text(
                viewModel.searchQuery.isNotEmpty
                    ? 'Tidak ada barang yang cocok dengan kata kunci "${viewModel.searchQuery}".'
                    : 'Belum ada produk aktif yang tersedia pada kategori ini.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 20),
              if (viewModel.searchQuery.isNotEmpty || viewModel.selectedCategory != 'Semua')
                OutlinedButton.icon(
                  onPressed: () {
                    _searchController.clear();
                    viewModel.setSearchQuery('');
                    viewModel.setCategory('Semua');
                    setState(() {});
                  },
                  icon: const Icon(Icons.filter_alt_off_rounded, size: 16),
                  label: const Text('Reset Filter & Pencarian'),
                ),
            ],
          ),
        ),
      );
    }

    // 3.4. Success State dengan Pull-to-Refresh & Infinite Scroll (FR-CAT-01, FR-CAT-05)
    return RefreshIndicator(
      onRefresh: viewModel.refresh,
      color: AppColors.primary,
      child: ListView.builder(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: viewModel.products.length + (viewModel.isLoadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          // Indikator Loading Tambahan di Bawah (Pagination Infinite Scroll)
          if (index == viewModel.products.length) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: 16.0),
              child: Center(
                child: SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                ),
              ),
            );
          }

          final product = viewModel.products[index];
          return _buildProductCard(context, product);
        },
      ),
    );
  }

  /// Kartu Produk Sesuai FR-CAT-03 dengan info stok transparan
  Widget _buildProductCard(BuildContext context, ProductModel product) {
    final stockColor = _getStockColor(product.stockStatus);
    final stockBg = _getStockBgColor(product.stockStatus);

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: AppColors.cardBorder),
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ProductDetailView(product: product),
            ),
          );
        },
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(14.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Visual Box / Avatar Kategori
              Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: const Center(
                  child: Icon(
                    Icons.inventory_2_outlined,
                    size: 34,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(width: 14),

              // Rincian Informasi Produk
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Kategori & Badge Status Stok Dinamis
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          product.category,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: stockBg,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            product.stockDisplay,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: stockColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),

                    // Nama Produk
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),

                    // Informasi Stok Tersedia pada Masing-masing Card (Requirement 1)
                    Row(
                      children: [
                        Icon(
                          Icons.inventory_rounded,
                          size: 13,
                          color: product.stock > 0 ? stockColor : AppColors.error,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          product.stock > 0
                              ? 'Stok Toko: ${product.stock} ${product.unit}'
                              : 'Stok Toko: Habis',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: product.stock > 0 ? AppColors.textSecondary : AppColors.error,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Harga Resmi & Aksi
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              CurrencyFormatter.format(product.price),
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '/ ${product.unit}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: product.isAvailable ? AppColors.primary : AppColors.cardBorder,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                product.isAvailable ? Icons.add_shopping_cart_rounded : Icons.block,
                                size: 14,
                                color: product.isAvailable ? Colors.white : AppColors.textMuted,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                product.isAvailable ? 'Detail' : 'Habis',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: product.isAvailable ? Colors.white : AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
