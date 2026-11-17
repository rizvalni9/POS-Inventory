import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../../core/errors/app_exception.dart';
import '../models/product_model.dart';
import '../repositories/catalog_repository.dart';

enum CatalogViewState { initial, loading, success, empty, error }

/// ViewModel Pengelola State Katalog Produk Toko (MVVM / ChangeNotifier)
class CatalogViewModel extends ChangeNotifier {
  final CatalogRepository _repository;

  CatalogViewState _state = CatalogViewState.initial;
  List<ProductModel> _products = [];
  String? _errorMessage;

  // Filter & Search State
  String _searchQuery = '';
  String _selectedCategory = 'Semua';
  Timer? _debounceTimer;

  // Pagination State
  int _currentPage = 1;
  int _totalPages = 1;
  int _totalItems = 0;
  bool _isLoadingMore = false;

  CatalogViewModel({required CatalogRepository repository}) : _repository = repository;

  // Getters
  CatalogViewState get state => _state;
  bool get isLoading => _state == CatalogViewState.loading;
  bool get isEmpty => _state == CatalogViewState.empty;
  bool get isError => _state == CatalogViewState.error;
  bool get isLoadingMore => _isLoadingMore;
  List<ProductModel> get products => _products;
  String? get errorMessage => _errorMessage;
  String get searchQuery => _searchQuery;
  String get selectedCategory => _selectedCategory;
  int get currentPage => _currentPage;
  int get totalPages => _totalPages;
  int get totalItems => _totalItems;
  bool get hasMore => _currentPage < _totalPages;

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  /// Memuat produk dari awal (page 1)
  Future<void> loadProducts({bool showLoadingIndicator = true}) async {
    if (showLoadingIndicator) {
      _state = CatalogViewState.loading;
      _errorMessage = null;
      notifyListeners();
    }

    try {
      _currentPage = 1;
      final result = await _repository.fetchProducts(
        page: 1,
        limit: 20,
        search: _searchQuery,
        category: _selectedCategory,
      );

      _products = result.products;
      _currentPage = result.currentPage;
      _totalPages = result.totalPages;
      _totalItems = result.totalItems;

      if (_products.isEmpty) {
        _state = CatalogViewState.empty;
      } else {
        _state = CatalogViewState.success;
      }
      notifyListeners();
    } on AppException catch (e) {
      _state = CatalogViewState.error;
      _errorMessage = e.message;
      notifyListeners();
    } catch (e) {
      _state = CatalogViewState.error;
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
    }
  }

  /// Memuat halaman berikutnya (Infinite Scroll / Pagination)
  Future<void> loadMore() async {
    if (_isLoadingMore || !hasMore || _state == CatalogViewState.loading) return;

    _isLoadingMore = true;
    notifyListeners();

    try {
      final nextPage = _currentPage + 1;
      final result = await _repository.fetchProducts(
        page: nextPage,
        limit: 20,
        search: _searchQuery,
        category: _selectedCategory,
      );

      _products.addAll(result.products);
      _currentPage = result.currentPage;
      _totalPages = result.totalPages;
      _totalItems = result.totalItems;
    } catch (_) {
      // Gagal load more tidak merusak list eksisting
    } finally {
      _isLoadingMore = false;
      notifyListeners();
    }
  }

  /// Pencarian dengan teknik Debouncing (400ms)
  void setSearchQuery(String query) {
    if (_searchQuery == query) return;
    _searchQuery = query;

    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 400), () {
      loadProducts(showLoadingIndicator: true);
    });
  }

  /// Filter Kategori
  void setCategory(String category) {
    if (_selectedCategory == category) return;
    _selectedCategory = category;
    loadProducts(showLoadingIndicator: true);
  }

  /// Pull-to-refresh
  Future<void> refresh() async {
    await loadProducts(showLoadingIndicator: false);
  }
}

