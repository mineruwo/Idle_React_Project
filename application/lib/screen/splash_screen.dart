import 'dart:async';
import 'dart:ui';
import 'package:application/const/colors.dart';
import 'package:application/screen/main_screen.dart';
import 'package:flutter/material.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late final AnimationController _slideInController;
  late final Animation<Offset> _slideInAnimation;
  late final AnimationController _slideOutController;
  late final Animation<Offset> _slideOutAnimation;

  @override
  void initState() {
    super.initState();

    // Animation for sliding IN
    _slideInController = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    )..forward();
    _slideInAnimation = Tween<Offset>(
      begin: const Offset(-1.0, 0.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideInController, curve: Curves.linear));

    // Animation for sliding OUT
    _slideOutController = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    );
    _slideOutAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: const Offset(1.0, 0.0),
    ).animate(CurvedAnimation(parent: _slideOutController, curve: Curves.linear));

    // Navigate after slide out is complete
    _slideOutController.addStatusListener((status) {
      if (status == AnimationStatus.completed && mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const MainScreen()),
        );
      }
    });

    // Timer to start the slide OUT animation after a delay
    Timer(const Duration(seconds: 2), () { // 1s slide in + 1s delay
      if (mounted) {
        _slideOutController.forward();
      }
    });
  }

  @override
  void dispose() {
    _slideInController.dispose();
    _slideOutController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final iconSize = screenWidth * 0.3;

    // --- Responsive Sizing ---
    const double baseHeight = 1600;
    final double scale = screenHeight / baseHeight;
    final double fontSize1 = 38 * scale;
    final double spacing1 = 25 * scale;
    final double fontSize2 = 78 * scale;
    final double spacing2 = 310 * scale;
    final double fontSize3 = 38 * scale;
    final double iconSpacing = 50 * scale;

    // --- Text Styles ---
    const List<Shadow> textShadows = [
      Shadow(
        offset: Offset(2.0, 2.0),
        blurRadius: 3.0,
        color: Color.fromARGB(128, 0, 0, 0),
      ),
    ];
    final textStyle1 = TextStyle(fontSize: fontSize1, fontWeight: FontWeight.bold, color: THIRD_COLOR, shadows: textShadows);
    final textStyle2 = TextStyle(fontSize: fontSize2, color: THIRD_COLOR, shadows: textShadows);
    final textStyle3 = TextStyle(fontSize: fontSize3, fontWeight: FontWeight.bold, color: THIRD_COLOR, decoration: TextDecoration.underline, shadows: textShadows);

    return Scaffold(
      backgroundColor: SECOND_COLOR,
      body: Stack(
        children: [
          // Layer 1: Static Text
          Align(
            alignment: Alignment.topCenter,
            child: Padding(
              padding: EdgeInsets.only(top: (screenHeight / 2) + (iconSize / 2)),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(height: iconSpacing),
                  Text("배송을 한번에!", style: textStyle1),
                  SizedBox(height: spacing1),
                  Text("Navi Logistics", style: textStyle2),
                  SizedBox(height: spacing2),
                  Text("Team_Idle", style: textStyle3),
                ],
              ),
            ),
          ),

          // Layer 2: Animating Logo
          SlideTransition(
            position: _slideOutAnimation,
            child: SlideTransition(
              position: _slideInAnimation,
              child: Center(
                child: SizedBox(
                  width: iconSize,
                  height: iconSize,
                  child: Stack(
                    alignment: Alignment.center,
                    children: <Widget>[
                      Transform.translate(
                        offset: const Offset(5, 5),
                        child: ImageFiltered(
                          imageFilter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                          child: Image.asset('assets/logo.png', color: Colors.black.withOpacity(0.5)),
                        ),
                      ),
                      Image.asset('assets/logo.png'),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
