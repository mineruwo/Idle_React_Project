import 'package:flutter/material.dart';
import '../widgets/app_top_bar.dart';
import '../widgets/section_title.dart';
import '../widgets/stat_chip.dart';
import '../widgets/transport_item.dart';
import '../widgets/settlement_card.dart';
import '../widgets/warmth_card.dart';

class MyPageScreen extends StatelessWidget {
  const MyPageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar(title: '마이페이지'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: const [
                StatChip(label: '배차 진행중', value: '12'),
                StatChip(label: '처리중', value: '4'),
                StatChip(label: '배송완료', value: '8'),
                StatChip(label: '이번달 00건', value: '02건'),
              ],
            ),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Expanded(child: SettlementCard(amountText: '2,500,000 원')),
                SizedBox(width: 12),
                Expanded(child: WarmthCard(scoreText: '99 점')),
              ],
            ),
            const SizedBox(height: 8),
            const SectionTitle('운송중'),
            const TransportItem(
              date: '09월 24일',
              from: '서울특별시 강남구 역삼동',
              to: '부산 해운대 해수욕장 합정리',
            ),
            const TransportItem(
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
