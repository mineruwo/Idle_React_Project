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

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0; // '홈' 탭을 기본으로 선택

  // 분기 처리
  Widget _widgetOptions(BuildContext context, int index) {
    final userProvider = Provider.of<UserProvider>(context);

    switch (index) {
      case 0: // 홈
        return const HomeScreen();

      case 1: // 오더
        if (!userProvider.isLoggedIn) {
          return const LoginScreen();
        }
        else {
          return const OrderScreen();
        }

      case 2: // 배송
        if (!userProvider.isLoggedIn) return const LoginScreen();
        if (userProvider.user?.role == "shipper") {
          return const ShippingScreen(); // 화주 배송 스크린으로 바꿔주세요
        } else {
          return const DeliveryScreen(); // 차주 배송 스크린으로 바꿔주세요
        }

      case 3: // 서비스
        if (!userProvider.isLoggedIn) return const LoginScreen();
        return const ServiceScreen();

      case 4: // 마이페이지
        if (!userProvider.isLoggedIn) return const LoginScreen();
        if (userProvider.user?.role == "shipper") {
          return const MypageScreen(); // 화주 마이페이지로 바꿔주세요
        } else {
          return const MyPageScreen(); // 차주 마이페이지로 바꿔주세요
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
      body: _widgetOptions(context, _selectedIndex),
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
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}
