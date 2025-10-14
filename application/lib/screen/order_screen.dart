import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';

import '../provider/user_provider.dart';
import '../model/order.dart';
import '../model/bid.dart';
import '../repository/order_repository.dart';
import '../repository/bid_repository.dart';

class OrderScreen extends StatefulWidget {
  const OrderScreen({super.key});
  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  final _orderRepo = OrderRepository();
  List<Order> _orders = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final roleStr = context.read<UserProvider>().user?.role ?? 'shipper';
    final isShipper = roleStr == 'shipper';

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final list = await _orderRepo.fetchOrders(isShipper: isShipper);
      list.sort(
        (a, b) => (b.createdAt ?? DateTime(1970))
            .compareTo(a.createdAt ?? DateTime(1970)),
      );
      setState(() {
        _orders = list;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _loading = false;
        _error = '오더 조회 실패: $e';
      });
    }
  }

  void _updateLocal(Order updated) {
    final i = _orders.indexWhere((o) => o.id == updated.id);
    if (i != -1) setState(() => _orders[i] = updated);
  }

  Future<void> _createOrder() async {
    final createdPayload = await Navigator.of(context)
        .push<Map<String, dynamic>>(
      MaterialPageRoute(builder: (_) => const _CreateOrderPage()),
    );
    if (createdPayload == null) return;

    try {
      final saved = await _orderRepo.createOrderFromPayload(createdPayload);
      setState(() => _orders.insert(0, saved));
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('등록 완료')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('등록 실패: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final roleStr = context.watch<UserProvider>().user?.role ?? 'shipper';
    final isShipper = roleStr == 'shipper';

    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_error != null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(_error!, textAlign: TextAlign.center),
              const SizedBox(height: 12),
              FilledButton(onPressed: _load, child: const Text('다시 시도')),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: Column(
        children: [
          Container(height: 75, color: Colors.transparent),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isShipper ? '내 오더' : '오더 게시판',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                Chip(
                  label: Text(isShipper ? '화주' : '차주'),
                  backgroundColor:
                      Theme.of(context).colorScheme.surfaceContainerHighest,
                ),
              ],
            ),
          ),
          Expanded(
            child: isShipper
                ? _ShipperList(
                    orders:
                        _orders.where((o) => o.status != 'COMPLETED').toList(),
                    onConfirm: (order) async {
                      // 필요시 다른 곳에서 사용할 수 있으니 남겨둠 (결제하기에서는 호출 안 함)
                      await _orderRepo.updateStatus(order.id, 'COMPLETED');
                      _updateLocal(order.copyWith(status: 'COMPLETED'));
                    },
                    onAssigned: (order) async {
                      await _orderRepo.updateStatus(order.id, 'ASSIGNED');
                      _updateLocal(order.copyWith(status: 'ASSIGNED'));
                    },
                  )
                : _DriverBoard(
                    orders: _orders,
                    onTap: (o) async {
                      final updated = await Navigator.of(context).push<Order>(
                        MaterialPageRoute(
                          builder: (_) => _DriverOrderDetail(order: o),
                        ),
                      );
                      if (updated != null) _updateLocal(updated);
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: isShipper
          ? FloatingActionButton.extended(
              onPressed: _createOrder,
              icon: const Icon(Icons.add),
              label: const Text('등록'),
            )
          : null,
    );
  }
}

/* =========================
   화주 리스트 (입찰 보기/수락 포함)
   ========================= */
class _ShipperList extends StatefulWidget {
  final List<Order> orders;
  final Future<void> Function(Order) onConfirm;
  final Future<void> Function(Order) onAssigned;

  const _ShipperList({
    required this.orders,
    required this.onConfirm,
    required this.onAssigned,
  });

  @override
  State<_ShipperList> createState() => _ShipperListState();
}

class _ShipperListState extends State<_ShipperList> {
  String? _expandedId;

  void _toggle(String id) =>
      setState(() => _expandedId = (_expandedId == id) ? null : id);

  @override
  Widget build(BuildContext context) {
    if (widget.orders.isEmpty) {
      return const Center(child: Text('진행중인 오더가 없습니다.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: widget.orders.length,
      itemBuilder: (_, i) {
        final o = widget.orders[i];
        final isOpen = _expandedId == o.id;

        return Column(
          children: [
            Card(
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: InkWell(
                onTap: () => _toggle(o.id),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              o.orderNo.isNotEmpty ? o.orderNo : '오더',
                              style:
                                  const TextStyle(fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 4),
                            Text('${o.departure} → ${o.arrival}'),
                          ],
                        ),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _statusK(o.status),
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Icon(isOpen ? Icons.expand_less : Icons.expand_more),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            // ▼ 상세 패널
            AnimatedSize(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeInOut,
              alignment: Alignment.topCenter,
              child: isOpen
                  ? Container(
                      margin: const EdgeInsets.fromLTRB(12, 0, 12, 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context)
                            .colorScheme
                            .surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Theme.of(context).dividerColor.withOpacity(0.4),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // 상단 기본 정보
                          _kv('주문번호', o.orderNo),
                          _kv('경로', '${o.departure} → ${o.arrival}'),
                          _kv('상태', _statusK(o.status)),
                          if (o.createdAt != null)
                            _kv('등록일', _fmt(o.createdAt!)),

                          const SizedBox(height: 12),

                          // 화물 상세 카드
                          CargoDetailCard(order: o),

                          const SizedBox(height: 12),

                          // ▼ 버튼들: 동일 사이즈/스타일(OutlinedButton.icon)로 통일
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  icon: const Icon(Icons.gavel),
                                  label: const Text('입찰 보기'),
                                  onPressed: () =>
                                      _openBidsBottomSheet(context, o),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: OutlinedButton.icon(
                                  icon: const Icon(Icons.payments_outlined),
                                  label: const Text('결제하기'),
                                  onPressed: () {
                                    // ✅ 결제 안내만, 확정/상태변경 없음
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                          content:
                                              Text('결제 화면으로 이동합니다.')),
                                    );
                                  },
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    )
                  : const SizedBox.shrink(),
            ),
          ],
        );
      },
    );
  }

  Future<void> _openBidsBottomSheet(BuildContext ctx, Order order) async {
    await showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => _BidsSheet(order: order, onAccepted: widget.onAssigned),
    );
  }

  String _fmt(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}.${d.month.toString().padLeft(2, '0')}.${d.day.toString().padLeft(2, '0')} '
      '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';

  String _statusK(String s) {
    switch (s) {
      case 'OPEN':
        return '진행중';
      case 'ASSIGNED':
        return '배정';
      case 'COMPLETED':
        return '완료';
      case 'PAID':
        return '결제완료';
      default:
        return '없음';
    }
  }

  Widget _kv(String k, String v) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 110,
            child: Text(k, style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
          Expanded(child: Text(v, textAlign: TextAlign.right)),
        ],
      ),
    );
  }
}

