import 'package:application/component/car_owner.dart/widgets/delivery_list.dart';
import 'package:application/component/car_owner.dart/widgets/settlement_card_from_summary.dart';
import 'package:application/component/car_owner.dart/widgets/status_chips_from_summary.dart';
import 'package:application/component/car_owner.dart/widgets/warmth_card_from_api.dart';
import 'package:application/services/car_owner_dashboard_service.dart';
import 'package:flutter/material.dart';

import '../component/car_owner.dart/widgets/section_title.dart';

class MyPageScreen extends StatelessWidget {
  MyPageScreen({super.key});
  final _svc = CarOwnerDashboardService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        // 상단 상태바 침범 방지
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 50),

              // ✅ 그냥 위젯을 직접 배치 (겉의 GridView 제거)
              StatusChipsFromSummary(svc: _svc, period: 'month'),

              const SizedBox(height: 12),

              // 카드 2개를 같은 높이로 보이게 하려면 고정 높이(or AspectRatio) 추천
              SizedBox(
                height: 200, // 필요에 맞게 조절
                child: Row(
                  children: [
                    Expanded(
                      child: Card(
                        clipBehavior: Clip.antiAlias,
                        child: SettlementCardFromSummary(
                          svc: _svc,
                          period: 'month',
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Card(
                        clipBehavior: Clip.antiAlias,
                        child: WarmthCardFromApi(svc: _svc),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              const SectionTitle('운송중'),

              // DeliveryList가 자체 스크롤이면(리스트) SingleChildScrollView 안에서
              // shrinkWrap + NeverScrollablePhysics 써야 함.
              const DeliveryList(), // 내부에서 처리돼 있다면 그대로 O
            ],
          ),
        ),
      ),
    );
  }
}
