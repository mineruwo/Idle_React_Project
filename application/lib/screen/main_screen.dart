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
  // 분기 처리
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
          return MyPageScreen();
        }

      default:
        return const HomeScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);

    return Scaffold(
      body: _widgetOptions(context, userProvider.selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.home), label: '홈'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long), label: '오더'),
          BottomNavigationBarItem(
            icon: Icon(Icons.local_shipping),
            label: '배송',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.build), label: '서비스'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: '마이페이지'),
        ],
        currentIndex: userProvider.selectedIndex,
        selectedItemColor: Colors.blueAccent,
        unselectedItemColor: Colors.grey,
        onTap: (index) {
          userProvider.setIndex(index); // ✅ Provider 상태 변경
        },
        type: BottomNavigationBarType.fixed, // 탭이 4개 이상일 때 필요
      ),
    );
  }
}
