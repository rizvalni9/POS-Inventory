import '../../catalog/models/product_model.dart';
import '../../../core/utils/currency_formatter.dart';

/// Model Item Keranjang Belanja Pelanggan (FR-CART-01 s/d FR-CART-03)
class CartItemModel {
  final ProductModel product;
  int quantity;

  CartItemModel({
    required this.product,
    this.quantity = 1,
  });

  /// Subtotal harga item = harga satuan * kuantitas
  double get subtotal => product.price * quantity;

  /// Format Rupiah subtotal
  String get subtotalFormatted => CurrencyFormatter.format(subtotal);

  /// Format Rupiah harga satuan
  String get priceFormatted => CurrencyFormatter.format(product.price);

  /// Batas stok kasir tercapai
  bool get isStockMaxReached => quantity >= product.stock;

  /// Dapat menambah kuantitas
  bool get canIncrement => quantity < product.stock;

  /// Dapat mengurangi kuantitas
  bool get canDecrement => quantity > 1;

  CartItemModel copyWith({
    ProductModel? product,
    int? quantity,
  }) {
    return CartItemModel(
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': product.id,
      'product_name': product.name,
      'unit_price': product.price,
      'unit': product.unit,
      'quantity': quantity,
      'subtotal': subtotal,
    };
  }
}

