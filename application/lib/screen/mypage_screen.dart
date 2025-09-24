import 'package:application/component/mypage_component/shipper_mypage.dart';
import 'package:flutter/material.dart';

class MypageScreen extends StatelessWidget {
  const MypageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: ShipperMypage());
  }
}
