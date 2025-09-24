import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:application/model/order.dart';
import 'package:application/services/api_service.dart';

class ShipperMypage extends StatefulWidget {
  const ShipperMypage({super.key});

  @override
  State<ShipperMypage> createState() => _ShipperMypageState();
}

class _ShipperMypageState extends State<ShipperMypage> {
  late Future<List<Order>> _ordersFuture;
  final ApiService _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _ordersFuture = _apiService.fetchMyOrders();
  }

  void _refreshOrders() {
    setState(() {
      _ordersFuture = _apiService.fetchMyOrders();
    });
  }

  String _formatDate(DateTime dt) {
    return DateFormat('yyyy.MM.dd').format(dt);
  }

  Future<void> _submitReview(Order order, int rating, String comment) async {
    try {
      await _apiService.submitReview(
        orderId: order.id,
        rating: rating,
        comment: comment,
        targetId: order.targetId,
      );

      if (!mounted) return;

      Navigator.of(context).pop(); // 다이얼로그 닫기
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('리뷰가 성공적으로 제출되었습니다.')));
      _refreshOrders(); // 리뷰 제출 후 목록 새로고침
    } catch (e) {
      if (!mounted) return;
      // 에러 처리
      Navigator.of(context).pop();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('리뷰 제출에 실패했습니다: $e')));
    }
  }

  Future<void> _showReviewDialog(Order order) async {
    int rating = 5;
    final commentController = TextEditingController();

    return showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('리뷰 작성'),
              content: SingleChildScrollView(
                child: ListBody(
                  children: <Widget>[
                    Text('주문번호: ${order.orderNo}'),
                    const SizedBox(height: 20),
                    const Text('별점'),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        return IconButton(
                          icon: Icon(
                            index < rating ? Icons.star : Icons.star_border,
                            color: Colors.amber,
                          ),
                          onPressed: () {
                            setDialogState(() {
                              rating = index + 1;
                            });
                          },
                        );
                      }),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: commentController,
                      decoration: const InputDecoration(
                        hintText: '한줄평을 남겨주세요.',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 4,
                    ),
                  ],
                ),
              ),
              actions: <Widget>[
                TextButton(
                  child: const Text('취소'),
                  onPressed: () => Navigator.of(context).pop(),
                ),
                ElevatedButton(
                  child: const Text('제출'),
                  onPressed: () {
                    _submitReview(order, rating, commentController.text);
                  },
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FutureBuilder<List<Order>>(
        future: _ordersFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text("오류가 발생했습니다: ${snapshot.error}"));
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text("완료된 주문이 없습니다."));
          }

          // 완료된 오더만 필터링
          final completedOrders = snapshot.data!
              .where((order) => order.status == 'COMPLETED')
              .toList();

          if (completedOrders.isEmpty) {
            return const Center(child: Text("완료된 주문이 없습니다."));
          }

          return Padding(
            padding: EdgeInsetsGeometry.only(top: 50),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    '오더 내역',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                ),
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    itemCount: completedOrders.length,
                    itemBuilder: (context, index) {
                      final order = completedOrders[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 8.0,
                          vertical: 4.0,
                        ),
                        child: ListTile(
                          title: Text('주문번호: ${order.orderNo}'),
                          subtitle: Text(
                            '${order.departure} → ${order.arrival}' +
                                (order.completedAt != null
                                    ? '\n완료일: ${_formatDate(order.completedAt!)}'
                                    : ''),
                          ),
                          isThreeLine: true,
                          trailing: order.hasReview
                              ? const Chip(
                                  label: Text('작성 완료'),
                                  backgroundColor: Colors.grey,
                                )
                              : ElevatedButton(
                                  onPressed: () => _showReviewDialog(order),
                                  child: const Text('후기 작성'),
                                ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
