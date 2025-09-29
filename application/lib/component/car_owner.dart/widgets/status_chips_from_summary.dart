import 'package:application/component/car_owner.dart/widgets/stat_chip.dart';
import 'package:application/services/car_owner_dashboard_service.dart';
import 'package:flutter/material.dart';

import 'package:application/model/car_owner_dashboard_models.dart';

class StatusChipsFromSummary extends StatelessWidget {
  final CarOwnerDashboardService svc;
  final String period; // 'month' | 'week' | 'last7' | 'last30' 등 서버 지원값

  const StatusChipsFromSummary({
    super.key,
    required this.svc,
    this.period = 'month',
  });

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<DashboardSummaryDTO>(
      future: svc.getSummary(period: period),
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        if (snap.hasError) {
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Text('상태 요약 조회 실패: ${snap.error}'),
          );
        }

        final dto = snap.data!;
        final children = [
          StatChip(label: 'Scheduled', value: '${dto.scheduled}'), // READY
          StatChip(label: 'In Progress', value: '${dto.inProgress}'), // ONGOING
          StatChip(label: 'Completed', value: '${dto.completed}'),
          StatChip(label: 'Total', value: '${dto.total}'),
        ];

        return LayoutBuilder(
          builder: (context, c) {
            final wide = c.maxWidth > 520;
            return GridView.count(
              crossAxisCount: wide ? 4 : 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 2.2,
              children: children,
            );
          },
        );
      },
    );
  }
}
