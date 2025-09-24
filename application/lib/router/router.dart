import 'package:application/screen/order_screen.dart';
import 'package:application/screen/service_screen.dart';
import 'package:application/screen/shipping_screen.dart';
import 'package:flutter/material.dart';
import 'package:application/screen/home_screen.dart';
import 'package:application/screen/login_screen.dart';
import 'package:application/screen/mypage_screen.dart';

class AppRouter {
  static Map<String, WidgetBuilder> routes = {
    "/login": (_) => const LoginScreen(),
    "/home": (_) => const HomeScreen(),
    "/order": (_) => const OrderScreen(),
    "/shipping": (_) => const ShippingScreen(),
    "/service": (_) => const ServiceScreen(),
    "/mypage": (_) => const MypageScreen(),
  };
}
