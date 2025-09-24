import 'package:application/provider/user_provider.dart';
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

// 재부팅 로그인 복구 버전 (로그아웃 버튼 생기면 적용 ㄱㄱ)
/*
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  final userProvider = UserProvider();
  await userProvider.restoreUser();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => userProvider),
      ],
      child: const MyApp(),
    ),
  );
}
*/

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      // 앱 시작 시 MainScreen을 기본 화면으로 띄움
      home: const MainScreen()
    );
  }
}