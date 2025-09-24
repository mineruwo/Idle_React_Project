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
            Row(
              children: [
                const Text('•', style: TextStyle(fontSize: 18, height: 1)),
                const SizedBox(width: 6),
                Text(date, style: const TextStyle(fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.circle, size: 10),
                const SizedBox(width: 8),
                Expanded(child: Text('$from  →  $to')),
              ],
            ),
            const SizedBox(height: 12),
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
