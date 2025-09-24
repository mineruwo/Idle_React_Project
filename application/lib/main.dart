import 'package:application/provider/user_provider.dart';
import 'package:application/router/router.dart';
import 'package:application/screen/main_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';


void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => UserProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      // 앱 시작 시 MainScreen을 기본 화면으로 띄움
      home: const MainScreen(),
      // 라우트 등록 
      routes: AppRouter.routes,
    );
  }
}