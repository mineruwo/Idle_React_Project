import 'package:application/model/payment_data.dart';
import 'package:flutter/material.dart';
import 'package:portone_flutter_v2/portone_flutter_v2.dart';
import 'package:portone_flutter_v2/src/enums/enums.dart';

class PaymentScreen extends StatefulWidget {
  final PaymentData paymentData;
  const PaymentScreen({super.key, required this.paymentData});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  static const String portoneV2ChannelKey =
      'channel-key-53b9c7d4-1091-4964-957d-4f3b1ded419c';

  @override
  Widget build(BuildContext context) {
    final PGCompany pgCompany = _getPgCompany(widget.paymentData.pg);

    final PaymentPayMethod payMethod =
        widget.paymentData.pg.toLowerCase() == 'kakaopay'
        ? PaymentPayMethod.easyPay
        : _getPaymentPayMethod(widget.paymentData.payMethod);

    final portoneRequest = PaymentRequest(
      storeId: widget.paymentData.storeId,
      channelKey: portoneV2ChannelKey,
      pg: pgCompany,
      payMethod: payMethod,
      totalAmount: widget.paymentData.amount,
      orderName: widget.paymentData.name,
      paymentId: widget.paymentData.merchantUid,
      redirectUrl: widget.paymentData.mRedirectUrl,
      appScheme: widget.paymentData.appScheme ?? '',
      currency: PaymentCurrency.KRW,
      customer: Customer(
        fullName: widget.paymentData.buyerName,
        phoneNumber: widget.paymentData.buyerTel,
        email: widget.paymentData.buyerEmail,
      ),
      bypass: PaymentBypass(kakaopay: KakaopayPaymentBypass()),
    );

    return Scaffold(
      appBar: AppBar(title: const Text('PortOne V2 결제')),
      body: Center(
        child: Builder(
          builder: (BuildContext innerContext) {
            return ElevatedButton(
              onPressed: () {
                print('✅ 결제 버튼 클릭됨!');
                _startPayment(innerContext, portoneRequest);
              },
              child: const Text('결제 진행'),
            );
          },
        ),
      ),
    );
  }

  // PortonePayment 위젯을 띄우고 결제를 시작하는 함수
  void _startPayment(
    BuildContext context,
    PaymentRequest portoneRequest,
  ) async {
    print('✅ _startPayment 함수 시작, Navigator.push 호출 시도!');

    try {
      final result = await Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) {
            print('✅ PortonePayment 위젯 빌드 시작!');
            return PortonePayment(
              data: portoneRequest,
              callback: (PaymentResponse? response) {
                bool success = response?.code == null;

                Navigator.of(context).pop({
                  'success': success,
                  'imp_uid': response?.transactionId,
                  'error_msg': response?.message,
                });
              },

              // callback: (PaymentResponse? response) {
              //   // 오류 코드가 null이면 성공
              //   bool success = response?.code == null;

              //   // V1 형식에 맞춘 결과 맵 생성 및 반환
              //   Navigator.of(context).pop({
              //     'success': success,
              //     // V1 'imp_uid'는 V2 'transactionId'로 매핑
              //     'imp_uid': response?.transactionId,
              //     // V1 'merchant_uid'는 V2 'paymentId'로 매핑
              //     'merchant_uid': response?.paymentId,
              //     // V1 'error_msg'는 V2 'message'로 매핑
              //     'error_msg': response?.message,
              //   });
              // },
              onError: (Object? error) {
                final String errorMessage = error?.toString() ?? '알 수 없는 오류 발생';

                Navigator.of(context).pop({
                  'success': false,
                  'imp_uid': null,
                  'merchant_uid': portoneRequest.paymentId,
                  'error_msg': errorMessage,
                });
              },
            );
          },
        ),
      );

      print('✅ PortonePayment 화면에서 복귀됨. 결과: $result');
    } catch (e, stacktrace) {
      print('❌ 심각한 오류 발생! 웹뷰 화면 이동 실패: $e');
      print('❌ 스택 트레이스: $stacktrace');

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('결제 화면을 띄울 수 없습니다: $e')));
    }
  }

  // **********************************************
  // * V2 ENUM 헬퍼 함수
  // **********************************************

  // 문자열 PG 코드를 PGCompany Enum으로 변환
  PGCompany _getPgCompany(String pgString) {
    switch (pgString.toLowerCase()) {
      case 'kakaopay':
        return PGCompany.kakaopay;
      case 'html5_inicis':
        return PGCompany.inicisV2;
      default:
        return PGCompany.kakaopay;
    }
  }

  // 문자열 PayMethod를 PaymentPayMethod Enum으로 변환
  PaymentPayMethod _getPaymentPayMethod(String? payMethodString) {
    switch (payMethodString?.toLowerCase()) {
      case 'card':
        return PaymentPayMethod.card;
      case 'trans':
        return PaymentPayMethod.transfer;
      case 'vbank':
        return PaymentPayMethod.virtualAccount;
      case 'phone':
        return PaymentPayMethod.mobile;
      case 'easy_pay':
        return PaymentPayMethod.easyPay;
      default:
        return PaymentPayMethod.card;
    }
  }
}
