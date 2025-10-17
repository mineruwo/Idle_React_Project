import 'package:application/services/car_owner_dashboard_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:application/model/car_owner_dashboard_models.dart';
import 'settlement_card.dart';

class SettlementCardFromSummary extends StatefulWidget {
  final CarOwnerDashboardService svc;
  final String period; // 'month' | 'week' | 'last7' | 'last30'

  const SettlementCardFromSummary({
    super.key,
    required this.svc,
    this.period = 'month',
  });

  @override
  State<SettlementCardFromSummary> createState() =>
      _SettlementCardFromSummaryState();
}

class _SettlementCardFromSummaryState extends State<SettlementCardFromSummary> {
  late Future<DashboardSummaryDTO> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.svc.getSummary(period: widget.period);
  }

  String _fmtKRW(int amount) {
    final f = NumberFormat.currency(
      locale: 'ko_KR',
      symbol: '',
      decimalDigits: 0,
    );
    return '${f.format(amount)} 원';
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<DashboardSummaryDTO>(
      future: _future,
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Card(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: SizedBox(
                height: 60,
                child: Center(child: CircularProgressIndicator()),
              ),
            ),
          );
        }
        if (snap.hasError || !snap.hasData) {
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '정산 내역',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '불러오기 실패',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                  const SizedBox(height: 8),
                  FilledButton.tonal(
                    onPressed: () => setState(() {
                      _future = widget.svc.getSummary(period: widget.period);
                    }),
                    child: const Text('다시 시도'),
                  ),
                ],
              ),
            ),
          );
        }

        final dto = snap.data!;
        // 내가 앞서 맞춰준 DTO에서 settlement 필드가 있음(없으면 alias thisMonthSettlement 사용)
        final amount = dto.settlement;
        return SettlementCard(amountText: _fmtKRW(amount));
      },
    );
  }
}
