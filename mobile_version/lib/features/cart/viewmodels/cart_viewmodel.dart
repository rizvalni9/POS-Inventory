import 'package:flutter/foundation.dart';
import '../models/cart_item_model.dart';
import '../../catalog/models/product_model.dart';
import '../../../core/utils/currency_formatter.dart';

/// Hasil status penambahan barang ke keranjang
enum AddToCartResult {
  added,
  updated,
  cappedToStock,
  outOfStock,
}

/// ViewModel Pengelola Keranjang Belanja Interaktif Pelanggan (FR-CART-01 s/d FR-CART-04)
class CartViewModel extends ChangeNotifier {
  final Map<int, CartItemModel> _items = {};
  String _notes = '';
  String? _feedbackMessage;

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  List<CartItemModel> get items => _items.values.toList();

  /// Jumlah total unit seluruh barang
  int get totalQuantity => _items.values.fold(0, (sum, item) => sum + item.quantity);

  /// Jumlah jenis produk unik
  int get uniqueItemCount => _items.length;

  /// Total estimasi nominal belanja (FR-CART-03)
  double get totalEstimatedAmount =>
      _items.values.fold(0.0, (sum, item) => sum + item.subtotal);

  String get totalEstimatedAmountFormatted =>
      CurrencyFormatter.format(totalEstimatedAmount);

  bool get isEmpty => _items.isEmpty;
  bool get isNotEmpty => _items.isNotEmpty;

  String get notes => _notes;
  String? get feedbackMessage => _feedbackMessage;

  // ---------------------------------------------------------------------------
  // Actions & Mutations (FR-CART-01 & FR-CART-02)
  // ---------------------------------------------------------------------------

  /// Mengatur catatan pesanan opsional (FR-CART-04)
  void setNotes(String notes) {
    _notes = notes;
    notifyListeners();
  }

  /// Menambahkan barang ke keranjang belanja
  AddToCartResult addItem(ProductModel product, {int quantity = 1}) {
    if (product.stock <= 0) {
      _feedbackMessage = 'Stok produk ini sedang habis di toko.';
      notifyListeners();
      return AddToCartResult.outOfStock;
    }

    if (_items.containsKey(product.id)) {
      final existing = _items[product.id]!;
      final newQuantity = existing.quantity + quantity;

      if (newQuantity > product.stock) {
        existing.quantity = product.stock;
        _feedbackMessage =
            'Kuantitas disesuaikan ke stok maksimal toko (${product.stock} ${product.unit}).';
        notifyListeners();
        return AddToCartResult.cappedToStock;
      } else {
        existing.quantity = newQuantity;
        _feedbackMessage = 'Kuantitas ${product.name} diperbarui di keranjang.';
        notifyListeners();
        return AddToCartResult.updated;
      }
    } else {
      final validQuantity = quantity > product.stock ? product.stock : quantity;
      _items[product.id] = CartItemModel(
        product: product,
        quantity: validQuantity,
      );

      _feedbackMessage = '${product.name} berhasil ditambahkan ke keranjang.';
      notifyListeners();
      return (validQuantity < quantity)
          ? AddToCartResult.cappedToStock
          : AddToCartResult.added;
    }
  }

  /// Menambah 1 kuantitas item (tervalidasi tidak melebihi stok toko)
  bool incrementItem(int productId) {
    final item = _items[productId];
    if (item == null) return false;

    if (item.quantity < item.product.stock) {
      item.quantity++;
      notifyListeners();
      return true;
    } else {
      _feedbackMessage =
          'Maksimal ${item.product.stock} ${item.product.unit} sesuai stok kasir.';
      notifyListeners();
      return false;
    }
  }

  /// Mengurangi 1 kuantitas item (kuantitas minimal 1)
  /// Catatan: Jika kuantitas saat ini 1, UI akan memanggil konfirmasi dialog hapus (FR-CART-02)
  bool decrementItem(int productId) {
    final item = _items[productId];
    if (item == null) return false;

    if (item.quantity > 1) {
      item.quantity--;
      notifyListeners();
      return true;
    }
    return false;
  }

  /// Menghapus item dari keranjang (FR-CART-01)
  void removeItem(int productId) {
    if (_items.containsKey(productId)) {
      final removed = _items.remove(productId);
      _feedbackMessage = '${removed?.product.name} dihapus dari keranjang.';
      notifyListeners();
    }
  }

  /// Mengosongkan seluruh isi keranjang & catatan (FR-AUTH-05 & Clear Cart)
  void clearCart() {
    _items.clear();
    _notes = '';
    _feedbackMessage = null;
    notifyListeners();
  }

  /// Membersihkan pesan umpan balik
  void clearFeedback() {
    _feedbackMessage = null;
  }
}

