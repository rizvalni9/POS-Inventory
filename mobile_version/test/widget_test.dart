import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mobile_version/core/session/session_manager.dart';
import 'package:mobile_version/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:mobile_version/features/auth/repositories/auth_repository.dart';
import 'package:mobile_version/features/auth/services/auth_api_service.dart';
import 'package:mobile_version/features/auth/views/login_view.dart';

void main() {
  testWidgets('Render halaman LoginView lengkap dengan komponen form', (WidgetTester tester) async {
    final sessionManager = SessionManager();
    final authRepository = AuthRepository(
      apiService: AuthApiService(),
      sessionManager: sessionManager,
    );
    final authViewModel = AuthViewModel(repository: authRepository);

    await tester.pumpWidget(
      MaterialApp(
        home: MultiProvider(
          providers: [
            ChangeNotifierProvider<SessionManager>.value(value: sessionManager),
            ChangeNotifierProvider<AuthViewModel>.value(value: authViewModel),
          ],
          child: const LoginView(),
        ),
      ),
    );

    // Verifikasi teks judul dan branding
    expect(find.text('Customer Toko'), findsOneWidget);
    expect(find.text('Aplikasi Pemesanan Mandiri & Nota Digital'), findsOneWidget);

    // Verifikasi tombol Masuk
    expect(find.text('Masuk'), findsOneWidget);

    // Verifikasi input field username & password
    expect(find.byType(TextFormField), findsNWidgets(2));
  });
}
