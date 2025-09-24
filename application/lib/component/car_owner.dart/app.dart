import 'package:flutter/material.dart';
import 'theme.dart';
import 'root.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '차주 마이페이지 데모',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      home: const Root(),
    );
  }
}
