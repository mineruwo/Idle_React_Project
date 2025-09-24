import 'package:flutter/material.dart';

/* =========================
   간단 목업 데이터/유틸
   ========================= */
enum UserRole { shipper, driver }
enum OrderStatus { progressing, assigned, completed }

class OrderItem {
  final String id;
  final String title;
  final String from;
  final String to;
  final double distanceKm;
  final DateTime createdAt;
  final int? proposedPrice;   // 화주 제안가
  final int? driverBidPrice;  // 차주 입찰가
  final OrderStatus status;

  const OrderItem({
    required this.id,
    required this.title,
    required this.from,
    required this.to,
    required this.distanceKm,
    required this.createdAt,
    this.proposedPrice,
    this.driverBidPrice,
    this.status = OrderStatus.progressing,
  });

  OrderItem copyWith({
    String? id,
    String? title,
    String? from,
    String? to,
    double? distanceKm,
    DateTime? createdAt,
    int? proposedPrice,
    int? driverBidPrice,
    OrderStatus? status,
  }) {
    return OrderItem(
      id: id ?? this.id,
      title: title ?? this.title,
      from: from ?? this.from,
      to: to ?? this.to,
      distanceKm: distanceKm ?? this.distanceKm,
      createdAt: createdAt ?? this.createdAt,
      proposedPrice: proposedPrice ?? this.proposedPrice,
      driverBidPrice: driverBidPrice ?? this.driverBidPrice,
      status: status ?? this.status,
    );
  }
}

String _won(int v) {
  final s = v.toString();
  return s.replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},');
}

/* =========================
   오더 화면 (은별 담당) — 상단 150px 빈 여백
   ========================= */
class OrderScreen extends StatefulWidget {
  const OrderScreen({super.key});

  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  UserRole _role = UserRole.shipper;

  final List<OrderItem> _orders = [
    OrderItem(
      id: 'A-001',
      title: '오더 1',
      from: '서울',
      to: '부산',
      distanceKm: 401.3,
      createdAt: DateTime(2025, 9, 20, 9, 30),
      proposedPrice: 180000,
    ),
    OrderItem(
      id: 'A-002',
      title: '오더 2',
      from: '인천',
      to: '대전',
      distanceKm: 151.2,
      createdAt: DateTime(2025, 9, 21, 13, 10),
    ),
    OrderItem(
      id: 'A-003',
      title: '오더 3',
      from: '부산',
      to: '광주',
      distanceKm: 209.7,
      createdAt: DateTime(2025, 9, 22, 16, 40),
      proposedPrice: 230000,
    ),
  ];

  void _updateOrder(OrderItem updated) {
    final idx = _orders.indexWhere((o) => o.id == updated.id);
    if (idx != -1) setState(() => _orders[idx] = updated);
  }

  Future<void> _createOrder() async {
    final created = await Navigator.of(context).push<OrderItem>(
      MaterialPageRoute(builder: (_) => const _CreateOrderPage()),
    );
    if (created != null) setState(() => _orders.add(created));
  }

  @override
  Widget build(BuildContext context) {
    // 날짜 내림차순
    final list = [..._orders]..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    final shipperList = list.where((o) => o.status != OrderStatus.completed).toList();
    final driverList = list; // 게시판: 전부 노출

    return Scaffold(
      // ⬇️ AppBar 없음. 최상단에 150px 빈 여백을 확보.
      body: Column(
        children: [
          // 150px 빈 배경(색상은 투명으로도 가능)
          Container(height: 150, color: Colors.transparent),

          // 타이틀 + 역할 전환 (여백 아래에서 시작)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('오더',
                    style: Theme.of(context)
                        .textTheme
                        .headlineSmall
                        ?.copyWith(fontWeight: FontWeight.w800)),
                SegmentedButton<UserRole>(
                  segments: const [
                    ButtonSegment(value: UserRole.shipper, label: Text('화주')),
                    ButtonSegment(value: UserRole.driver,  label: Text('차주')),
                  ],
                  selected: {_role},
                  onSelectionChanged: (s) => setState(() => _role = s.first),
                ),
              ],
            ),
          ),

