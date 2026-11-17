import 'package:flutter/material.dart';

/// Palet Warna Resmi Toko (M01 • POS & Customer Companion)
class AppColors {
  AppColors._();

  // Primary Brand Colors
  static const Color primary = Color(0xFF1E5BB0); // Biru Retail Profesional
  static const Color primaryDark = Color(0xFF123E7A);
  static const Color primaryLight = Color(0xFFE8F1FC);

  // Secondary & Accents
  static const Color accent = Color(0xFFF59E0B); // Amber / Gold untuk Member & Promo
  static const Color accentLight = Color(0xFFFEF3C7);

  // Neutral Background & Surface
  static const Color background = Color(0xFFF8FAFC); // Slate 50
  static const Color surface = Colors.white;
  static const Color cardBorder = Color(0xFFE2E8F0); // Slate 200

  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF64748B); // Slate 500
  static const Color textMuted = Color(0xFF94A3B8); // Slate 400

  // Status & Feedback Colors
  static const Color success = Color(0xFF10B981); // Emerald Green
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color warning = Color(0xFFF59E0B); // Amber Warning
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFEF4444); // Red Danger
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF0EA5E9); // Sky Blue
  static const Color infoLight = Color(0xFFE0F2FE);

  // Status Badge Colors for Order Request
  static const Color statusPending = Color(0xFFD97706);
  static const Color statusProcessing = Color(0xFF2563EB);
  static const Color statusCompleted = Color(0xFF059669);
  static const Color statusCancelled = Color(0xFFDC2626);
}

