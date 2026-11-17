import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../cart/viewmodels/cart_viewmodel.dart';
import '../../cart/views/cart_view.dart';
import '../../catalog/views/catalog_view.dart';
import '../../order_request/views/order_history_view.dart';
import '../../profile/views/profile_view.dart';

/// Shell Navigasi Utama Aplikasi Customer Mobile Toko
class MainNavigationController {
  static final ValueNotifier<int> currentTab = ValueNotifier<int>(0);

  static void switchTo(int index) {
    currentTab.value = index;
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    MainNavigationController.currentTab.addListener(_onTabControllerChanged);
    _screens = [
      const CatalogView(),
      CartView(
        onBrowseCatalog: () {
          MainNavigationController.switchTo(0);
        },
      ),
      const OrderHistoryView(),
      const ProfileView(),
    ];
  }

  void _onTabControllerChanged() {
    if (mounted && _currentIndex != MainNavigationController.currentTab.value) {
      setState(() {
        _currentIndex = MainNavigationController.currentTab.value;
      });
    }
  }

  @override
  void dispose() {
    MainNavigationController.currentTab.removeListener(_onTabControllerChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cartViewModel = context.watch<CartViewModel>();

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          ScaffoldMessenger.of(context).hideCurrentSnackBar();
          MainNavigationController.switchTo(index);
        },
        backgroundColor: Colors.white,
        elevation: 8,
        indicatorColor: AppColors.primaryLight,
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.storefront_outlined),
            selectedIcon: Icon(Icons.storefront_rounded, color: AppColors.primary),
            label: 'Katalog',
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: cartViewModel.totalQuantity > 0,
              label: Text('${cartViewModel.totalQuantity}'),
              child: const Icon(Icons.shopping_cart_outlined),
            ),
            selectedIcon: Badge(
              isLabelVisible: cartViewModel.totalQuantity > 0,
              label: Text('${cartViewModel.totalQuantity}'),
              child: const Icon(Icons.shopping_cart_rounded, color: AppColors.primary),
            ),
            label: 'Keranjang',
          ),
          const NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long_rounded, color: AppColors.primary),
            label: 'Pesanan',
          ),
          const NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded, color: AppColors.primary),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}