          // 본문
          Expanded(
            child: _role == UserRole.shipper
                ? _ShipperList(
                    orders: shipperList,
                    onUpdate: _updateOrder, // 상세 패널 확정 시 반영
                  )
                : _DriverBoard(
                    orders: driverList,
                    onTap: (o) async {
                      final updated = await Navigator.of(context).push<OrderItem>(
                        MaterialPageRoute(
                          builder: (_) => _OrderDetailPage(role: _role, order: o),
                        ),
                      );
                      if (updated != null) _updateOrder(updated);
                    },
                  ),
          ),
        ],
      ),

      // 화주일 때만 등록 FAB 노출
      floatingActionButton: _role == UserRole.shipper
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
   화주: 진행중 리스트 + 카드 하단 상세 패널(토글)
   ========================= */
class _ShipperList extends StatefulWidget {
  final List<OrderItem> orders;
  final ValueChanged<OrderItem> onUpdate;
  const _ShipperList({required this.orders, required this.onUpdate});

  @override
  State<_ShipperList> createState() => _ShipperListState();
}

class _ShipperListState extends State<_ShipperList> with TickerProviderStateMixin {
  String? _expandedId; // 열려있는 카드 id

  void _toggle(String id) {
    setState(() => _expandedId = (_expandedId == id) ? null : id);
  }

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
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(o.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 4),
                          Text('${o.from} → ${o.to} • ${o.distanceKm.toStringAsFixed(1)} km'),
                        ]),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            switch (o.status) {
                              OrderStatus.progressing => '진행중',
                              OrderStatus.assigned    => '배정',
                              OrderStatus.completed   => '완료',
                            },
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

            // ▼ 상세 패널 (카드 아래로 슬라이드 오픈)
            AnimatedSize(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeInOut,
              alignment: Alignment.topCenter,
              child: isOpen
                  ? Container(
                      margin: const EdgeInsets.fromLTRB(12, 0, 12, 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Theme.of(context).dividerColor.withOpacity(0.4),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _kv('경로', '${o.from} → ${o.to}'),
                          _kv('거리', '${o.distanceKm.toStringAsFixed(1)} km'),
                          if (o.proposedPrice != null) _kv('화주 제안가', '${_won(o.proposedPrice!)}원'),
                          if (o.driverBidPrice != null) _kv('기사 입찰가', '${_won(o.driverBidPrice!)}원'),
                          _kv(
                            '상태',
                            switch (o.status) {
                              OrderStatus.progressing => '진행중',
                              OrderStatus.assigned    => '배정',
                              OrderStatus.completed   => '완료',
                            },
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: FilledButton.tonal(
                                  onPressed: o.status == OrderStatus.completed
                                      ? null
                                      : () {
                                          final updated = o.copyWith(status: OrderStatus.completed);
                                          widget.onUpdate(updated);
                                          setState(() => _expandedId = null); // 닫기
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(content: Text('오더가 확정되었습니다.')),
                                          );
                                        },
                                  child: const Text('확정하기'),
                                ),
                              ),
                              const SizedBox(width: 8),
                              OutlinedButton(
                                onPressed: () => _toggle(o.id),
                                child: const Text('닫기'),
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

  Widget _kv(String k, String v) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(width: 110, child: Text(k, style: const TextStyle(fontWeight: FontWeight.w600))),
          Expanded(child: Text(v, textAlign: TextAlign.right)),
        ],
      ),
    );
  }
}

/* =========================
   차주: 오더 게시판 (검색X/날짜순)
   ========================= */
