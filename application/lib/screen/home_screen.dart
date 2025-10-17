import 'package:application/const/colors.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:application/component/mainpage/notice_component.dart';

// 각 캐러셀 슬라이드의 데이터를 관리하기 위한 클래스
class _CarouselItem {
  final String imagePath;
  final String text;
  final Color textColor;

  _CarouselItem({
    required this.imagePath,
    required this.text,
    required this.textColor,
  });
}

// 각 회사 소개 아이템의 데이터를 관리하기 위한 클래스
class _CompanyIntroItem {
  final IconData icon;
  final String boldText;
  final String regularText;
  final Color backgroundColor;
  final Color textColor;

  _CompanyIntroItem({
    required this.icon,
    required this.boldText,
    required this.regularText,
    required this.backgroundColor,
    required this.textColor,
  });
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // 캐러셀 데이터
  final List<_CarouselItem> carouselData = [
    _CarouselItem(
      imagePath: 'assets/banner/banner1.jpg',
      text: '가장 빠르고 안전한 화물 운송,\nNaviLogistics에서 시작하세요.',
      textColor: Colors.white,
    ),
    _CarouselItem(
      imagePath: 'assets/banner/banner2.jpg',
      text: '터치 몇 번으로 끝내는\n가장 간편한 운송 예약',
      textColor: Colors.white,
    ),
    _CarouselItem(
      imagePath: 'assets/banner/banner3.png',
      text: '내 손안에서 실시간 화물 추적',
      textColor: Colors.black,
    ),
  ];

