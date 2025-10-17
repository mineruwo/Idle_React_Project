import 'package:flutter/material.dart';
import '../component/car_owner.dart/widgets/section_title.dart';
import '../component/car_owner.dart/widgets/delivery_list.dart';
import '../component/car_owner.dart/widgets/map_route_hybrid_card.dart';

class DeliveryScreen extends StatefulWidget {
  const DeliveryScreen({super.key});

  @override
  State<DeliveryScreen> createState() => _DeliveryScreenState();
}

class _DeliveryScreenState extends State<DeliveryScreen> {
  String? _from;
  String? _to;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 50),
            Text('배송', style: Theme.of(context).textTheme.headlineSmall),

            // ✅ 지도(경로 + 거리)
            MapRouteHybridCard(originAddress: _from, destAddress: _to),

            const SizedBox(height: 6),

            const SectionTitle('운송중'),
            DeliveryList(
              onSelect: (from, to) {
                setState(() {
                  _from = from;
                  _to = to;
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}
