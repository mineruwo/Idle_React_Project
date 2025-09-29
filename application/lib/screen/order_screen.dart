import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

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
      list.sort((a, b) =>
          (b.createdAt ?? DateTime(1970)).compareTo(a.createdAt ?? DateTime(1970)));
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
    final createdPayload = await Navigator.of(context).push<Map<String, dynamic>>(
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
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(_error!, textAlign: TextAlign.center),
            const SizedBox(height: 12),
            FilledButton(onPressed: _load, child: const Text('다시 시도')),
          ]),
        ),
      );
    }

    return Scaffold(
      body: Column(
        children: [
          // 상단 150px 여백
          Container(height: 150, color: Colors.transparent),

          // 타이틀 + 역할 뱃지
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(isShipper ? '내 오더' : '오더 게시판',
                    style: Theme.of(context)
                        .textTheme
                        .headlineSmall
                        ?.copyWith(fontWeight: FontWeight.w800)),
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
                    orders: _orders
                        .where((o) => o.status != OrderStatus.completed)
                        .toList(),
                    onConfirm: (order) async {
                      await _orderRepo.updateStatus(order.id, OrderStatus.completed);
                      _updateLocal(order.copyWith(status: OrderStatus.completed));
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('오더 확정 완료')),
                        );
                      }
                    },
                    onAssigned: (order) async {
                      await _orderRepo.updateStatus(order.id, OrderStatus.assigned);
                      _updateLocal(order.copyWith(status: OrderStatus.assigned));
                    },
                  )
                : _DriverBoard(
                    orders: _orders,
                    onTap: (o) async {
                      final updated =
                          await Navigator.of(context).push<Order>(MaterialPageRoute(
                        builder: (_) => _DriverOrderDetail(order: o),
                      ));
                      if (updated != null) _updateLocal(updated);
                    },
                  ),
          ),
        ],
      ),

      // 화주만 등록 버튼
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
   화주 리스트(카드 확장 + 입찰보기/수락 + 확정하기)
   ========================= */
class _ShipperList extends StatefulWidget {
  final List<Order> orders;
  final Future<void> Function(Order) onConfirm;
  final Future<void> Function(Order) onAssigned; // 입찰 수락 시 호출
  const _ShipperList(
      {required this.orders, required this.onConfirm, required this.onAssigned});

  @override
  State<_ShipperList> createState() => _ShipperListState();
}

class _ShipperListState extends State<_ShipperList> {
  String? _expandedId;
  bool _confirming = false;

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
                              Text(o.orderNo.isNotEmpty ? o.orderNo : '오더',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700)),
                              const SizedBox(height: 4),
                              Text('${o.departure} → ${o.arrival}'),
                            ]),
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
                          color:
                              Theme.of(context).dividerColor.withOpacity(0.4),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('주문번호', o.orderNo),
                          _kv('경로', '${o.departure} → ${o.arrival}'),
                          _kv('상태', _statusK(o.status)),
                          if (o.createdAt != null)
                            _kv('등록일', _fmt(o.createdAt!)),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  icon: const Icon(Icons.gavel),
                                  label: const Text('입찰 보기'),
                                  onPressed: () => _openBidsBottomSheet(context, o),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: FilledButton.tonal(
                                  onPressed: (o.status ==
                                              OrderStatus.completed ||
                                          _confirming)
                                      ? null
                                      : () async {
                                          setState(() => _confirming = true);
                                          try {
                                            await widget.onConfirm(o);
                                            if (mounted) {
                                              setState(() => _expandedId = null);
                                            }
                                          } finally {
                                            if (mounted) {
                                              setState(
                                                  () => _confirming = false);
                                            }
                                          }
                                        },
                                  child: _confirming
                                      ? const SizedBox(
                                          height: 20,
                                          width: 20,
                                          child: CircularProgressIndicator(
                                              strokeWidth: 2))
                                      : const Text('확정하기'),
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

  String _statusK(OrderStatus s) {
    switch (s) {
      case OrderStatus.open:
        return '진행중';
      case OrderStatus.assigned:
        return '배정';
      case OrderStatus.completed:
        return '완료';
      case OrderStatus.paid:
        return '결제완료';
      case OrderStatus.none:
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
              child:
                  Text(k, style: const TextStyle(fontWeight: FontWeight.w600))),
          Expanded(child: Text(v, textAlign: TextAlign.right)),
        ],
      ),
    );
  }
}

