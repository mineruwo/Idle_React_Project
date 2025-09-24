import 'package:flutter/material.dart';

ThemeData buildAppTheme() {
  const seed = Color(0xFFAED3CE);

  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: seed),
    scaffoldBackgroundColor: const Color(0xFFF5F7F8),

    // ★ 여기!
    cardTheme: const CardThemeData(
      color: Colors.white,
      elevation: 0,
      margin: EdgeInsets.symmetric(vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(14)),
        side: BorderSide(color: Color(0x14000000)), // 약 8% 불투명 라인
      ),
    ),

    chipTheme: ChipThemeData(
      backgroundColor: Colors.black.withOpacity(0.06),
      labelStyle: const TextStyle(fontWeight: FontWeight.w600),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    ),
  );
}
