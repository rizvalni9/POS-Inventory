import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

/// Status Permintaan Pesanan
enum OrderRequestStatus {
  pending,
  processing,
  completed,
  cancelled;

  static OrderRequestStatus fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'processing':
        return OrderRequestStatus.processing;
      case 'completed':
        return OrderRequestStatus.completed;
      case 'cancelled':
        return OrderRequestStatus.cancelled;
      case 'pending':
      default:
        return OrderRequestStatus.pending;
    }
  }

  String get label {
    switch (this) {
      case OrderRequestStatus.pending:
        return 'Menunggu Konfirmasi';
      case OrderRequestStatus.processing:
        return 'Sedang Diproses';
      case OrderRequestStatus.completed:
        return 'Selesai';
      case OrderRequestStatus.cancelled:
        return 'Dibatalkan';
    }
  }

  Color get color {
    switch (this) {
      case OrderRequestStatus.pending:
        return const Color(0xFFD97706); // Kuning/Amber
      case OrderRequestStatus.processing:
        return const Color(0xFF2563EB); // Biru
      case OrderRequestStatus.completed:
        return const Color(0xFF16A34A); // Hijau
      case OrderRequestStatus.cancelled:
        return AppColors.error; // Merah
    }
  }

  Color get backgroundColor {
    switch (this) {
      case OrderRequestStatus.pending:
        return const Color(0xFFFEF3C7);
      case OrderRequestStatus.processing:
        return const Color(0xFFDBEAFE);
      case OrderRequestStatus.completed:
        return const Color(0xFFDCFCE7);
      case OrderRequestStatus.cancelled:
        return const Color(0xFFFEE2E2);
    }
  }

  IconData get icon {
    switch (this) {
      case OrderRequestStatus.pending:
        return Icons.hourglass_top_rounded;
      case OrderRequestStatus.processing:
        return Icons.sync_rounded;
      case OrderRequestStatus.completed:
        return Icons.check_circle_rounded;
      case OrderRequestStatus.cancelled:
        return Icons.cancel_rounded;
    }
  }
}

/// Model Item Dalam Permintaan Pesanan (FR-ORD-05 & FR-TRK-02)
class OrderRequestItemModel {
  final int? id;
  final int productId;
  final String productName;
  final double unitPrice;
  final int quantity;
  final double subtotal;

  OrderRequestItemModel({
    this.id,
    required this.productId,
    required this.productName,
    required this.unitPrice,
    required this.quantity,
    required this.subtotal,
  });

  factory OrderRequestItemModel.fromJson(Map<String, dynamic> json) {
    return OrderRequestItemModel(
      id: json['id'] != null ? int.tryParse(json['id'].toString()) : null,
      productId: int.tryParse(json['product_id']?.toString() ?? '0') ?? 0,
      productName: json['product_name']?.toString() ?? '',
      unitPrice: double.tryParse(json['unit_price']?.toString() ?? '0') ?? 0.0,
      quantity: int.tryParse(json['quantity']?.toString() ?? '0') ?? 0,
      subtotal: double.tryParse(json['subtotal']?.toString() ?? '0') ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'product_id': productId,
      'product_name': productName,
      'unit_price': unitPrice,
      'quantity': quantity,
      'subtotal': subtotal,
    };
  }
}

/// Model Header Permintaan Pesanan (Modul 4 & 5)
class OrderRequestModel {
  final int id;
  final String orderNumber;
  final OrderRequestStatus status;
  final double totalEstimatedAmount;
  final String? notes;
  final int? saleId;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final int itemsCount;
  final List<OrderRequestItemModel> items;

  OrderRequestModel({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.totalEstimatedAmount,
    this.notes,
    this.saleId,
    required this.createdAt,
    this.updatedAt,
    required this.itemsCount,
    this.items = const [],
  });

  factory OrderRequestModel.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    final parsedItems = rawItems
        .map((it) => OrderRequestItemModel.fromJson(it as Map<String, dynamic>))
        .toList();

    return OrderRequestModel(
      id: int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      orderNumber: json['order_number']?.toString() ?? '',
      status: OrderRequestStatus.fromString(json['status']?.toString()),
      totalEstimatedAmount:
          double.tryParse(json['total_estimated_amount']?.toString() ?? '0') ?? 0.0,
      notes: json['notes']?.toString(),
      saleId: json['sale_id'] != null
          ? int.tryParse(json['sale_id'].toString())
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'].toString())
          : null,
      itemsCount: json['items_count'] != null
          ? int.tryParse(json['items_count'].toString()) ?? parsedItems.length
          : parsedItems.length,
      items: parsedItems,
    );
  }
}