/* =========================
   입찰 리스트 바텀시트(화주가 수락)
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
                        '${b.driverNickname ?? "기사"}'
                        ' • ${_fmt(b.createdAt ?? DateTime.now())}',
                      ),
                      trailing: FilledButton(
                        onPressed: () async {
                          try {
                            await _repo.acceptBid(widget.order.id, b.id);
                            if (!mounted) return;
                            Navigator.of(context).pop(); // 바텀시트 닫기
                            await widget.onAccepted(widget.order);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                  content:
                                      Text('입찰 수락 완료: ${_won(b.price)}원')),
                            );
                          } catch (e) {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('수락 실패: $e')),
                              );
                            }
                          }
                        },
                        child: const Text('수락'),
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
   차주 게시판
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
            child: Text('※ 필터 기능은 추후 추가 예정입니다.',
                style: TextStyle(color: Colors.grey)),
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
                  title: Text(o.orderNo.isNotEmpty ? o.orderNo : '오더',
                      style: const TextStyle(fontWeight: FontWeight.w600)),
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
   차주 상세(입찰 등록: 서버 전송 + 내 최근 입찰가 유지)
   ========================= */
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

  /// 내 최근 입찰가(서버에서 로드하거나 방금 제출한 값)
  int _lastSubmitted = 0;

  @override
  void initState() {
    super.initState();
    o = widget.order;
    _loadMyLastBid(); // 입장 시 서버에서 내 최근 입찰가 로드
  }

 Future<void> _loadMyLastBid() async {
  try {
    final me = context.read<UserProvider>().user; // LoginModel
    final bids = await _bidRepo.fetchBids(o.id);  // List<Bid>

    // 내 입찰만 필터링: idNum 또는 id(=이메일) 둘 중 하나라도 일치하면 내 입찰로 간주
    final myBids = bids.where((b) {
      final byIdNum   = (me?.idNum != null && b.driverIdNum == me!.idNum);
      final byEmailId = (me?.id.isNotEmpty == true && b.driverEmail == me!.id);
      return byIdNum || byEmailId;
    }).toList()
      ..sort((a, b) =>
        (a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0))
          .compareTo(b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0)));

    if (myBids.isNotEmpty && mounted) {
      setState(() => _lastSubmitted = myBids.last.price); // 상단 “내 최근 입찰가: …원”
    }
  } catch (_) {
    // 실패해도 조용히 무시 (0원 유지)
  }
}

  @override
  Widget build(BuildContext context) {
    final c = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('오더 상세')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child:
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
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
              child: Text(_statusK(o.status),
                  style: TextStyle(color: c.onPrimaryContainer)),
            ),
          ]),
          const SizedBox(height: 12),
          Text(o.orderNo.isNotEmpty ? o.orderNo : '오더',
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text('${o.departure} → ${o.arrival}'),
          if (o.createdAt != null) Text('등록: ${_fmt(o.createdAt!)}'),
          const SizedBox(height: 12),
          // ✅ 내 최근 입찰가 표시(서버/로컬 최신)
          Text('내 최근 입찰가: ${_won(_lastSubmitted)}원',
              style: TextStyle(
                  color: c.primary, fontWeight: FontWeight.w600)),
          const Spacer(),
          TextField(
            controller: _bidC,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: '입찰가(원)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 8),
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
                      await _bidRepo.submitBid(o.id, price);

                      if (!mounted) return;

                      // 팝업 닫지 않고 로컬 반영 + 입력값 클리어
                      setState(() {
                        _lastSubmitted = price;
                        _bidC.clear();
                      });

                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                            content: Text('입찰 등록 완료: ${_won(price)}원')),
                      );
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
                    child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('입찰하기'),
          ),
        ]),
      ),
    );
  }

  String _fmt(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}.${d.month.toString().padLeft(2, '0')}.${d.day.toString().padLeft(2, '0')} '
      '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';

  String _statusK(OrderStatus s) {
    switch (s) {
      case OrderStatus.open:
        return '진행중';
      case OrderStatus.assigned:
        return '배정';
      case OrderStatus.completed:
        return '완료';
      case OrderStatus.paid:
        return '결제완료';
      case OrderStatus.none:
      default:
        return '없음';
    }
  }

  String _won(int v) =>
      v.toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},');
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
  final _distanceC = TextEditingController(); // 선택
  final _proposedPriceC = TextEditingController(); // 선택

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
