import 'package:application/component/car_owner.dart/widgets/delivery_list.dart';
import 'package:flutter/material.dart';

import '../component/car_owner.dart/widgets/section_title.dart';
import '../component/car_owner.dart/widgets/delivery_item.dart';

class DeliveryScreen extends StatelessWidget {
  const DeliveryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 50),
            Card(
              child: Container(
                height: 160,
                alignment: Alignment.center,
                margin: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  '배송 지도',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Card(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
                child: Text(
                  '2025년 9월 24일 ~ 2025년 9월 25일',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SectionTitle('운송중'),
            const DeliveryList(),
            const DeliveryList(),
          ],
        ),
      ),
    );
  }
}
