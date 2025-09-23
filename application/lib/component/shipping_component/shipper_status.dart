import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

// API 응답을 모델링하는 Order 클래스
class Order {
  final String id;
  final String orderNo;
  final String departure;
  final String status;
  final DateTime? createdAt;
  final DateTime? assignedAt;
  final DateTime? paidAt;
  final DateTime? departedAt;
  final DateTime? completedAt;

  Order({
    required this.id,
    required this.orderNo,
    required this.departure,
    required this.status,
    this.createdAt,
    this.assignedAt,
    this.paidAt,
    this.departedAt,
    this.completedAt,
  });

  // JSON에서 Order 객체를 생성하는 팩토리 생성자
  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'].toString(),
      orderNo: json['orderNo'] ?? '',
      departure: json['departure'] ?? '',
      status: json['status'] ?? 'NONE',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
      assignedAt: json['assignedAt'] != null
          ? DateTime.parse(json['assignedAt'])
          : null,
      paidAt: json['paidAt'] != null ? DateTime.parse(json['paidAt']) : null,
      departedAt: json['departedAt'] != null
          ? DateTime.parse(json['departedAt'])
          : null,
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'])
          : null,
    );
  }
}

class ShipperStatus extends StatefulWidget {
  const ShipperStatus({super.key});

  @override
  State<ShipperStatus> createState() => _ShipperStatusComponentState();
}

