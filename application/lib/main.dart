import 'package:application/provider/user_provider.dart';
import 'package:application/screen/home_screen.dart';
import 'package:application/screen/login_screen.dart';
import 'package:application/screen/main_screen.dart';
import 'package:application/screen/mypage_screen.dart';
import 'package:application/screen/order_screen.dart';
import 'package:application/screen/service_screen.dart';
import 'package:application/screen/shipping_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';


void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => UserProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,

      // 앱 시작 시 MainScreen을 기본 화면으로 띄움
      home: const MainScreen(),

      // 라우트 등록 (Navigator.pushNamed 등에서 사용 가능)
      routes: {
        "/login": (_) => const LoginScreen(),
        "/home": (_) => const HomeScreen(),
        "/order": (_) => const OrderScreen(),
        "/shipping": (_) => const ShippingScreen(),
        "/service": (_) => const ServiceScreen(),
        "/mypage": (_) => const MypageScreen(),
      },
    );
  }
}