import 'package:flutter/material.dart';

class DeliveryItem extends StatelessWidget {
  final String date;
  final String from;
  final String to;

  const DeliveryItem({
    super.key,
    required this.date,
    required this.from,
    required this.to,
  });

  @override
  Widget build(BuildContext context) {
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
            Align(
              alignment: Alignment.centerLeft,
              child: Wrap(
                spacing: 8,
                children: [
                  FilledButton.tonal(
                    onPressed: () {},
                    child: const Text('BUTTON'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
