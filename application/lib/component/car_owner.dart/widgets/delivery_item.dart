import 'package:flutter/material.dart';

class DeliveryItem extends StatelessWidget {
  final int orderId;
  final String date;
  final String from;
  final String to;
  final String status; // "READY" | "ONGOING" | "COMPLETED" ...
  final bool busy; // 처리 중 버튼 비활성화
  final VoidCallback? onDepart; // READY -> ONGOING
  final VoidCallback? onComplete; // ONGOING -> COMPLETED
  final VoidCallback? onCancel; // READY/ONGOING -> CANCELED (선택)

  const DeliveryItem({
    super.key,
    required this.orderId,
    required this.date,
    required this.from,
    required this.to,
    required this.status,
    this.busy = false,
    this.onDepart,
    this.onComplete,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    // 상태별 버튼 구성
    List<Widget> actionButtons() {
      if (status == 'READY') {
        return [
          FilledButton(
            onPressed: busy ? null : onDepart,
            child: const Text('상차'),
          ),
          OutlinedButton(
            onPressed: busy ? null : onCancel,
            child: const Text('취소'),
          ),
        ];
      } else if (status == 'ONGOING') {
        return [
          FilledButton(
            onPressed: busy ? null : onComplete,
            child: const Text('배송 완료'),
          ),
          OutlinedButton(
            onPressed: busy ? null : onCancel,
            child: const Text('취소'),
          ),
        ];
      } else {
        // COMPLETED / CANCELED 등: 버튼 없음
        return [];
      }
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 날짜
            Row(
              children: [
                Text(
                  date.isEmpty ? '날짜 없음' : date,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Spacer(),
                // 상태 뱃지
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(999),
                    color: Colors.black12,
                  ),
                  child: Text(status, style: const TextStyle(fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // 출발 -> 도착
            Row(
              children: [
                const Icon(Icons.circle, size: 10),
                const SizedBox(width: 8),
                Expanded(child: Text('$from  →  $to')),
              ],
            ),

            const SizedBox(height: 12),

            // 버튼들
            if (actionButtons().isNotEmpty)
              Align(
                alignment: Alignment.centerLeft,
                child: Wrap(spacing: 8, children: actionButtons()),
              ),
          ],
        ),
      ),
    );
  }
}
