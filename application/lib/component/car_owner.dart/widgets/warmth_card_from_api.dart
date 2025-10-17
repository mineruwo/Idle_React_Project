import 'package:flutter/material.dart';
import 'package:application/services/car_owner_dashboard_service.dart';
import 'package:application/model/car_owner_dashboard_models.dart';
import 'warmth_card.dart';

class WarmthCardFromApi extends StatelessWidget {
  final CarOwnerDashboardService svc;

  const WarmthCardFromApi({super.key, required this.svc});

  String _formatScoreText(WarmthDTO w) {
    // score가 null이면 미표기
    if (w.score == null) return '리뷰 없음';
    // "99 점 (★4.8 / 23개)" 같은 보조 정보 포함
    final parts = <String>['${w.score} 점'];
    if (w.avg != null) parts.add('★${w.avg!.toStringAsFixed(1)}');
    if (w.count != null) parts.add('${w.count}개');
    return parts.join(' / ');
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<WarmthDTO>(
      future: svc.getWarmth(),
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Card(
            child: SizedBox(
              height: 160,
              child: Center(child: CircularProgressIndicator()),
            ),
          );
        }
        if (snap.hasError) {
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text('따뜻함 점수 로드 실패: ${snap.error}'),
            ),
          );
        }
        final dto = snap.data!;
        return WarmthCard(scoreText: _formatScoreText(dto));
      },
    );
  }
}
