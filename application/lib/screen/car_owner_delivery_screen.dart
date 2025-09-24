import 'package:application/component/car_owner.dart/widgets/delivery_item.dart';
import 'package:application/component/car_owner.dart/widgets/section_title.dart';
import 'package:flutter/material.dart';


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
            const DeliveryItem(
              date: '09월 24일',
              from: '서울특별시 강남구 역삼동',
              to: '부산 해운대 해수욕장 합정리',
            ),
            const DeliveryItem(
              date: '09월 24일',
              from: '서울특별시 강남구 역삼동',
              to: '부산 해운대 해수욕장 합정리',
            ),
          ],
        ),
      ),
    );
  }
}
