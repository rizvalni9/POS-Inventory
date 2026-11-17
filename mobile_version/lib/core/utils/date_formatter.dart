import 'package:intl/intl.dart';

/// Helper Pemformat Tanggal & Waktu (WIB / Asia/Jakarta)
class DateFormatter {
  DateFormatter._();

  static const List<String> _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  /// Format lengkap: "16 Nov 2026, 14:30 WIB"
  static String formatFull(DateTime? dateTime) {
    if (dateTime == null) return '-';
    final local = dateTime.toLocal();
    try {
      final df = DateFormat('dd MMM yyyy, HH:mm', 'id_ID');
      return '${df.format(local)} WIB';
    } catch (_) {
      final day = local.day.toString().padLeft(2, '0');
      final month = _months[local.month - 1];
      final year = local.year;
      final hour = local.hour.toString().padLeft(2, '0');
      final minute = local.minute.toString().padLeft(2, '0');
      return '$day $month $year, $hour:$minute WIB';
    }
  }

  /// Format tanggal singkat: "16/11/2026"
  static String formatShort(DateTime? dateTime) {
    if (dateTime == null) return '-';
    final local = dateTime.toLocal();
    final day = local.day.toString().padLeft(2, '0');
    final month = local.month.toString().padLeft(2, '0');
    final year = local.year;
    return '$day/$month/$year';
  }

  /// Format waktu saja: "14:30 WIB"
  static String formatTime(DateTime? dateTime) {
    if (dateTime == null) return '-';
    final local = dateTime.toLocal();
    final hour = local.hour.toString().padLeft(2, '0');
    final minute = local.minute.toString().padLeft(2, '0');
    return '$hour:$minute WIB';
  }
}