  // 회사 소개 섹션 데이터
  final List<_CompanyIntroItem> companyIntroData = [
    _CompanyIntroItem(
      icon: Icons.handshake,
      boldText: '화주 차주 매칭',
      regularText: '화주·차주 연결',
      backgroundColor: PRIMARY_COLOR,
      textColor: Colors.white,
    ),
    _CompanyIntroItem(
      icon: Icons.gavel,
      boldText: '입찰 서비스',
      regularText: '다중 견적 경쟁',
      backgroundColor: SECOND_COLOR,
      textColor: Colors.black,
    ),
    _CompanyIntroItem(
      icon: Icons.tune,
      boldText: '고객 맞춤 신청',
      regularText: '차종·시간 커스터마이즈',
      backgroundColor: THIRD_COLOR,
      textColor: Colors.black,
    ),
    _CompanyIntroItem(
      icon: Icons.reviews,
      boldText: '따땃함 시스템',
      regularText: '차주 운송 피드백',
      backgroundColor: FOURTH_COLOR,
      textColor: Colors.black,
    ),
    _CompanyIntroItem(
      icon: Icons.local_shipping,
      boldText: '운송 현황',
      regularText: '실시간 진행 상황',
      backgroundColor: FIFTH_COLOR,
      textColor: Colors.white,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    // 데이터 목록을 위젯 목록으로 변환
    final List<Widget> imageSliders = carouselData.map((item) {
      return Builder(
        builder: (BuildContext context) {
          return Stack(
            fit: StackFit.expand, // Stack의 자식이 전체를 채우도록 함
            children: <Widget>[
              // 배경 이미지
              Image.asset(
                item.imagePath,
                fit: BoxFit.cover,
                alignment: Alignment.bottomCenter,
              ),
              // 하단 텍스트
              Positioned(
                bottom: 16.0,
                left: 16.0,
                right: 16.0,
                child: Text(
                  item.text,
                  style: TextStyle(
                    color: item.textColor,
                    fontSize: 16.0,
                    fontWeight: FontWeight.bold,
                    // 텍스트 가독성을 위한 그림자
                    shadows: <Shadow>[
                      Shadow(
                        offset: const Offset(1.0, 1.0),
                        blurRadius: 3.0,
                        color: item.textColor == Colors.white
                            ? Colors.black.withOpacity(0.7)
                            : Colors.white.withOpacity(0.7),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      );
    }).toList();

    // Fixed notification area
    final Widget notificationArea = Container(
      height:
          kToolbarHeight +
          34.0, // Combined height for status bar and notification
      padding: const EdgeInsets.only(
        top: kToolbarHeight,
        left: 16.0,
        right: 16.0,
      ), // Padding for status bar
      color: Colors.white, // Add a background color to the fixed area
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end, // 우측 정렬
        children: [
          InkWell(
            onTap: () {
              print('알람 아이콘 클릭됨!');
            },
            child: const Icon(Icons.notifications_none, size: 30.0), // 벨 아이콘
          ),
        ],
      ),
    );

    return Scaffold(
      body: Stack(
        children: [
          // Scrollable content
          Padding(
            padding: EdgeInsets.only(
              top: kToolbarHeight + 34.0 + 16.0,
            ), // Space for fixed notification area + SizedBox
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                    ), // 좌우 여백
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: THIRD_COLOR, width: 3.0),
                        borderRadius: BorderRadius.circular(30.0),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(30.0),
                        child: AspectRatio(
                          aspectRatio: 2 / 1, // 2:1 비율 고정
                          child: CarouselSlider(
                            items: imageSliders,
                            options: CarouselOptions(
                              height:
                                  double.infinity, // 부모(AspectRatio)의 높이를 꽉 채움
                              autoPlay: true,
                              autoPlayInterval: const Duration(seconds: 3),
                              viewportFraction: 1.0,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 30.0), // 캐러셀과 회사 소개 섹션 사이 여백
                  // 회사 소개 섹션
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                    ), // 회사 소개 섹션 좌우 패딩
                    child: SizedBox(
                      height: 470.0, // 5개 박스 겹침을 고려한 Stack의 총 높이
                      child: Stack(
                        children: companyIntroData
                            .asMap()
                            .entries
                            .map((entry) {
                              int index = entry.key;
                              _CompanyIntroItem item = entry.value;
                              return Positioned(
                                top: index * 80.0, // 각 박스의 상단 위치 (겹침 효과)
                                left: index % 2 == 0
                                    ? 0.0
                                    : null, // 짝수 인덱스는 좌측 정렬 (Stack의 패딩 안에서)
                                right: index % 2 != 0
                                    ? 0.0
                                    : null, // 홀수 인덱스는 우측 정렬 (Stack의 패딩 안에서)
                                child: Container(
                                  width:
                                      MediaQuery.of(context).size.width *
                                      0.6, // 화면 너비의 60%
                                  padding: const EdgeInsets.all(16.0),
                                  decoration: BoxDecoration(
                                    color: item.backgroundColor,
                                    borderRadius: BorderRadius.circular(15.0),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.grey.withOpacity(0.3),
                                        spreadRadius: 2,
                                        blurRadius: 5,
                                        offset: const Offset(0, 3),
                                      ),
                                    ],
                                  ),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment: index % 2 == 0
                                        ? CrossAxisAlignment.start
                                        : CrossAxisAlignment.end, // 텍스트 정렬
                                    children: [
                                      Icon(
                                        item.icon,
                                        size: 30.0,
                                        color: item.textColor,
                                      ),
                                      const SizedBox(height: 8.0),
                                      Text(
                                        item.boldText,
                                        style: TextStyle(
                                          fontSize: 16.0,
                                          fontWeight: FontWeight.bold,
                                          color: item.textColor,
                                        ),
                                      ),
                                      const SizedBox(height: 4.0),
                                      Text(
                                        item.regularText,
                                        style: TextStyle(
                                          fontSize: 14.0,
                                          color: item.textColor,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            })
                            .toList()
                            .reversed
                            .toList(), // 리스트를 역순으로 정렬하여 첫 번째 박스가 가장 위에 오도록 함
                      ),
                    ),
                  ),
                  const SizedBox(height: 16.0),
                  const NoticeComponent(),
                  const SizedBox(height: 16.0),
                  // Footer
                  Container(
                    width: double.infinity,
                    color: Colors.grey[200],
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '(주)Idle',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16.0,
                          ),
                        ),
                        const SizedBox(height: 8.0),
                        Text(
                          '대표: 홍길동 | 사업자등록번호: 123-45-67890',
                          style: TextStyle(
                            fontSize: 12.0,
                            color: Colors.grey[700],
                          ),
                        ),
                        Text(
                          '주소: 서울특별시 강남구 테헤란로 123',
                          style: TextStyle(
                            fontSize: 12.0,
                            color: Colors.grey[700],
                          ),
                        ),
                        Text(
                          '고객센터: 1588-0000',
                          style: TextStyle(
                            fontSize: 12.0,
                            color: Colors.grey[700],
                          ),
                        ),
                        const SizedBox(height: 16.0),
                        const Center(
                          child: Text(
                            '© 2025 Idle Corp. All rights reserved.',
                            style: TextStyle(
                              fontSize: 10.0,
                              color: Colors.grey,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Fixed notification area
          Positioned(top: 0, left: 0, right: 0, child: notificationArea),
        ],
      ),
    );
  }
}