/* =========================
   입찰 리스트 바텀시트 (화주가 수락)
   ========================= */
class _BidsSheet extends StatefulWidget {
  final Order order;
  final Future<void> Function(Order) onAccepted;
  const _BidsSheet({required this.order, required this.onAccepted});

  @override
  State<_BidsSheet> createState() => _BidsSheetState();
}

class _BidsSheetState extends State<_BidsSheet> {
  final _repo = BidRepository();
  late Future<List<Bid>> _future;

  @override
  void initState() {
    super.initState();
    _future = _repo.fetchBids(widget.order.id);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 16,
          right: 16,
          top: 8,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('입찰 내역', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            FutureBuilder<List<Bid>>(
              future: _future,
              builder: (_, snap) {
                if (snap.connectionState != ConnectionState.done) {
                  return const Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator(),
                  );
                }
                if (snap.hasError) {
                  return Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text('입찰 조회 실패: ${snap.error}'),
                  );
                }
                final bids = snap.data ?? [];
                if (bids.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.all(24),
                    child: Text('아직 등록된 입찰이 없습니다.'),
                  );
                }
                return ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: bids.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (_, i) {
                    final b = bids[i];
                    return ListTile(
                      leading: const Icon(Icons.local_shipping),
                      title: Text('${_won(b.price)}원'),
                      subtitle: Text(
                        '${b.driverNickname ?? '익명'} • ${_fmt(b.createdAt ?? DateTime.now())}',
                      ),
                      trailing: FilledButton(
                        onPressed: () async {
                          try {
                            await _repo.acceptBid(widget.order.id, b.id);
                            if (mounted) {
                              Navigator.of(context).pop();
                              await widget.onAccepted(widget.order); // 상태 갱신
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('확정완료')),
                              );
                            }
                          } on DioException catch (e) {
                            final msg = e.response?.data?.toString() ??
                                e.message ??
                                '알 수 없는 오류';
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('확정 실패: $msg')),
                              );
                            }
                          } catch (e) {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('확정 실패: $e')),
                              );
                            }
                          }
                        },
                        child: const Text('확정하기'),
                      ),
                    );
                  },
                );
              },
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  String _fmt(DateTime d) =>
      '${d.month.toString().padLeft(2, '0')}/${d.day.toString().padLeft(2, '0')} '
      '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  String _won(int v) =>
      v.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]},');
}

