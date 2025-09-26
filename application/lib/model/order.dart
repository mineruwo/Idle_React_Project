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

  const Order({
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

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id']?.toString() ?? '',
      orderNo: json['orderNo']?.toString() ?? '',
      departure: json['departure']?.toString() ?? '',
      arrival: json['arrival']?.toString() ?? '',
      status: json['status']?.toString() ?? 'NONE',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
      assignedAt: DateTime.tryParse(json['assignedAt']?.toString() ?? ''),
      paidAt: DateTime.tryParse(json['paidAt']?.toString() ?? ''),
      departedAt: DateTime.tryParse(json['departedAt']?.toString() ?? ''),
      completedAt: DateTime.tryParse(json['completedAt']?.toString() ?? ''),
      hasReview: json['hasReview'] == true,
      targetId: json['targetId']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'orderNo': orderNo,
    'departure': departure,
    'arrival': arrival,
    'status': status,
    'createdAt': createdAt?.toIso8601String(),
    'assignedAt': assignedAt?.toIso8601String(),
    'paidAt': paidAt?.toIso8601String(),
    'departedAt': departedAt?.toIso8601String(),
    'completedAt': completedAt?.toIso8601String(),
    'hasReview': hasReview,
    'targetId': targetId,
  };

  /// 일부만 수정된 새 객체 반환
  Order copyWith({
    String? id,
    String? orderNo,
    String? departure,
    String? arrival,
    String? status,
    DateTime? createdAt,
    DateTime? assignedAt,
    DateTime? paidAt,
    DateTime? departedAt,
    DateTime? completedAt,
    bool? hasReview,
    String? targetId,
  }) {
    return Order(
      id: id ?? this.id,
      orderNo: orderNo ?? this.orderNo,
      departure: departure ?? this.departure,
      arrival: arrival ?? this.arrival,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      assignedAt: assignedAt ?? this.assignedAt,
      paidAt: paidAt ?? this.paidAt,
      departedAt: departedAt ?? this.departedAt,
      completedAt: completedAt ?? this.completedAt,
      hasReview: hasReview ?? this.hasReview,
      targetId: targetId ?? this.targetId,
    );
  }
}
