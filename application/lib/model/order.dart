class Order {
  final String id;
  final String orderNo;
  final String departure;
  final String arrival;
  final String status;
  final DateTime? createdAt;
  final DateTime? assignedAt;
  final DateTime? paidAt;
  final DateTime? departedAt;
  final DateTime? completedAt;
  final bool hasReview;
  final String targetId;

  Order({
    required this.id,
    required this.orderNo,
    required this.departure,
    required this.arrival,
    required this.status,
    this.createdAt,
    this.assignedAt,
    this.paidAt,
    this.departedAt,
    this.completedAt,
    this.hasReview = false,
    required this.targetId,
  });

  // JSON 데이터로부터 Order 객체를 생성하는 팩토리 생성자
  factory Order.fromJson(Map<String, dynamic> json) {
    // 백엔드에서 오는 id가 숫자일 수 있으므로 toString()으로 안전하게 변환
    final id = json['id']?.toString() ?? '';

    return Order(
      id: id,
      orderNo: json['orderNo'] ?? '',
      departure: json['departure'] ?? '',
      arrival: json['arrival'] ?? '',
      status: json['status'] ?? 'NONE',
      // 날짜 필드들은 null일 수 있으므로 파싱 전에 null 체크
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
      assignedAt: json['assignedAt'] != null
          ? DateTime.parse(json['assignedAt'])
          : null,
      paidAt: json['paidAt'] != null ? DateTime.parse(json['paidAt']) : null,
      departedAt: json['departedAt'] != null
          ? DateTime.parse(json['departedAt'])
          : null,
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'])
          : null,
      hasReview: json['hasReview'] ?? false,
      targetId: json['targetId']?.toString() ?? '',
    );
  }
}
