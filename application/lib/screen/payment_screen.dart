import 'package:flutter/material.dart';
import 'package:portone_flutter/iamport_payment.dart'; // Correct import
import 'package:portone_flutter/model/payment_data.dart'; // This model is from portone_flutter, not application/model
import 'package:application/model/payment_data.dart'
    as app_payment_data; // Alias for our app's PaymentData

class PaymentScreen extends StatefulWidget {
  final app_payment_data.PaymentData paymentData;

  const PaymentScreen({super.key, required this.paymentData});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  @override
  Widget build(BuildContext context) {
    // Convert our app's PaymentData to portone_flutter's PaymentData
    final portonePaymentData = PaymentData(
      pg: widget.paymentData.pg,
      payMethod: 'card', // Assuming 'card' as default, as before
      name: widget.paymentData.name,
      merchantUid: widget.paymentData.merchantUid,
      amount: widget.paymentData.amount.toDouble(),
      buyerName: widget.paymentData.buyerName,
      buyerEmail: widget.paymentData.buyerEmail,
      buyerTel: widget.paymentData.buyerTel,
      appScheme: widget.paymentData.appScheme,
    );

    return IamportPayment(
      appBar: AppBar(
        title: const Text('결제 진행중'),
        automaticallyImplyLeading: false, // 뒤로가기 버튼 숨김
      ),
      initialChild: const SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 20),
              Text('결제를 진행 중입니다...'),
            ],
          ),
        ),
      ),
      userCode: 'imp16058080', // Your PortOne user code
      data: portonePaymentData,
      callback: (Map result) {
        // Handle the payment result
        bool success = result['success'] ?? false;
        String? impUid = result['imp_uid'];
        String? merchantUid = result['merchant_uid'];
        String? errorMessage = result['error_msg'];

        Navigator.of(context).pop({
          'success': success,
          'imp_uid': impUid,
          'merchant_uid': merchantUid,
          'error_msg': errorMessage,
        });
      },
    );
  }
}
