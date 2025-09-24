// lib/model/car_owner_dashboard_models.dart

class DashboardSummaryDTO {
  final int assigned;
  final int ongoing;
  final int completed;
  final int total;
  final int thisMonthSettlement;

  DashboardSummaryDTO({
    required this.assigned,
    required this.ongoing,
    required this.completed,
    required this.total,
    required this.thisMonthSettlement,
  });

  factory DashboardSummaryDTO.fromJson(Map<String, dynamic> j) {
    return DashboardSummaryDTO(
      assigned: (j['assigned'] ?? 0) as int,
      ongoing: (j['ongoing'] ?? 0) as int,
      completed: (j['completed'] ?? 0) as int,
      total: (j['total'] ?? 0) as int,
      thisMonthSettlement: (j['thisMonthSettlement'] ?? 0) as int,
    );
  }
}

class DeliveryItemDTO {
  final String s_date; // "YYYY-MM-DD"
  final String from;
  final String to;

  DeliveryItemDTO({required this.s_date, required this.from, required this.to});

  factory DeliveryItemDTO.fromJson(Map<String, dynamic> j) {
    return DeliveryItemDTO(
      s_date: (j['date'] ?? '') as String,
      from: (j['from'] ?? '') as String,
      to: (j['to'] ?? '') as String,
    );
  }
}

class SalesChartDTO {
  final String day; // "YYYY-MM-DD"
  final int sales; // 금액
  final int deliveries; // 건수

  SalesChartDTO({
    required this.day,
    required this.sales,
    required this.deliveries,
  });

  factory SalesChartDTO.fromJson(Map<String, dynamic> j) {
    return SalesChartDTO(
      day: (j['day'] ?? '') as String,
      sales: (j['sales'] ?? 0) as int,
      deliveries: (j['deliveries'] ?? 0) as int,
    );
  }
}

class WarmthDTO {
  final int? score; // 0~100
  final int? reviewCount; // 선택
  final double? avg; // 선택

  WarmthDTO({this.score, this.reviewCount, this.avg});

  factory WarmthDTO.fromJson(Map<String, dynamic> j) {
    return WarmthDTO(
      score: j['score'] == null ? null : j['score'] as int,
      reviewCount: j['reviewCount'] == null ? null : j['reviewCount'] as int,
      avg: j['avg'] == null ? null : (j['avg'] as num).toDouble(),
    );
  }
}
