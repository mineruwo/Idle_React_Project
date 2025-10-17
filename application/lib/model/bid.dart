class Bid {
  final String id;
  final int price;

  final String? driverNickname;
  final int? driverIdNum;    // 본인 입찰 식별자(숫자)
  final String? driverEmail; // 대안 식별자(문자열)
  final DateTime? createdAt;

  Bid({
    required this.id,
    required this.price,
    this.driverNickname,
    this.driverIdNum,
    this.driverEmail,
    this.createdAt,
  });

  factory Bid.fromJson(Map<String, dynamic> json) {
    // 다양한 키로 오는 가격 방어
    final rawPrice =
        json['price'] ?? json['driverPrice'] ?? json['bidPrice'] ?? 0;
    final p =
        rawPrice is num ? rawPrice.toInt() : int.tryParse(rawPrice.toString()) ?? 0;

    // createdAt 파싱(문자열/epoch millis 모두 방어)
    DateTime? dt;
    final ca = json['createdAt'];
    if (ca != null) {
      if (ca is String) {
        dt = DateTime.tryParse(ca);
      } else if (ca is int) {
        dt = DateTime.fromMillisecondsSinceEpoch(ca);
      }
    }

    int? toIntOrNull(dynamic v) {
      if (v is num) return v.toInt();
      return int.tryParse(v?.toString() ?? '');
    }

    return Bid(
      id: (json['id'] ?? '').toString(),
      price: p,
      driverNickname: json['driverNickname']?.toString(),
      driverIdNum: toIntOrNull(json['driverIdNum']),
      driverEmail: json['driverEmail']?.toString(),
      createdAt: dt,
    );
  }
}
