class PaymentData {
  final String pg; // PG사
  final String payMethod; // 결제수단
  final String name; // 주문명
  final String merchantUid; // 주문번호
  final int amount; // 결제금액
  final String buyerName; // 구매자 이름
  final String buyerTel; // 구매자 연락처
  final String buyerEmail; // 구매자 이메일
  final String appScheme; // 앱으로 돌아오기 위한 앱 스킴

  PaymentData({
    required this.pg,
    this.payMethod = 'card', // 웹 코드에서 'card'로 고정되어 있었음
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
        'pay_method': payMethod,
        'name': name,
        'merchant_uid': merchantUid,
        'amount': amount,
        'buyer_name': buyerName,
        'buyer_tel': buyerTel,
        'buyer_email': buyerEmail,
        'app_scheme': appScheme,
        // 웹 코드에 있던 하드코딩된 값들 추가
        'buyer_addr': '서울특별시 강남구 삼성동',
        'buyer_postcode': '123-456',
      };
}
