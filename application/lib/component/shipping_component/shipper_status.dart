import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:application/model/order.dart';
import 'package:application/services/api_service.dart';

class ShipperStatus extends StatefulWidget {
  const ShipperStatus({super.key});

  @override
  State<ShipperStatus> createState() => _ShipperStatusState();
}

class _ShipperStatusState extends State<ShipperStatus> {
  late Future<List<Order>> _ordersFuture;
  final ApiService _apiService = ApiService();
  String? _selectedOrderId;

  @override
  void initState() {
    super.initState();
    _ordersFuture = _apiService.fetchMyOrders();
  }

  // 날짜와 시간을 포맷하는 함수
  String _fmtDateTime(DateTime? dt) {
    if (dt == null) return "-";
    return DateFormat('yyyy.MM.dd HH:mm').format(dt);
  }

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
      default:
        return "상태 정보가 업데이트되었습니다.";
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Order>>(
      future: _ordersFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text("오류가 발생했습니다: ${snapshot.error}"));
        }
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text("진행중인 주문이 없습니다."));
        }

        final orders = snapshot.data!;
        // 최초 선택 ID 설정
        if (_selectedOrderId == null && orders.isNotEmpty) {
          _selectedOrderId = orders[0].id;
        }

        final selectedOrder = orders.firstWhere(
          (order) => order.id == _selectedOrderId,
          orElse: () => orders[0],
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
              _buildOrderSelector(orders),
              const SizedBox(height: 20),
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
          ),
        );
      },
    );
  }

  // 주문 선택 드롭다운 위젯
  Widget _buildOrderSelector(List<Order> orders) {
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
            items: orders.map<DropdownMenuItem<String>>((Order order) {
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

        return Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isActive || isCompleted
                    ? Colors.blue
                    : Colors.grey.shade300,
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

    // 현재 단계까지의 로그만 표시
    for (int i = 0; i <= currentStepIndex && i < steps.length; i++) {
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
