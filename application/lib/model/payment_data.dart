class PaymentData {
  final String pg; // PG사
  final String? payMethod; // 결제수단
  final String name; // 주문명
  final String merchantUid; // 주문번호
  final int amount; // 결제금액
  final String buyerName; // 구매자 이름
  final String buyerTel; // 구매자 연락처
  final String buyerEmail; // 구매자 이메일
  final String appScheme; // 앱으로 돌아오기 위한 앱 스킴

  PaymentData({
    required this.pg,
    this.payMethod,
    required this.name,
    required this.merchantUid,
    required this.amount,
    required this.buyerName,
    required this.buyerTel,
    required this.buyerEmail,
    required this.appScheme,
  });

  // PortOne JS 라이브러리에 맞게 Map으로 변환
  Map<String, dynamic> toJson() => {
    'pg': pg,
    if (payMethod != null) 'pay_method': payMethod!,
    'name': name,
    'merchant_uid': merchantUid,
    'amount': amount,
    'buyer_name': buyerName,
    'buyer_tel': buyerTel,
    'buyer_email': buyerEmail,
    'app_scheme': appScheme,
  };
}
