import 'package:intl/intl.dart';

/// Helper Formatter Mata Uang Rupiah (IDR)
class CurrencyFormatter {
  CurrencyFormatter._();

  static final NumberFormat _currencyFormat = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  /// Mengonversi nilai (num, int, double, atau string) ke format Rupiah
  /// Contoh: 68000 -> "Rp 68.000"
  static String format(dynamic value) {
    if (value == null) return 'Rp 0';

    num numericValue = 0;
    if (value is num) {
      numericValue = value;
    } else if (value is String) {
      numericValue = num.tryParse(value) ?? 0;
    }

    return _currencyFormat.format(numericValue);
  }
}

