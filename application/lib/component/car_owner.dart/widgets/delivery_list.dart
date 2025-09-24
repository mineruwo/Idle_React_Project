import 'package:application/services/car_owner_dashboard_service.dart';
import 'package:flutter/material.dart';
import '../../../model/car_owner_dashboard_models.dart';
import 'delivery_item.dart';

class DeliveryList extends StatefulWidget {
  const DeliveryList({super.key, this.period = 'month'});

  /// 필요하면 기간 파라미터도 함께
  final String period;

  @override
  State<DeliveryList> createState() => _DeliveryListState();
}

class _DeliveryListState extends State<DeliveryList> {
  late final CarOwnerDashboardService _svc;
  late Future<List<DeliveryItemDTO>> _future;

  @override
  void initState() {
    super.initState();
    _svc = CarOwnerDashboardService(); // 기본 DioClient 사용
    _future = _svc.getDeliveries();
  }

  String _fmtKoreanDate(String ymd) {
    // "YYYY-MM-DD" -> "MM월 DD일"
    if (ymd.length >= 10) {
      final mm = ymd.substring(5, 7);
      final dd = ymd.substring(8, 10);
      return '$mm월 $dd일';
    }
    return ymd;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<DeliveryItemDTO>>(
      future: _future,
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        if (snap.hasError) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Text('운송 목록을 불러오지 못했습니다: ${snap.error}'),
          );
        }
        final items = snap.data ?? const [];
        if (items.isEmpty) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Text('현재 운송 중인 건이 없습니다.'),
          );
        }

        // 스크롤 뷰 안에서 사용할 수 있게 shrinkWrap + NeverScrollable
        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemBuilder: (context, i) {
            final it = items[i];
            return DeliveryItem(
              date: _fmtKoreanDate(it.s_date),
              from: it.from,
              to: it.to,
            );
          },
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemCount: items.length,
        );
      },
    );
  }
}
