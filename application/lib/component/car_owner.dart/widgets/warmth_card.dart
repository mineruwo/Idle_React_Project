import 'package:flutter/material.dart';

class WarmthCard extends StatelessWidget {
  final String scoreText;
  const WarmthCard({super.key, required this.scoreText});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '따뜻함 점수',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 16),
            const Center(child: Icon(Icons.favorite, size: 64)),
            const SizedBox(height: 8),
            Center(
              child: Text(
                scoreText,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