/* =========================
   차주 게시판 & 상세 (입찰 등록)
   ========================= */
class _DriverBoard extends StatelessWidget {
  final List<Order> orders;
  final ValueChanged<Order> onTap;
  const _DriverBoard({required this.orders, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              '※ 필터 기능은 추후 추가 예정입니다.',
              style: TextStyle(color: Colors.grey),
            ),
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: orders.length,
            itemBuilder: (_, i) {
              final o = orders[i];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                child: ListTile(
                  title: Text(
                    o.orderNo.isNotEmpty ? o.orderNo : '오더',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: Text('${o.departure} → ${o.arrival}'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => onTap(o),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

/* =========================
   차주 상세 (깔끔 + 화물상세 + 최근 내 입찰 유지)
   ========================= */

// 한글 매핑 테이블 (영문 코드 → 한글)
const cargoTypeMap = {'box': '박스', 'pallet': '파렛트', 'etc': '기타'};
const cargoSizeMap = {'small': '소형', 'medium': '중형', 'large': '대형'};
const vehicleMap = {
  '1ton': '1톤',
  '2.5ton': '2.5톤',
  '5ton': '5톤',
  '11ton': '11톤',
  'trailer': '트레일러',
};
const packingMap = {
  'normal': '일반포장',
  'special': '특수포장',
  'expensive': '고가화물',
  'fragile': '파손위험',
};

class _DriverOrderDetail extends StatefulWidget {
  final Order order;
  const _DriverOrderDetail({required this.order});

  @override
  State<_DriverOrderDetail> createState() => _DriverOrderDetailState();
}

class _DriverOrderDetailState extends State<_DriverOrderDetail> {
  late Order o;
  final _bidC = TextEditingController();
  final _bidRepo = BidRepository();
  bool _submitting = false;

  // 서버 조회 기반 최근 내 입찰
  Future<Bid?>? _myLastBidFuture;
  // 즉시 반영용 캐시
  Bid? _lastSubmitted;

  @override
  void initState() {
    super.initState();
    o = widget.order;
    _myLastBidFuture = _fetchMyLastBid();
  }

  Future<Bid?> _fetchMyLastBid() async {
    try {
      final me = context.read<UserProvider>().user;
      final myId = me?.idNum;
      if (myId == null) return null;

      final list = await _bidRepo.fetchBids(o.id);

      final mine = list.where((b) => b.driverIdNum == myId).toList()
        ..sort(
          (a, b) => (b.createdAt ?? DateTime(0))
              .compareTo(a.createdAt ?? DateTime(0)),
        );

      return mine.isNotEmpty ? mine.first : null;
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('오더 상세')),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              children: [
                Row(
                  children: [
                    Chip(
                      label: const Text('차주'),
                      backgroundColor: c.surfaceContainerHighest,
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: c.primaryContainer,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _statusK(o.status),
                        style: TextStyle(color: c.onPrimaryContainer),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  o.orderNo.isNotEmpty ? o.orderNo : '오더',
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 6),
                Text(
                  '${o.departure} → ${o.arrival}',
                  style: const TextStyle(color: Colors.black54),
                ),
                if (o.createdAt != null)
                  Text(
                    '등록: ${_fmt(o.createdAt!)}',
                    style: const TextStyle(color: Colors.black45),
                  ),
                const SizedBox(height: 12),

                // 화물 상세 카드
                CargoDetailCard(order: o),

                // 최근 내 입찰 (서버조회 + 즉시 캐시 반영)
                FutureBuilder<Bid?>(
                  future: _myLastBidFuture,
                  builder: (_, snap) {
                    final bid = _lastSubmitted ?? snap.data;
                    if (snap.connectionState != ConnectionState.done &&
                        _lastSubmitted == null) {
                      return const SizedBox(height: 8);
                    }
                    if (bid == null) return const SizedBox.shrink();
                    return Container(
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(top: 12),
                      decoration: BoxDecoration(
                        color: c.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(12),
                        border:
                            Border.all(color: Theme.of(context).dividerColor),
                      ),
                      child: Text(
                        '내 최근 입찰: ${_won(bid.price)}원'
                        '${bid.createdAt != null ? ' • ${_m2(bid.createdAt!)}' : ''}',
                      ),
                    );
                  },
                ),
              ],
            ),
          ),

          // 하단 고정 액션
          SafeArea(
            top: false,
            child: Container(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              decoration: BoxDecoration(
                color: Theme.of(context).scaffoldBackgroundColor,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 8,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _bidC,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: '입찰가(원)',
                        border: OutlineInputBorder(),
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton(
                    onPressed: _submitting
                        ? null
                        : () async {
                            final only =
                                _bidC.text.replaceAll(RegExp(r'[^0-9]'), '');
                            if (only.isEmpty) return;

                            setState(() => _submitting = true);
                            try {
                              final price = int.parse(only);
                              final submitted =
                                  await _bidRepo.submitBid(o.id, price);

                              setState(() {
                                _lastSubmitted = submitted; // 즉시 표시
                                _myLastBidFuture =
                                    Future.value(submitted); // 재진입 없이 유지
                                _bidC.clear();
                              });

                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('입찰 등록 완료')),
                                );
                              }
                            } on DioException catch (e) {
                              final msg = e.response?.data?.toString() ??
                                  e.message ??
                                  '알 수 없는 오류';
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('입찰 실패: $msg')),
                                );
                              }
                            } catch (e) {
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('입찰 실패: $e')),
                                );
                              }
                            } finally {
                              if (mounted) setState(() => _submitting = false);
                            }
                          },
                    child: _submitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('입찰하기'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _fmt(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}.${d.month.toString().padLeft(2, '0')}.${d.day.toString().padLeft(2, '0')} '
      '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  String _m2(DateTime d) =>
      '${d.month.toString().padLeft(2, '0')}/${d.day.toString().padLeft(2, '0')} '
      '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  String _won(int v) => v.toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]},',
      );
  String _statusK(String s) {
    switch (s) {
      case 'OPEN':
        return '진행중';
      case 'ASSIGNED':
        return '배정';
      case 'COMPLETED':
        return '완료';
      case 'PAID':
        return '결제완료';
      default:
        return '없음';
    }
  }
}

/* =========================
   화물 상세 카드 (한글 매핑 적용)
   ========================= */
class CargoDetailCard extends StatelessWidget {
  final Order order;
  const CargoDetailCard({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final divider = Divider(
      color: Theme.of(context).dividerColor.withOpacity(.4),
      height: 16,
    );

    final distance =
        order.distance != null ? '${order.distance!.toStringAsFixed(1)} km' : '-';
    final type = cargoTypeMap[order.cargoType] ?? order.cargoType ?? '-';
    final size = cargoSizeMap[order.cargoSize] ?? order.cargoSize ?? '-';
    final weight = order.weight ?? '-';
    final vehicle = vehicleMap[order.vehicle] ?? order.vehicle ?? '-';
    final pack = packingMap[order.packingOption] ?? order.packingOption ?? '-';
    final ship =
        order.isImmediate == null ? '-' : (order.isImmediate! ? '즉시배송' : '예약배송');
    final rsv = order.reservedDate ?? '-';

    return Card(
      elevation: 1.5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '화물 상세정보',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            _row('거리', distance),
            divider,
            _row('화물 종류', type),
            _row('화물 크기', size),
            _row('무게', weight),
            divider,
            _row('차량', vehicle),
            _row('포장 방식', pack),
            divider,
            _row('배송', ship),
            _row('예약일', rsv),
          ],
        ),
      ),
    );
  }

