import '../models/product_model.dart';
import '../services/catalog_api_service.dart';

/// Repository untuk Abstraksi Sumber Data Katalog
class CatalogRepository {
  final CatalogApiService _apiService;

  CatalogRepository({CatalogApiService? apiService})
      : _apiService = apiService ?? CatalogApiService();

  Future<ProductPaginationResult> fetchProducts({
    int page = 1,
    int limit = 20,
    String? search,
    String? category,
  }) async {
    return await _apiService.getProducts(
      page: page,
      limit: limit,
      search: search,
      category: category,
    );
  }

  Future<ProductModel> fetchProductDetail(int id) async {
    return await _apiService.getProductDetail(id);
  }
}

