class Order {
  final String id;                // 주문 ID
  final String orderNo;           // 주문 번호
  final String departure;         // 출발지
  final String arrival;           // 도착지
  final String status;            // 상태 (OPEN, ASSIGNED, COMPLETED 등)
  final DateTime? createdAt;      // 생성일시
  final DateTime? assignedAt;     // 배정일시
  final DateTime? paidAt;         // 결제 완료일시
  final DateTime? departedAt;     // 출발일시
  final DateTime? completedAt;    // 완료일시
  final bool hasReview;           // 리뷰 여부
  final int? targetId;            // 배정된 기사 ID

  // 🔽 추가된 화물 상세 필드들
  final double? distance;         // 거리 (km)
  final String? cargoType;        // 화물 종류 (박스, 팔레트 등)
  final String? cargoSize;        // 화물 크기 (소형, 중형, 대형 등)
  final String? weight;           // 무게 (문자열 저장: kg, ton 등)
  final String? vehicle;          // 차량 종류 (1톤, 5톤, 트럭 등)
  final String? packingOption;    // 포장 방식 (일반, 특수, 고가, 파손위험 등)
  final bool? isImmediate;        // 즉시배송 여부 (true=즉시, false=예약)
  final String? reservedDate;     // 예약일 (문자열 또는 DateTime 변환 필요)

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
    this.targetId,
    this.distance,
    this.cargoType,
    this.cargoSize,
    this.weight,
    this.vehicle,
    this.packingOption,
    this.isImmediate,
    this.reservedDate,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    print(json);
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
      targetId: (json['assignedDriverId'] ?? json['targetId']) as int?,
      distance: (json['distance'] is num)
          ? (json['distance'] as num).toDouble()
          : double.tryParse(json['distance']?.toString() ?? ''),
      cargoType: json['cargoType'] ?? json['cargo_type'],
      cargoSize: json['cargoSize'] ?? json['cargo_size'],
      weight: json['weight']?.toString(),
      vehicle: json['vehicle']?.toString(),
      packingOption: json['packingOption'] ?? json['packing_option'],
      isImmediate: json['isImmediate'] ?? json['is_immediate'],
      reservedDate: json['reservedDate'] ?? json['reserved_date'],
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
        'distance': distance,
        'cargoType': cargoType,
        'cargoSize': cargoSize,
        'weight': weight,
        'vehicle': vehicle,
        'packingOption': packingOption,
        'isImmediate': isImmediate,
        'reservedDate': reservedDate,
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
    int? targetId,
    double? distance,
    String? cargoType,
    String? cargoSize,
    String? weight,
    String? vehicle,
    String? packingOption,
    bool? isImmediate,
    String? reservedDate,
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
      distance: distance ?? this.distance,
      cargoType: cargoType ?? this.cargoType,
      cargoSize: cargoSize ?? this.cargoSize,
      weight: weight ?? this.weight,
      vehicle: vehicle ?? this.vehicle,
      packingOption: packingOption ?? this.packingOption,
      isImmediate: isImmediate ?? this.isImmediate,
      reservedDate: reservedDate ?? this.reservedDate,
    );
  }
}
