import 'package:flutter/material.dart';

class TransportItem extends StatelessWidget {
  final String date;
  final String from;
  final String to;

  const TransportItem({
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
            _Bullet(date),
            const SizedBox(height: 6),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(width: 6),
                const Icon(Icons.circle, size: 10),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '$from  →  $to',
                    style: const TextStyle(fontSize: 13, height: 1.4),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Bullet extends StatelessWidget {
  final String text;
  const _Bullet(this.text);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Text('•', style: TextStyle(fontSize: 18, height: 1)),
        const SizedBox(width: 6),
        Text(text, style: const TextStyle(fontWeight: FontWeight.w700)),
      ],
    );
  }
}
