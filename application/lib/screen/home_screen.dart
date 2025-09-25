import 'package:application/const/colors.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';

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

// 각 공지사항 아이템의 데이터를 관리하기 위한 클래스
class _NoticeItem {
  final String id; // React 컴포넌트의 expandedNoticeId를 위해 id 추가
  final String title;
  final String date;
  final String content; // 공지사항 내용 추가

  _NoticeItem({
    required this.id,
    required this.title,
    required this.date,
    required this.content,
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
      text: '첫 번째 배너',
      textColor: Colors.white,
    ),
    _CarouselItem(
      imagePath: 'assets/banner/banner2.jpg',
      text: '두 번째 배너',
      textColor: Colors.white,
    ),
    _CarouselItem(
      imagePath: 'assets/banner/banner3.png',
      text: '세 번째 배너(검은 글씨)',
      textColor: Colors.black,
    ),
  ];

  // 회사 소개 섹션 데이터
  final List<_CompanyIntroItem> companyIntroData = [
    _CompanyIntroItem(
      icon: Icons.lightbulb_outline,
      boldText: '혁신적인 아이디어',
      regularText: '새로운 가치를 창출합니다.',
      backgroundColor: PRIMARY_COLOR,
      textColor: Colors.white,
    ),
    _CompanyIntroItem(
      icon: Icons.people_outline,
      boldText: '최고의 팀',
      regularText: '전문성과 열정으로 함께합니다.',
      backgroundColor: SECOND_COLOR,
      textColor: Colors.black,
    ),
    _CompanyIntroItem(
      icon: Icons.security,
      boldText: '안전한 서비스',
      regularText: '고객의 신뢰를 최우선으로 합니다.',
      backgroundColor: THIRD_COLOR,
      textColor: Colors.black,
    ),
    _CompanyIntroItem(
      icon: Icons.support_agent,
      boldText: '24/7 고객 지원',
      regularText: '언제든 도움을 드립니다.',
      backgroundColor: FOURTH_COLOR,
      textColor: Colors.black,
    ),
    _CompanyIntroItem(
      icon: Icons.star_outline,
      boldText: '고객 만족',
      regularText: '최고의 경험을 선사합니다.',
      backgroundColor: FIFTH_COLOR,
      textColor: Colors.white,
    ),
  ];

  // 공지사항 관련 상태 변수
  List<_NoticeItem> _notices = [];
  bool _isLoading = true;
  String? _error;
  String? _expandedNoticeId; // React 컴포넌트와 동일하게 하나의 공지사항만 확장

  @override
  void initState() {
    super.initState();
    _fetchNotices();
  }

