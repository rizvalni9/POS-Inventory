import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../models/product_model.dart';

/// Respon Pagination Katalog Produk
class ProductPaginationResult {
  final List<ProductModel> products;
  final int currentPage;
  final int totalPages;
  final int totalItems;

  ProductPaginationResult({
    required this.products,
    required this.currentPage,
    required this.totalPages,
    required this.totalItems,
  });
}

/// Service Jaringan untuk Katalog Produk Toko
class CatalogApiService {
  final ApiClient _apiClient;

  CatalogApiService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Mengambil daftar produk aktif dengan filter & pagination (FR-CAT-01, FR-CAT-02)
  Future<ProductPaginationResult> getProducts({
    int page = 1,
    int limit = 20,
    String? search,
    String? category,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };

    if (search != null && search.trim().isNotEmpty) {
      queryParams['search'] = search.trim();
    }

    if (category != null && category.trim().isNotEmpty && category != 'Semua') {
      queryParams['category'] = category.trim();
    }

    final uri = Uri.parse(ApiEndpoints.products).replace(queryParameters: queryParams);
    final response = await _apiClient.get(uri.toString());

    final Map<String, dynamic> body = response is Map<String, dynamic> ? response : {};
    final List<dynamic> dataList = body['data'] is List ? (body['data'] as List) : [];
    final Map<String, dynamic>? paginationMap = body['pagination'] as Map<String, dynamic>?;

    final products = dataList.map((item) => ProductModel.fromJson(item as Map<String, dynamic>)).toList();

    return ProductPaginationResult(
      products: products,
      currentPage: paginationMap?['current_page'] is int
          ? paginationMap!['current_page']
          : int.tryParse(paginationMap?['current_page']?.toString() ?? '$page') ?? page,
      totalPages: paginationMap?['total_pages'] is int
          ? paginationMap!['total_pages']
          : int.tryParse(paginationMap?['total_pages']?.toString() ?? '1') ?? 1,
      totalItems: paginationMap?['total_items'] is int
          ? paginationMap!['total_items']
          : int.tryParse(paginationMap?['total_items']?.toString() ?? '${products.length}') ?? products.length,
    );
  }

  /// Mengambil rincian produk tunggal (FR-CAT-04)
  Future<ProductModel> getProductDetail(int id) async {
    final response = await _apiClient.get(ApiEndpoints.productDetail(id));
    final data = (response as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return ProductModel.fromJson(data);
  }
}

