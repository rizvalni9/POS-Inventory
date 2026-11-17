import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../errors/app_exception.dart';
import '../storage/secure_token_storage.dart';

/// Client HTTP Utama dengan Dukungan Otentikasi, Timeout & Error Parsing
class ApiClient {
  final http.Client _client;
  final SecureTokenStorage _tokenStorage;
  void Function()? onUnauthorized;

  ApiClient({
    http.Client? client,
    SecureTokenStorage? tokenStorage,
    this.onUnauthorized,
  })  : _client = client ?? http.Client(),
        _tokenStorage = tokenStorage ?? SecureTokenStorage();

  /// Menyiapkan header default
  Future<Map<String, String>> _getHeaders({Map<String, String>? extraHeaders}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final token = await _tokenStorage.getToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    if (extraHeaders != null) {
      headers.addAll(extraHeaders);
    }

    return headers;
  }

  /// Request GET
  Future<dynamic> get(String url, {Map<String, String>? headers}) async {
    try {
      final finalHeaders = await _getHeaders(extraHeaders: headers);
      final response = await _client
          .get(Uri.parse(url), headers: finalHeaders)
          .timeout(AppConfig.timeoutDuration);

      return _processResponse(response);
    } on SocketException {
      throw NetworkException(message: 'Tidak ada koneksi internet. Silakan periksa jaringan Anda.');
    } on TimeoutException {
      throw NetworkException(message: 'Waktu koneksi habis. Server tidak merespons dalam 10 detik.');
    }
  }

  /// Request POST
  Future<dynamic> post(
    String url, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    try {
      final finalHeaders = await _getHeaders(extraHeaders: headers);
      final response = await _client
          .post(
            Uri.parse(url),
            headers: finalHeaders,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(AppConfig.timeoutDuration);

      return _processResponse(response);
    } on SocketException {
      throw NetworkException(message: 'Tidak ada koneksi internet. Silakan periksa jaringan Anda.');
    } on TimeoutException {
      throw NetworkException(message: 'Waktu koneksi habis. Mohon periksa status transaksi.');
    }
  }

  /// Request PATCH
  Future<dynamic> patch(
    String url, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    try {
      final finalHeaders = await _getHeaders(extraHeaders: headers);
      final response = await _client
          .patch(
            Uri.parse(url),
            headers: finalHeaders,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(AppConfig.timeoutDuration);

      return _processResponse(response);
    } on SocketException {
      throw NetworkException(message: 'Tidak ada koneksi internet. Silakan periksa jaringan Anda.');
    } on TimeoutException {
      throw NetworkException(message: 'Waktu koneksi habis.');
    }
  }

  /// Memproses respon HTTP dan memetakan status code ke Exception terstruktur
  dynamic _processResponse(http.Response response) {
    dynamic jsonBody;
    try {
      jsonBody = jsonDecode(utf8.decode(response.bodyBytes));
    } catch (_) {
      jsonBody = null;
    }

    final statusCode = response.statusCode;

    if (statusCode >= 200 && statusCode < 300) {
      return jsonBody;
    }

    String message = 'Permintaan gagal dengan status $statusCode';
    String? errorCode;
    Map<String, dynamic>? fieldErrors;
    String? requestId;

    if (jsonBody is Map) {
      if (jsonBody['message'] != null) {
        message = jsonBody['message'].toString();
      } else if (jsonBody['error'] is Map && jsonBody['error']['message'] != null) {
        message = jsonBody['error']['message'].toString();
      }

      final dynamic errorObj = jsonBody['error'];
      if (errorObj is Map) {
        errorCode = errorObj['code']?.toString();
        if (errorObj['field_errors'] is Map) {
          fieldErrors = Map<String, dynamic>.from(errorObj['field_errors'] as Map);
        }
        requestId = errorObj['request_id']?.toString();
      }
    }

    switch (statusCode) {
      case 400:
      case 422:
        throw ValidationException(
          message: message,
          code: errorCode ?? 'VALIDATION_ERROR',
          fieldErrors: fieldErrors,
          requestId: requestId,
        );
      case 401:
        onUnauthorized?.call();
        throw UnauthorizedException(
          message: message,
          code: errorCode ?? 'UNAUTHORIZED',
          requestId: requestId,
        );
      case 403:
        throw ForbiddenException(
          message: message,
          code: errorCode ?? 'FORBIDDEN',
          requestId: requestId,
        );
      case 404:
        throw NotFoundException(
          message: message,
          code: errorCode ?? 'NOT_FOUND',
          requestId: requestId,
        );
      case 409:
        throw ConflictException(
          message: message,
          code: errorCode ?? 'CONFLICT',
          fieldErrors: fieldErrors,
          requestId: requestId,
        );
      default:
        throw ServerException(
          message: message,
          statusCode: statusCode,
          code: errorCode ?? 'SERVER_ERROR',
          requestId: requestId,
        );
    }
  }
}