  Future<void> _fetchNotices() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });
      // 실제 API 호출 대신 지연을 시뮬레이션
      await Future.delayed(const Duration(seconds: 1));

      // 더미 데이터 (React 컴포넌트의 is_del 필터링을 반영)
      final List<_NoticeItem> fetchedNotices = [
        _NoticeItem(
          id: '1',
          title: '새로운 서비스 출시 안내',
          date: '2023.10.26',
          content: '저희 서비스가 새롭게 출시되었습니다. 많은 이용 부탁드립니다. <b>감사합니다.</b>',
        ),
        _NoticeItem(
          id: '2',
          title: '시스템 점검 안내',
          date: '2023.10.25',
          content:
              '보다 안정적인 서비스 제공을 위해 시스템 점검이 예정되어 있습니다. <br>점검 시간: 2023.10.27 02:00 ~ 04:00',
        ),
        _NoticeItem(
          id: '3',
          title: '개인정보처리방침 변경 안내',
          date: '2023.10.24',
          content: '개인정보처리방침이 일부 변경되어 안내드립니다. 자세한 내용은 공지사항을 확인해주세요.',
        ),
        _NoticeItem(
          id: '4',
          title: '이벤트 당첨자 발표',
          date: '2023.10.23',
          content: '이벤트에 참여해주신 모든 분들께 감사드립니다. 당첨자 명단은 홈페이지에서 확인 가능합니다.',
        ),
      ];

      setState(() {
        _notices = fetchedNotices;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _handleNoticeClick(String id) {
    setState(() {
      _expandedNoticeId = _expandedNoticeId == id ? null : id;
    });
  }

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

    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: kToolbarHeight), // Spacer for status bar
            Container(
              height: 34.0, // 사용자가 변경한 높이
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end, // 우측 정렬
                children: [
                  InkWell(
                    onTap: () {
                      // TODO: 알람 아이콘 클릭 시 수행할 동작 정의
                      print('알람 아이콘 클릭됨!');
                    },
                    child: const Icon(
                      Icons.notifications_none,
                      size: 30.0,
                    ), // 벨 아이콘
                  ),
                ],
              ),
            ), // 캐러셀 상단 알림 영역
            const SizedBox(height: 16.0),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0), // 좌우 여백
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
                        height: double.infinity, // 부모(AspectRatio)의 높이를 꽉 채움
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
            const SizedBox(height: 16.0), // 회사 소개 섹션과 공지사항 섹션 사이 여백
            // 공지사항 섹션
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0), // 좌우 패딩
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '공지사항',
                    style: TextStyle(
                      fontSize: 18.0,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 10.0),
                  _isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : _error != null
                      ? Center(child: Text('오류 발생: $_error'))
                      : _notices.isEmpty
                      ? const Center(child: Text('등록된 공지사항이 없습니다.'))
                      : ListView.builder(
                          shrinkWrap: true, // Column 안에서 ListView 사용 시 필수
                          physics:
                              const NeverScrollableScrollPhysics(), // 부모 스크롤뷰에 스크롤 위임
                          itemCount: _notices.length,
                          itemBuilder: (context, index) {
                            final notice = _notices[index];
                            final isExpanded = _expandedNoticeId == notice.id;
                            return Column(
                              children: [
                                InkWell(
                                  onTap: () => _handleNoticeClick(notice.id),
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12.0,
                                    ),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            notice.title,
                                            style: const TextStyle(
                                              fontSize: 16.0,
                                              fontWeight: FontWeight.w500,
                                            ),
                                            maxLines: isExpanded
                                                ? null
                                                : 1, // 확장 시 전체, 아니면 1줄
                                            overflow: isExpanded
                                                ? TextOverflow.visible
                                                : TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const SizedBox(width: 8.0),
                                        Text(
                                          notice.date,
                                          style: const TextStyle(
                                            fontSize: 12.0,
                                            color: Colors.grey,
                                          ),
                                        ),
                                        Icon(
                                          isExpanded
                                              ? Icons.keyboard_arrow_up
                                              : Icons.keyboard_arrow_down,
                                          color: Colors.grey,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                if (isExpanded)
                                  Padding(
                                    padding: const EdgeInsets.only(
                                      left: 16.0,
                                      right: 16.0,
                                      bottom: 12.0,
                                    ),
                                    child: Html(data: notice.content),
                                  ),
                                Divider(
                                  height: 1.0,
                                  color: Colors.grey[300],
                                ), // 구분선
                              ],
                            );
                          },
                        ),
                ],
              ),
            ),
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
                    style: TextStyle(fontSize: 12.0, color: Colors.grey[700]),
                  ),
                  Text(
                    '주소: 서울특별시 강남구 테헤란로 123',
                    style: TextStyle(fontSize: 12.0, color: Colors.grey[700]),
                  ),
                  Text(
                    '고객센터: 1588-0000',
                    style: TextStyle(fontSize: 12.0, color: Colors.grey[700]),
                  ),
                  const SizedBox(height: 16.0),
                  const Center(
                    child: Text(
                      '© 2025 Idle Corp. All rights reserved.',
                      style: TextStyle(fontSize: 10.0, color: Colors.grey),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