class _ShipperStatusComponentState extends State<ShipperStatus> {
  List<Order> _shippingData = [];
  String? _selectedOrderId;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchShippingData();
  }

  // API로부터 배송 데이터를 가져오는 함수
  Future<void> _fetchShippingData() async {
    // TODO: 실제 API 호출 로직으로 교체해야 합니다.
    // 예: final data = await fetchMyOrders();
    // 아래는 더미 데이터입니다.
    final dummyData = [
      {
        "id": "1",
        "orderNo": "ORD12345",
        "departure": "서울",
        "status": "ONGOING",
        "createdAt": "2023-10-27T10:00:00Z",
        "assignedAt": "2023-10-27T11:00:00Z",
        "paidAt": "2023-10-27T12:00:00Z",
        "departedAt": "2023-10-27T13:00:00Z",
        "completedAt": null,
      },
      {
        "id": "2",
        "orderNo": "ORD67890",
        "departure": "부산",
        "status": "CREATED",
        "createdAt": "2023-10-28T14:00:00Z",
        "assignedAt": null,
        "paidAt": null,
        "departedAt": null,
        "completedAt": null,
      },
    ];

    final orders = (dummyData as List)
        .map((item) => Order.fromJson(item))
        .toList();

    setState(() {
      _shippingData = orders;
      if (orders.isNotEmpty) {
        _selectedOrderId = orders[0].id;
      }
      _isLoading = false;
    });
  }

  // 날짜와 시간을 포맷하는 함수
  String _fmtDateTime(DateTime? dt) {
    if (dt == null) return "-";
    return DateFormat('yyyy.MM.dd HH:mm').format(dt);
  }

  // 상태 코드에 따른 한글 설명
  static const Map<String, String> _statusMap = {
    "CREATED": "오더신청",
    "PAYMENT_PENDING": "차주 연결",
    "READY": "운송준비중",
    "ONGOING": "운송중",
    "COMPLETED": "운송완료",
    "CANCELED": "취소됨",
    "NONE": "상태없음",
  };

  // 상태 코드에 따른 상세 설명
  String _getStatusDescription(String status) {
    switch (status) {
      case "CREATED":
        return "화물 운송 오더가 접수되었습니다.";
      case "PAYMENT_PENDING":
        return "차주와 연결중입니다.";
      case "READY":
        return "운송 준비 중입니다.";
      case "ONGOING":
        return "화물이 운송 중입니다.";
      case "COMPLETED":
        return "운송이 완료되었습니다.";
      case "CANCELED":
        return "오더가 취소되었습니다.";
      case "NONE":
        return "상태 정보가 없습니다.";
      default:
        return "상태 정보가 업데이트되었습니다.";
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    final selectedOrder = _shippingData.firstWhere(
      (order) => order.id == _selectedOrderId,
      orElse: () => _shippingData.isNotEmpty
          ? _shippingData[0]
          : Order(id: '', orderNo: '', departure: '', status: 'NONE'),
    );

    final steps = [
      _buildStep("오더신청", Icons.note_add, "CREATED"),
      _buildStep("차주 연결", Icons.person_search, "PAYMENT_PENDING"),
      _buildStep("운송준비중", Icons.inventory_2, "READY"),
      _buildStep("운송중", Icons.local_shipping, "ONGOING"),
      _buildStep("운송완료", Icons.check_circle, "COMPLETED"),
    ];

    final currentStepIndex = steps.indexWhere(
      (step) => step['status'] == selectedOrder.status,
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildOrderSelector(),
          const SizedBox(height: 20),
          if (_selectedOrderId != null) ...[
            Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "주문 번호: ${selectedOrder.orderNo}",
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 20),
                    _buildStepper(steps, currentStepIndex),
                    const SizedBox(height: 20),
                    _buildStatusLogs(selectedOrder, steps, currentStepIndex),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // 주문 선택 드롭다운 위젯
  Widget _buildOrderSelector() {
    return Row(
      children: [
        const Text("주문 선택:", style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(width: 10),
        Expanded(
          child: DropdownButton<String>(
            value: _selectedOrderId,
            isExpanded: true,
            onChanged: (String? newValue) {
              setState(() {
                _selectedOrderId = newValue;
              });
            },
            items: _shippingData.map<DropdownMenuItem<String>>((Order order) {
              return DropdownMenuItem<String>(
                value: order.id,
                child: Text("주문번호: ${order.orderNo} (출발: ${order.departure})"),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  // 각 단계의 정보를 담는 맵 생성
  Map<String, dynamic> _buildStep(String name, IconData icon, String status) {
    return {'name': name, 'icon': icon, 'status': status};
  }

  // 배송 상태 스텝퍼 위젯
  Widget _buildStepper(List<Map<String, dynamic>> steps, int currentStepIndex) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(steps.length, (index) {
        final isCompleted = index < currentStepIndex;
        final isActive = index == currentStepIndex;
        final isHollow = index > currentStepIndex;

        return Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isActive || isCompleted
                    ? Colors.blue
                    : Colors.grey.shade300,
                border: isHollow ? Border.all(color: Colors.grey) : null,
              ),
              child: Icon(
                steps[index]['icon'],
                color: isActive || isCompleted ? Colors.white : Colors.grey,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              steps[index]['name'],
              style: TextStyle(color: isActive ? Colors.blue : Colors.black),
            ),
          ],
        );
      }),
    );
  }

  // 상태 변경 로그 위젯
  Widget _buildStatusLogs(
    Order order,
    List<Map<String, dynamic>> steps,
    int currentStepIndex,
  ) {
    final logEntries = <Map<String, String>>[];

    DateTime? getTimeForStatus(String status) {
      switch (status) {
        case "CREATED":
          return order.createdAt;
        case "PAYMENT_PENDING":
          return order.assignedAt;
        case "READY":
          return order.paidAt;
        case "ONGOING":
          return order.departedAt;
        case "COMPLETED":
          return order.completedAt;
        default:
          return null;
      }
    }

    for (int i = 0; i <= currentStepIndex; i++) {
      final step = steps[i];
      final status = step['status'];
      final time = getTimeForStatus(status);

      if (time != null) {
        logEntries.add({
          'timestamp': _fmtDateTime(time),
          'statusName': step['name'],
          'description': _getStatusDescription(status),
        });
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "진행 상태 로그",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        const Divider(),
        Table(
          columnWidths: const {
            0: FlexColumnWidth(2),
            1: FlexColumnWidth(1.5),
            2: FlexColumnWidth(3),
          },
          children: [
            const TableRow(
              children: [
                Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Text(
                    "시간",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Text(
                    "진행상태",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Text(
                    "내용",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            ...logEntries.reversed.map((log) {
              return TableRow(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(log['timestamp']!),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(log['statusName']!),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(log['description']!),
                  ),
                ],
              );
            }),
          ],
        ),
      ],
    );
  }
}
