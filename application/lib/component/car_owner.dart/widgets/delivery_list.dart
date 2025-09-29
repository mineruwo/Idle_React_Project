import 'package:application/services/car_owner_dashboard_service.dart';
import 'package:flutter/material.dart';
import '../../../model/car_owner_dashboard_models.dart';
import 'delivery_item.dart';

class DeliveryList extends StatefulWidget {
  const DeliveryList({super.key, this.period = 'month', this.onSelect});

  final String period;
  final void Function(String from, String to)? onSelect;

  @override
  State<DeliveryList> createState() => _DeliveryListState();
}

class _DeliveryListState extends State<DeliveryList> {
  late final CarOwnerDashboardService _svc;
  late Future<List<DeliveryItemDTO>> _future;
  final Set<int> _loadingIds = <int>{};
  int? _selectedId;

  @override
  void initState() {
    super.initState();
    _svc = CarOwnerDashboardService();
    _future = _svc.getDeliveries();
  }

  Future<void> _refresh() async {
    setState(() {
      _future = _svc.getDeliveries();
    });
    await _future;
  }

  String _fmtKoreanDate(String ymd) {
    if (ymd.length >= 10) {
      final mm = ymd.substring(5, 7);
      final dd = ymd.substring(8, 10);
      return '$mm월 $dd일';
    }
    return ymd;
  }

  void _showSnack(BuildContext ctx, String msg) {
    ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _handleDepart(BuildContext ctx, int orderId) async {
    setState(() => _loadingIds.add(orderId));
    try {
      await _svc.departOrder(orderId);
      _showSnack(ctx, '상차 처리 완료');
      await _refresh();
    } catch (e) {
      _showSnack(ctx, '상차 실패: $e');
    } finally {
      if (mounted) setState(() => _loadingIds.remove(orderId));
    }
  }

  Future<void> _handleComplete(BuildContext ctx, int orderId) async {
    setState(() => _loadingIds.add(orderId));
    try {
      await _svc.completeOrder(orderId);
      _showSnack(ctx, '배송 완료 처리 완료');
      await _refresh();
    } catch (e) {
      _showSnack(ctx, '배송 완료 실패: $e');
    } finally {
      if (mounted) setState(() => _loadingIds.remove(orderId));
    }
  }

  Future<void> _handleCancel(BuildContext ctx, int orderId) async {
    setState(() => _loadingIds.add(orderId));
    try {
      await _svc.cancelOrder(orderId);
      _showSnack(ctx, '취소 처리 완료');
      await _refresh();
    } catch (e) {
      _showSnack(ctx, '취소 실패: $e');
    } finally {
      if (mounted) setState(() => _loadingIds.remove(orderId));
    }
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

        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, i) {
            final it = items[i];
            final id = it.id ?? 0;
            final busy = _loadingIds.contains(id);
            final selected = _selectedId == id;

            return InkWell(
              onTap: () {
                setState(() => _selectedId = id);
                widget.onSelect?.call(it.from, it.to);
              },
              borderRadius: BorderRadius.circular(12),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: selected
                        ? Theme.of(context).colorScheme.primary
                        : Colors.transparent,
                    width: selected ? 1.5 : 0,
                  ),
                  borderRadius: BorderRadius.circular(12),
                  color: selected
                      ? Theme.of(context).colorScheme.primary.withOpacity(0.04)
                      : null,
                ),
                child: DeliveryItem(
                  orderId: id,
                  date: _fmtKoreanDate(it.sDate),
                  from: it.from,
                  to: it.to,
                  status: it.status,
                  busy: busy,
                  onDepart: it.status == 'READY'
                      ? () => _handleDepart(context, id)
                      : null,
                  onComplete: it.status == 'ONGOING'
                      ? () => _handleComplete(context, id)
                      : null,
                  onCancel: (it.status == 'READY' || it.status == 'ONGOING')
                      ? () => _handleCancel(context, id)
                      : null,
                ),
              ),
            );
          },
        );
      },
    );
  }
}
