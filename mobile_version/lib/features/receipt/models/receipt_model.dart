/// Model Informasi Toko Pada Nota Kasir Resmi (FR-RCP-03)
class StoreInfoModel {
  final String name;
  final String address;
  final String phone;

  StoreInfoModel({
    required this.name,
    required this.address,
    required this.phone,
  });

  factory StoreInfoModel.fromJson(Map<String, dynamic> json) {
    return StoreInfoModel(
      name: json['name']?.toString() ?? 'Toko Berkah OJT BPVP',
      address: json['address']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
    );
  }
}

/// Model Informasi Member Pada Nota Kasir (FR-RCP-03)
class ReceiptMemberModel {
  final String memberCode;
  final String name;
  final int pointsEarned;
  final int currentPoints;

  ReceiptMemberModel({
    required this.memberCode,
    required this.name,
    required this.pointsEarned,
    required this.currentPoints,
  });

  factory ReceiptMemberModel.fromJson(Map<String, dynamic> json) {
    return ReceiptMemberModel(
      memberCode: json['member_code']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      pointsEarned: int.tryParse(json['points_earned']?.toString() ?? '0') ?? 0,
      currentPoints: int.tryParse(json['current_points']?.toString() ?? '0') ?? 0,
    );
  }
}

/// Model Item Barang Terjual Pada Nota Kasir (Snapshot Permanen / FR-RCP-04)
class ReceiptItemModel {
  final String productName;
  final double unitPrice;
  final int quantity;
  final double subtotal;

  ReceiptItemModel({
    required this.productName,
    required this.unitPrice,
    required this.quantity,
    required this.subtotal,
  });

  factory ReceiptItemModel.fromJson(Map<String, dynamic> json) {
    return ReceiptItemModel(
      productName: json['product_name']?.toString() ?? '',
      unitPrice: double.tryParse(json['unit_price']?.toString() ?? '0') ?? 0.0,
      quantity: int.tryParse(json['quantity']?.toString() ?? '0') ?? 0,
      subtotal: double.tryParse(json['subtotal']?.toString() ?? '0') ?? 0.0,
    );
  }
}

/// Model Ringkasan Finansial Nota Penjualan
class ReceiptFinancialsModel {
  final double subtotal;
  final double discountAmount;
  final double finalTotal;
  final double paymentAmount;
  final double changeAmount;
  final String paymentMethod;

  ReceiptFinancialsModel({
    required this.subtotal,
    required this.discountAmount,
    required this.finalTotal,
    required this.paymentAmount,
    required this.changeAmount,
    required this.paymentMethod,
  });

  factory ReceiptFinancialsModel.fromJson(Map<String, dynamic> json) {
    return ReceiptFinancialsModel(
      subtotal: double.tryParse(json['subtotal']?.toString() ?? '0') ?? 0.0,
      discountAmount: double.tryParse(json['discount_amount']?.toString() ?? '0') ?? 0.0,
      finalTotal: double.tryParse(json['final_total']?.toString() ?? '0') ?? 0.0,
      paymentAmount: double.tryParse(json['payment_amount']?.toString() ?? '0') ?? 0.0,
      changeAmount: double.tryParse(json['change_amount']?.toString() ?? '0') ?? 0.0,
      paymentMethod: json['payment_method']?.toString() ?? 'Cash',
    );
  }
}

/// Model Dokumen Nota Penjualan Resmi Toko (FR-RCP-01 s/d FR-RCP-04)
class ReceiptModel {
  final int id;
  final String invoiceNumber;
  final DateTime transactionDate;
  final String cashierName;
  final StoreInfoModel storeInfo;
  final ReceiptMemberModel? member;
  final List<ReceiptItemModel> items;
  final ReceiptFinancialsModel financials;
  final String footerMessage;

  ReceiptModel({
    required this.id,
    required this.invoiceNumber,
    required this.transactionDate,
    required this.cashierName,
    required this.storeInfo,
    this.member,
    required this.items,
    required this.financials,
    required this.footerMessage,
  });

  factory ReceiptModel.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    final parsedItems = rawItems
        .map((it) => ReceiptItemModel.fromJson(it as Map<String, dynamic>))
        .toList();

    return ReceiptModel(
      id: int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      invoiceNumber: json['invoice_number']?.toString() ?? '',
      transactionDate: json['transaction_date'] != null
          ? DateTime.tryParse(json['transaction_date'].toString()) ?? DateTime.now()
          : DateTime.now(),
      cashierName: json['cashier_name']?.toString() ?? 'Kasir Toko',
      storeInfo: StoreInfoModel.fromJson(
        json['store_info'] is Map<String, dynamic>
            ? json['store_info'] as Map<String, dynamic>
            : {},
      ),
      member: json['member'] is Map<String, dynamic>
          ? ReceiptMemberModel.fromJson(json['member'] as Map<String, dynamic>)
          : null,
      items: parsedItems,
      financials: ReceiptFinancialsModel.fromJson(
        json['financials'] is Map<String, dynamic>
            ? json['financials'] as Map<String, dynamic>
            : {},
      ),
      footerMessage: json['footer_message']?.toString() ??
          'Terima kasih telah berbelanja di Toko kami.',
    );
  }
}

