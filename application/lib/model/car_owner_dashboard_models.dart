// lib/model/car_owner_dashboard_models.dart

int _asInt(dynamic v, {int def = 0}) {
  if (v == null) return def;
  if (v is int) return v;
  if (v is num) return v.toInt();
  if (v is String) return int.tryParse(v) ?? def;
  return def;
}

double? _asDouble(dynamic v) {
  if (v == null) return null;
  if (v is double) return v;
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v);
  return null;
}

/// ===================== Summary =====================
class DashboardSummaryDTO {
  // 백엔드 필드
  final int scheduled; // = READY
  final int inProgress; // = ONGOING
  final int completed;
  final int total;
  final int revenue; // 이번 기간 매출 합
  final int commission; // %
  final int settlement; // 정산 예정액
  final String? name;
  final String? nickname;

  // 기존 프런트 코드 호환용 alias
  int get assigned => scheduled;
  int get ongoing => inProgress;
  int get thisMonthSettlement => settlement;

  DashboardSummaryDTO({
    required this.scheduled,
    required this.inProgress,
    required this.completed,
    required this.total,
    required this.revenue,
    required this.commission,
    required this.settlement,
    this.name,
    this.nickname,
  });

  factory DashboardSummaryDTO.fromJson(Map<String, dynamic> j) {
    return DashboardSummaryDTO(
      // 서버 키 우선 → 예전 키(fallback)
      scheduled: _asInt(j['scheduled'] ?? j['assigned']),
      inProgress: _asInt(j['inProgress'] ?? j['ongoing']),
      completed: _asInt(j['completed']),
      total: _asInt(j['total']),
      revenue: _asInt(j['revenue']),
      commission: _asInt(j['commission']),
      settlement: _asInt(j['settlement'] ?? j['thisMonthSettlement']),
      name: j['name'] as String?,
      nickname: j['nickname'] as String?,
    );
  }
}

/// ===================== Delivery list item =====================
class DeliveryItemDTO {
  final int? id;
  final String? deliveryNum;
  final String status; // "READY" | "ONGOING" | ...
  final String transportType; // cargoType 등
  final String from;
  final String to;
  final String sDate; // "YYYY-MM-DD" (예약일 > 생성일 > 수정일)

  DeliveryItemDTO({
    required this.id,
    required this.deliveryNum,
    required this.status,
    required this.transportType,
    required this.from,
    required this.to,
    required this.sDate,
  });

  factory DeliveryItemDTO.fromJson(Map<String, dynamic> j) {
    // 백엔드에서 's_date'를 내려주지만, 혹시 모를 호환을 위해 여러 키를 받음
    String rawDate =
        (j['s_date'] ?? j['date'] ?? j['reservedDate'] ?? j['createdAt'] ?? '')
            .toString();
    final sDate = rawDate.length >= 10 ? rawDate.substring(0, 10) : rawDate;

    return DeliveryItemDTO(
      id: _asInt(j['id'], def: 0),
      deliveryNum: j['deliveryNum']?.toString(),
      status: (j['status'] ?? 'NONE') as String,
      transportType:
          (j['transport_type'] ?? j['transportType'] ?? j['cargoType'] ?? '')
              as String,
      from: (j['from'] ?? j['departure'] ?? '') as String,
      to: (j['to'] ?? j['arrival'] ?? '') as String,
      sDate: sDate,
    );
  }
}

/// ===================== Sales chart =====================
class SalesChartDTO {
  final String day; // "YYYY-MM-DD"
  final int sales; // 금액(Long) → int 변환
  final int deliveries;

  SalesChartDTO({
    required this.day,
    required this.sales,
    required this.deliveries,
  });

  factory SalesChartDTO.fromJson(Map<String, dynamic> j) {
    return SalesChartDTO(
      day: (j['day'] ?? '') as String,
      sales: _asInt(j['sales']),
      deliveries: _asInt(j['deliveries']),
    );
  }
}

/// ===================== Warmth =====================
class WarmthDTO {
  final int? score; // 0~100
  final int? count; // 백엔드 필드명 'count'일 가능성 높음
  final double? avg; // 1~5 평균

  // 프런트 기존 이름 호환용
  int? get reviewCount => count;

  WarmthDTO({this.score, this.count, this.avg});

  factory WarmthDTO.fromJson(Map<String, dynamic> j) {
    return WarmthDTO(
      score: j['score'] == null ? null : _asInt(j['score']),
      count: j['count'] != null
          ? _asInt(j['count'])
          : (j['reviewCount'] != null ? _asInt(j['reviewCount']) : null),
      avg: _asDouble(j['avg']),
    );
  }
}
