// lib/model/bid.dart
class Bid {
  final String id;           // offerId
  final String orderId;      // 대상 오더 id
  final int price;           // 입찰가
  final String? driverId;    // 드라이버 idNum(문자/숫자 대응)
  final String? driverNickname;
  final bool accepted;       // 수락 여부(서버 필드가 없으면 false)
  final DateTime? createdAt;

  const Bid({
    required this.id,
    required this.orderId,
    required this.price,
    this.driverId,
    this.driverNickname,
    this.accepted = false,
    this.createdAt,
  });

  factory Bid.fromJson(Map<String, dynamic> json) {
    return Bid(
      id: json['id']?.toString() ?? json['offerId']?.toString() ?? '',
      orderId: json['orderId']?.toString() ?? '',
      price: json['price'] is num
          ? (json['price'] as num).toInt()
          : int.tryParse('${json['price'] ?? ''}') ?? 0,
      driverId: json['driverId']?.toString() ?? json['driverIdNum']?.toString(),
      driverNickname: json['driverNickname']?.toString(),
      accepted: json['accepted'] == true ||
          (json['status']?.toString().toUpperCase() == 'ACCEPTED'),
      createdAt: DateTime.tryParse('${json['createdAt'] ?? ''}'),
    );
  }
}
