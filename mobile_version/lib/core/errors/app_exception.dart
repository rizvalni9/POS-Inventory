/// Base Class untuk Seluruh Exception Jaringan dan API
class AppException implements Exception {
  final String message;
  final String? code;
  final int? statusCode;
  final Map<String, dynamic>? fieldErrors;
  final String? requestId;

  AppException({
    required this.message,
    this.code,
    this.statusCode,
    this.fieldErrors,
    this.requestId,
  });

  @override
  String toString() => message;
}

/// 401 Unauthorized (Token kedaluwarsa atau belum login)
class UnauthorizedException extends AppException {
  UnauthorizedException({
    String message = 'Sesi Anda telah berakhir. Silakan login kembali.',
    String? code = 'UNAUTHORIZED',
    String? requestId,
  }) : super(
          message: message,
          code: code,
          statusCode: 401,
          requestId: requestId,
        );
}

/// 403 Forbidden (Mencoba mengakses data milik orang lain / IDOR)
class ForbiddenException extends AppException {
  ForbiddenException({
    String message = 'Anda tidak memiliki hak untuk mengakses data ini.',
    String? code = 'FORBIDDEN',
    String? requestId,
  }) : super(
          message: message,
          code: code,
          statusCode: 403,
          requestId: requestId,
        );
}

/// 404 Not Found
class NotFoundException extends AppException {
  NotFoundException({
    String message = 'Data yang dicari tidak ditemukan.',
    String? code = 'NOT_FOUND',
    String? requestId,
  }) : super(
          message: message,
          code: code,
          statusCode: 404,
          requestId: requestId,
        );
}

/// 409 Conflict (Stale data: harga berubah saat di keranjang / duplikat)
class ConflictException extends AppException {
  ConflictException({
    required String message,
    String? code = 'CONFLICT',
    Map<String, dynamic>? fieldErrors,
    String? requestId,
  }) : super(
          message: message,
          code: code,
          statusCode: 409,
          fieldErrors: fieldErrors,
          requestId: requestId,
        );
}

/// 400 / 422 Validation Error
class ValidationException extends AppException {
  ValidationException({
    required String message,
    String? code = 'VALIDATION_ERROR',
    Map<String, dynamic>? fieldErrors,
    String? requestId,
  }) : super(
          message: message,
          code: code,
          statusCode: 422,
          fieldErrors: fieldErrors,
          requestId: requestId,
        );
}

/// 500+ Internal Server Error
class ServerException extends AppException {
  ServerException({
    String message = 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
    String? code = 'SERVER_ERROR',
    int? statusCode = 500,
    String? requestId,
  }) : super(
          message: message,
          code: code,
          statusCode: statusCode,
          requestId: requestId,
        );
}

/// Network Timeout / No Connection
class NetworkException extends AppException {
  NetworkException({
    String message = 'Koneksi gagal atau waktu habis. Periksa jaringan internet Anda.',
    String? code = 'NETWORK_ERROR',
  }) : super(
          message: message,
          code: code,
        );
}

