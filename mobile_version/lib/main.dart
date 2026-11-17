import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/constants/app_colors.dart';
import 'core/network/api_client.dart';
import 'core/session/session_manager.dart';
import 'core/storage/secure_token_storage.dart';
import 'features/auth/repositories/auth_repository.dart';
import 'features/auth/services/auth_api_service.dart';
import 'features/auth/viewmodels/auth_viewmodel.dart';
import 'features/auth/views/login_view.dart';
import 'features/catalog/repositories/catalog_repository.dart';
import 'features/catalog/services/catalog_api_service.dart';
import 'features/catalog/viewmodels/catalog_viewmodel.dart';
import 'features/cart/viewmodels/cart_viewmodel.dart';
import 'features/home/views/main_navigation_shell.dart';
import 'features/order_request/repositories/order_repository.dart';
import 'features/order_request/services/order_api_service.dart';
import 'features/order_request/viewmodels/order_viewmodel.dart';
import 'features/profile/viewmodels/profile_viewmodel.dart';
import 'features/receipt/repositories/receipt_repository.dart';
import 'features/receipt/services/receipt_api_service.dart';
import 'features/receipt/viewmodels/receipt_viewmodel.dart';

import 'package:intl/date_symbol_data_local.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await initializeDateFormatting('id_ID', null);
  } catch (_) {}
  runApp(const CustomerTokoApp());
}

class CustomerTokoApp extends StatelessWidget {
  const CustomerTokoApp({super.key});

  @override
  Widget build(BuildContext context) {
    final tokenStorage = SecureTokenStorage();
    final sessionManager = SessionManager(tokenStorage: tokenStorage);

    // Hubungkan interceptor 401 ke sessionManager (FR-AUTH-03)
    final apiClient = ApiClient(
      tokenStorage: tokenStorage,
      onUnauthorized: () {
        sessionManager.handleUnauthorized();
      },
    );

    final authApiService = AuthApiService(apiClient: apiClient);
    final authRepository = AuthRepository(
      apiService: authApiService,
      sessionManager: sessionManager,
    );

    final catalogApiService = CatalogApiService(apiClient: apiClient);
    final catalogRepository = CatalogRepository(apiService: catalogApiService);

    final orderApiService = OrderApiService(apiClient: apiClient);
    final orderRepository = OrderRepository(apiService: orderApiService);

    final receiptApiService = ReceiptApiService(apiClient: apiClient);
    final receiptRepository = ReceiptRepository(apiService: receiptApiService);

    return MultiProvider(
      providers: [
        ChangeNotifierProvider<SessionManager>.value(value: sessionManager),
        ChangeNotifierProvider<AuthViewModel>(
          create: (_) => AuthViewModel(repository: authRepository),
        ),
        ChangeNotifierProvider<ProfileViewModel>(
          create: (_) => ProfileViewModel(repository: authRepository),
        ),
        ChangeNotifierProvider<CatalogViewModel>(
          create: (_) => CatalogViewModel(repository: catalogRepository)..loadProducts(),
        ),
        ChangeNotifierProvider<CartViewModel>(
          create: (_) => CartViewModel(),
        ),
        ChangeNotifierProvider<OrderViewModel>(
          create: (_) => OrderViewModel(repository: orderRepository),
        ),
        ChangeNotifierProvider<ReceiptViewModel>(
          create: (_) => ReceiptViewModel(repository: receiptRepository),
        ),
      ],
      child: MaterialApp(
        title: 'Customer Toko - M01',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.primary,
            primary: AppColors.primary,
            surface: AppColors.surface,
          ),
          scaffoldBackgroundColor: AppColors.background,
          fontFamily: 'Roboto',
        ),
        home: const AuthGatekeeper(),
      ),
    );
  }
}

/// Gatekeeper: Mengatur Navigasi Berdasarkan Status Sesi (Route Guard)
class AuthGatekeeper extends StatelessWidget {
  const AuthGatekeeper({super.key});

  @override
  Widget build(BuildContext context) {
    final sessionManager = context.watch<SessionManager>();

    // 1. Tampilan Loading saat memverifikasi sesi token lokal
    if (sessionManager.isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: AppColors.primary),
              SizedBox(height: 16),
              Text(
                'Memeriksa status sesi...',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
            ],
          ),
        ),
      );
    }

    // 2. Jika belum login atau sesi kedaluwarsa, arahkan ke Login
    if (!sessionManager.isAuthenticated) {
      return const LoginView();
    }

    // 3. Jika sesi aktif dan terverifikasi, arahkan ke Shell Navigasi Utama (Katalog & Profil)
    return const MainNavigationShell();
  }
}
