class PaymentData {
  // ✨✨ V2 필수 추가 필드 ✨✨
  final String storeId; // [V2 필수] 포트원 상점 ID (관리자 콘솔에서 확인)

  final String pg; // PG사
  final String?
  payMethod; // 결제수단 (V2에서는 PaymentPayMethod Enum을 사용하므로, 이 필드는 옵션화하거나 제거 가능)
  final String name; // 주문명 (V2의 orderName)
  final String merchantUid; // 주문번호 (V2의 paymentId)
  final int amount; // 결제금액 (V2의 totalAmount, int 타입)

  // 구매자 정보 (V2의 Customer 객체로 묶일 정보)
  final String buyerName; // 구매자 이름
  final String buyerTel; // 구매자 연락처
  final String buyerEmail; // 구매자 이메일

  // V1/V2에서 이름이 바뀌거나 필수인 필드
  final String mRedirectUrl; // V2의 redirectUrl
  final String appScheme; // 앱으로 돌아오기 위한 앱 스킴

  PaymentData({
    // ✨ storeId를 필수 매개변수로 추가
    required this.storeId,

    required this.pg,
    this.payMethod,
    required this.name,
    required this.merchantUid,
    required this.amount,
    required this.buyerName,
    required this.buyerTel,
    required this.buyerEmail,
    required this.mRedirectUrl,
    required this.appScheme,
  });

  // toJson 메서드는 V2 SDK에서 사용하지 않으므로 변경 불필요
  Map<String, dynamic> toJson() => {
    'pg': pg,
    if (payMethod != null) 'pay_method': payMethod!,
    'name': name,
    'merchant_uid': merchantUid,
    'amount': amount,
    'buyer_name': buyerName,
    'buyer_tel': buyerTel,
    'buyer_email': buyerEmail,
    'mRedirectUrl': mRedirectUrl,
    'app_scheme': appScheme,
  };
}