  Widget _row(String k, String v) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(
            child: Text(
              k,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.black54,
              ),
            ),
          ),
          Text(v, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

/* =========================
   등록 페이지 (payload 방식)
   ========================= */
class _CreateOrderPage extends StatefulWidget {
  const _CreateOrderPage();
  @override
  State<_CreateOrderPage> createState() => _CreateOrderPageState();
}

class _CreateOrderPageState extends State<_CreateOrderPage> {
  final _titleC = TextEditingController();
  final _fromC = TextEditingController();
  final _toC = TextEditingController();
  final _distanceC = TextEditingController();
  final _proposedPriceC = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('오더 등록')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _titleC,
            decoration: const InputDecoration(
              labelText: '제목(선택)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _fromC,
            decoration: const InputDecoration(
              labelText: '출발지',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _toC,
            decoration: const InputDecoration(
              labelText: '도착지',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _distanceC,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: '거리(km, 선택)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _proposedPriceC,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: '화주 제안가(원, 선택)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: () {
              if (_fromC.text.isEmpty || _toC.text.isEmpty) return;

              final payload = <String, dynamic>{
                'title': _titleC.text.isNotEmpty ? _titleC.text : null,
                'departure': _fromC.text,
                'arrival': _toC.text,
                if (_distanceC.text.isNotEmpty)
                  'distance': double.tryParse(_distanceC.text),
                if (_proposedPriceC.text.isNotEmpty)
                  'proposedPrice':
                      int.tryParse(_proposedPriceC.text.replaceAll(',', '')),
                'status': 'OPEN',
              }..removeWhere((k, v) => v == null);

              Navigator.of(context).pop(payload);
            },
            child: const Text('등록'),
          ),
        ],
      ),
    );
  }
}
