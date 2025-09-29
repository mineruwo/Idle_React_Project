import 'dart:convert';

import 'package:application/model/payment_data.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PaymentScreen extends StatefulWidget {
  final PaymentData paymentData;

  const PaymentScreen({super.key, required this.paymentData});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (NavigationRequest request) {
            // 결제 완료/실패/취소 후 콜백 URL 감지
            if (request.url.startsWith(widget.paymentData.appScheme)) {
              final uri = Uri.parse(request.url);
              // 포트원이 전달하는 결과 파라미터 파싱
              final result = {
                'imp_uid': uri.queryParameters['imp_uid'],
                'merchant_uid': uri.queryParameters['merchant_uid'],
                'success': uri.queryParameters['imp_success'] == 'true',
                'error_msg': uri.queryParameters['error_msg'],
              };
              // 이전 화면으로 결과 전달
              Navigator.of(context).pop(result);
              return NavigationDecision.prevent; // 웹뷰 내에서 리디렉션 방지
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadHtmlString(_getPaymentHtml(context));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('결제 진행')),
      body: WebViewWidget(controller: _controller),
    );
  }

  String _getPaymentHtml(BuildContext context) {
    // 웹 컴포넌트에서 확인한 실제 가맹점 식별코드
    const String iamportCode = 'imp16058080';

    // PaymentData 객체를 JSON 문자열로 변환
    final String paymentDataJson = jsonEncode(widget.paymentData.toJson());

    return '''
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      <title>Idle Payment</title>
      <script type="text/javascript" src="https://cdn.iamport.kr/js/iamport.payment-1.2.0.js"></script>
    </head>
    <body>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const iamport = window.IMP;
          iamport.init('$iamportCode');

          const data = $paymentDataJson;

          iamport.request_pay(data, function(rsp) {
            // 결과 데이터를 앱의 스킴으로 리디렉션
            const scheme = '${widget.paymentData.appScheme}';
            // 웹뷰 환경에서 window.location.href 대신, Flutter의 NavigationDelegate를 통해 결과를 전달합니다.
            // 이 JS 코드는 Flutter의 NavigationDelegate가 감지할 URL로 페이지를 이동시키는 역할을 합니다.
            const query = Object.keys(rsp).map(key => key + '=' + encodeURIComponent(rsp[key])).join('&');
            window.location.href = scheme + '/?' + query;
          });
        });
      </script>
    </body>
    </html>
    ''';
  }
}



/*
PaymentScreen은 결제창을 띄우고 결과를 받아오는 역할만 
  합니다. 따라서 이 화면을 부르기 전에, 사용자가 결제 정보를       
  확인하고 결제 수단을 선택하는 화면이 필요합니다. (예: 
  CheckoutScreen)

  그 화면에서 아래와 같은 순서로 PaymentScreen을 호출하게 
  됩니다.


  `dart
  // 예시: CheckoutScreen 위젯 내부의 한 함수

  // 1. 사용자가 결제 수단 선택, 포인트 사용 등을 결정합니다.      

  // 2. 백엔드 API를 호출하여 결제를 준비하고, 고유한 
  주문번호(merchantUid)를 받습니다.
  // const merchantUid = await yourApi.preparePayment(...);        

  // 3. 전달할 결제 데이터를 만듭니다. (웹 코드 기반)
  final paymentData = PaymentData(
    pg: 'kakaopay', // 사용자가 선택한 값 (kakaopay, tosspay       
  등)
    name: '화물 운송 서비스',
    amount: 5000, // 포인트 등을 제외한 최종 결제 금액
    merchantUid: 'mid_123456789', // 백엔드에서 받은 고유 
  주문번호
    buyerName: '홍길동', // 실제 구매자 이름
    buyerTel: '010-1234-5678', // 실제 구매자 연락처
    buyerEmail: 'test@example.com', // 실제 구매자 이메일
    appScheme: 'idlemobile', // 앱으로 돌아오기 위한 고유 
  스킴
  );

  // 4. PaymentScreen으로 이동하고, 결제 결과를 기다립니다.        
  final result = await Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => PaymentScreen(paymentData: 
  paymentData),
    ),
  );

  // 5. 결제 결과 처리
  if (result != null && result['success'] == true) {
    // !!! 가장 중요한 단계 !!!
    // 백엔드에 result['imp_uid']와 result['merchant_uid']를       
  보내서
    // 결제가 위변조되지 않았는지 서버에서 직접 최종 검증해야      
   합니다.
    // bool isVerified = await 
  yourApi.verifyPayment(result['imp_uid']);

    // 서버 검증까지 성공하면, 결제 성공 화면으로 이동합니다.      
    print('결제 성공 및 서버 검증 완료!');
    // Navigator.push(context, ...PaymentSuccessScreen...);        

  } else {
    // 결제 실패 또는 취소 처리
    print('결제 실패: ${result?['error_msg']}');
  }
  `



  필수 추가 설정:

  코드에 사용된 appScheme: 'idlemobile'이 실제로 동작하려면, 
  Android와 iOS 네이티브 설정을 각각 한 번씩 해줘야 합니다.  
  이 설정을 해야만 외부 결제 앱에서 우리 앱으로 다시 돌아올  
  수 있습니다.
*/