class _DriverBoard extends StatelessWidget {
  final List<OrderItem> orders;
  final ValueChanged<OrderItem> onTap;
  const _DriverBoard({required this.orders, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text('※ 필터 기능은 추후 추가 예정입니다.', style: TextStyle(color: Colors.grey)),
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
                  title: Text(o.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('${o.from} → ${o.to} • ${o.distanceKm.toStringAsFixed(1)} km'),
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
   상세: 차주=입찰 / 화주=확정(화주는 인라인로 대체)
   ========================= */
class _OrderDetailPage extends StatefulWidget {
  final UserRole role;
  final OrderItem order;
  const _OrderDetailPage({required this.role, required this.order});

  @override
  State<_OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends State<_OrderDetailPage> {
  late OrderItem o;
  final TextEditingController _bidC = TextEditingController();

  @override
  void initState() {
    super.initState();
    o = widget.order;
  }

  @override
  Widget build(BuildContext context) {
    final c = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('오더 상세')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(
            children: [
              Chip(
                label: Text(widget.role == UserRole.driver ? '차주' : '화주'),
                backgroundColor: c.surfaceContainerHighest,
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: c.primaryContainer, borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  switch (o.status) {
                    OrderStatus.progressing => '진행중',
                    OrderStatus.assigned    => '배정',
                    OrderStatus.completed   => '완료',
                  },
                  style: TextStyle(color: c.onPrimaryContainer),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(o.title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text('${o.from} → ${o.to}'),
          Text('거리: ${o.distanceKm.toStringAsFixed(1)} km'),
          if (o.proposedPrice != null) Text('화주 제안가: ${_won(o.proposedPrice!)}원'),
          if (o.driverBidPrice != null) Text('내 입찰가: ${_won(o.driverBidPrice!)}원'),
          const Spacer(),
          if (widget.role == UserRole.driver) ...[
            TextField(
              controller: _bidC,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: '입찰가(원)', border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 8),
            FilledButton(
              onPressed: () {
                final only = _bidC.text.replaceAll(RegExp(r'[^0-9]'), '');
                if (only.isEmpty) return;
                final price = int.parse(only);
                setState(() => o = o.copyWith(driverBidPrice: price, status: OrderStatus.assigned));
                Navigator.of(context).pop(o);
              },
              child: const Text('입찰하기'),
            ),
          ],
        ]),
      ),
    );
  }
}

/* =========================
   등록 페이지 (화주만 노출)
   ========================= */
class _CreateOrderPage extends StatefulWidget {
  const _CreateOrderPage();

  @override
  State<_CreateOrderPage> createState() => _CreateOrderPageState();
}

class _CreateOrderPageState extends State<_CreateOrderPage> {
  final _titleC = TextEditingController();
  final _fromC  = TextEditingController();
  final _toC    = TextEditingController();
  final _distC  = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('오더 등록')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(controller: _titleC, decoration: const InputDecoration(labelText: '제목', border: OutlineInputBorder())),
          const SizedBox(height: 12),
          TextField(controller: _fromC,  decoration: const InputDecoration(labelText: '출발지', border: OutlineInputBorder())),
          const SizedBox(height: 12),
          TextField(controller: _toC,    decoration: const InputDecoration(labelText: '도착지', border: OutlineInputBorder())),
          const SizedBox(height: 12),
          TextField(
            controller: _distC,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: '거리(km)', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: () {
              if (_titleC.text.isEmpty || _fromC.text.isEmpty || _toC.text.isEmpty || _distC.text.isEmpty) return;
              final d = double.tryParse(_distC.text) ?? 0.0;
              final now = DateTime.now();
              final item = OrderItem(
                id: 'N-${now.millisecondsSinceEpoch}',
                title: _titleC.text,
                from: _fromC.text,
                to: _toC.text,
                distanceKm: d,
                createdAt: now,
                proposedPrice: null,
              );
              Navigator.of(context).pop(item);
            },
            child: const Text('등록'),
          ),
        ],
      ),
    );
  }
}
