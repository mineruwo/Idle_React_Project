import 'package:application/provider/user_provider.dart';
import 'package:application/screen/car_owner_delivery_screen.dart';
import 'package:application/screen/car_owner_mypage_screen.dart';
import 'package:application/screen/home_screen.dart';
import 'package:application/screen/login_screen.dart';
import 'package:application/screen/mypage_screen.dart';
import 'package:application/screen/order_screen.dart';
import 'package:application/screen/service_screen.dart';
import 'package:application/screen/shipping_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:application/const/colors.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  Widget _widgetOptions(BuildContext context, int index) {
    final userProvider = Provider.of<UserProvider>(context);

    switch (index) {
      case 0: // 홈
        return const HomeScreen();

      case 1: // 오더
        if (!userProvider.isLoggedIn) {
          return const LoginScreen();
        } else {
          return const OrderScreen();
        }

      case 2: // 배송
        if (!userProvider.isLoggedIn) return const LoginScreen();
        if (userProvider.user?.role == "shipper") {
          return const ShippingScreen();
        } else {
          return const DeliveryScreen();
        }

      case 3: // 서비스
        if (!userProvider.isLoggedIn) return const LoginScreen();
        return const ServiceScreen();

      case 4: // 마이페이지
        if (!userProvider.isLoggedIn) return const LoginScreen();
        if (userProvider.user?.role == "shipper") {
          return const MypageScreen();
        } else {
          return const MyPageScreen();
        }

      default:
        return const HomeScreen();
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PRIMARY_COLOR,
      body: _widgetOptions(context, _selectedIndex),
      floatingActionButton: Transform.translate(
        offset: const Offset(0.0, 15.0),
        child: SizedBox(
          width: 84.0,
          height: 84.0,
          child: FloatingActionButton(
            heroTag: "shipping_fab",
            onPressed: () => _onItemTapped(2),
            backgroundColor: PRIMARY_COLOR,
            shape: CircleBorder(
              side: BorderSide(
                color: _selectedIndex == 2 ? THIRD_COLOR : SECOND_COLOR,
                width: 3.0,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.local_shipping,
                  color: _selectedIndex == 2 ? THIRD_COLOR : FOURTH_COLOR,
                  size: 36.0,
                ),
                Text(
                  '배송',
                  style: TextStyle(
                    color: _selectedIndex == 2 ? THIRD_COLOR : FOURTH_COLOR,
                    fontSize: 12.0,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: SECOND_COLOR, width: 3.0)),
        ),
        child: BottomAppBar(
          color: PRIMARY_COLOR,
          shape: const CircularNotchedRectangle(),
          notchMargin: 8.0,
          child: SizedBox(
            height: 60.0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: <Widget>[
                _buildNavItem(0, Icons.home, '홈'),
                _buildNavItem(1, Icons.receipt_long, '오더'),
                const SizedBox(width: 86.0),
                _buildNavItem(3, Icons.build, '서비스'),
                _buildNavItem(4, Icons.person, '마이페이지'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final bool isSelected = _selectedIndex == index;
    final Color itemColor = isSelected ? THIRD_COLOR : FOURTH_COLOR;

    return Expanded(
      child: InkWell(
        onTap: () => _onItemTapped(index),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: itemColor),
            Text(label, style: TextStyle(color: itemColor, fontSize: 12.0)),
          ],
        ),
      ),
    );
  }
}
