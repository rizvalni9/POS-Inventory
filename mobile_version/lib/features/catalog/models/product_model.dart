/// Model Data Produk Katalog Customer Toko (FR-CAT-01 s/d FR-CAT-04)
/// Mengikuti struktur riil master produk dari database dan web POS
class ProductModel {
  final int id;
  final String? barcode;
  final String name;
  final String category;
  final double price;
  final String unit;
  final int stock;
  final bool isAvailable;
  final String stockStatus;
  final String stockDisplay;

  ProductModel({
    required this.id,
    this.barcode,
    required this.name,
    this.category = 'Sembako & Ritel',
    required this.price,
    this.unit = 'pcs',
    this.stock = 0,
    this.isAvailable = true,
    this.stockStatus = 'available',
    this.stockDisplay = 'Tersedia',
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final int rawStock = json['stock'] is int
        ? json['stock']
        : int.tryParse(json['stock']?.toString() ?? '0') ?? 0;

    final bool available = json['is_available'] == true ||
        json['is_active'] == true ||
        rawStock > 0;

    final String status = json['stock_status']?.toString() ??
        (rawStock > 10 ? 'available' : (rawStock > 0 ? 'limited' : 'out_of_stock'));

    final String display = json['stock_display']?.toString() ??
        (rawStock > 10
            ? '$rawStock Produk Tersedia'
            : (rawStock > 0 ? '$rawStock Produk Terbatas' : 'Stok Habis'));

    return ProductModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      barcode: json['barcode']?.toString() ?? json['sku']?.toString(),
      name: json['name']?.toString() ?? '',
      category: json['category']?.toString() ?? 'Sembako & Ritel',
      price: json['price'] is num
          ? (json['price'] as num).toDouble()
          : double.tryParse(json['price']?.toString() ?? '0.0') ?? 0.0,
      unit: json['unit']?.toString() ?? 'pcs',
      stock: rawStock,
      isAvailable: available && rawStock > 0,
      stockStatus: status,
      stockDisplay: display,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'barcode': barcode,
      'name': name,
      'category': category,
      'price': price,
      'unit': unit,
      'stock': stock,
      'is_available': isAvailable,
      'stock_status': stockStatus,
      'stock_display': stockDisplay,
    };
  }
}
