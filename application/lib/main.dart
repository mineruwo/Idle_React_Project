import 'package:application/const/colors.dart';
import 'package:application/provider/user_provider.dart';
import 'package:application/screen/splash_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

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

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: PRIMARY_COLOR,
        scaffoldBackgroundColor: Colors.white, // Using white for main background for readability
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          selectedItemColor: PRIMARY_COLOR,
          unselectedItemColor: FIFTH_COLOR,
          type: BottomNavigationBarType.fixed,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: PRIMARY_COLOR,
            foregroundColor: Colors.white,
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: PRIMARY_COLOR,
          ),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
        ),
        // Define color scheme for other widgets
        colorScheme: ColorScheme.fromSeed(
          seedColor: PRIMARY_COLOR,
          primary: PRIMARY_COLOR,
          secondary: SECOND_COLOR,
          tertiary: THIRD_COLOR,
        ),
        useMaterial3: true,
      ),
      home: const SplashScreen(),
    );
  }
}