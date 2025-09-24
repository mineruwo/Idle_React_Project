import 'package:application/component/car_owner.dart/widgets/delivery_list.dart';
import 'package:flutter/material.dart';

import '../component/car_owner.dart/widgets/section_title.dart';
import '../component/car_owner.dart/widgets/stat_chip.dart';
import '../component/car_owner.dart/widgets/transport_item.dart';
import '../component/car_owner.dart/widgets/settlement_card.dart';
import '../component/car_owner.dart/widgets/warmth_card.dart';

class MyPageScreen extends StatelessWidget {
  const MyPageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 50),
            GridView.count(
              shrinkWrap: true, // 스크롤 뷰 안에 쓸 때 필요
              crossAxisCount: 4, // 가로로 4칸
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              children: const [
                StatChip(label: '배차', value: '12'),
                StatChip(label: '운송', value: '4'),
                StatChip(label: '완료', value: '8'),
                StatChip(label: 'Total', value: '24'),
              ],
            ),
            IntrinsicHeight(
              // 가장 키 큰 자식 기준으로 Row의 높이를 정함
              child: Row(
                crossAxisAlignment:
                    CrossAxisAlignment.stretch, // 자식들을 Row 높이에 맞춰 늘림
                children: const [
                  Expanded(
                    child: SizedBox.expand(
                      // 가로/세로 모두 가득 채움
                      child: SettlementCard(amountText: '2,500,000 원'),
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: SizedBox.expand(
                      child: WarmthCard(scoreText: '99 점'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            const SectionTitle('운송중'),
            const DeliveryList(),
            const DeliveryList(),
          ],
        ),
      ),
    );
  }
}
