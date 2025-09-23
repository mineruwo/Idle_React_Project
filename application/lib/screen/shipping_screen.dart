import 'package:application/component/shipping_component/shipper_status.dart';
import 'package:flutter/material.dart';

class ShippingScreen extends StatelessWidget {
  const ShippingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: ShipperStatus());
  }
}
