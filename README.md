# 📖 Idle Team Project: 화물 운송 추적 및 관리 시스템

<br>

<!-- 프로젝트의 상태를 나타내는 뱃지를 추가할 수 있습니다. 예: build, coverage -->
<!-- ![Build Status](https://img.shields.io/badge/build-passing-brightgreen) -->

## 📝 프로젝트 개요

> Spring Boot와 React를 활용하여 개발된 화물 운송 추적 및 관리 시스템입니다. 사용자(화주, 차주)와 관리자 간의 효율적인 소통 및 화물 운송 과정을 투명하게 관리하는 것을 목표로 합니다.

<br>

## 👥 팀 소개

### 팀 명

-   Idle

### 팀원 구성

| 이름   | 역할                           | GitHub               |
| ------ | ------------------------------ | -------------------- |
| [이름] | Backend Developer              | [GitHub 프로필 링크] |
| [이름] | Frontend Developer             | [GitHub 프로필 링크] |
| [이름] | Frontend Developer             | [GitHub 프로필 링크] |
| [이름] | Backend Developer              | [GitHub 프로필 링크] |
| [이름] | DevOps & Infrastructure        | [GitHub 프로필 링크] |

<br>

## 🗓️ 개발 기간

-   2025.07.25 ~ 2025.08.XX (미정)

<br>

## ✨ 중점 개발 사항

> 이번 프로젝트에서 특별히 집중했던 기술적인 부분과 핵심 기능에 대해 설명합니다.

-   **실시간 화물 추적:** WebSocket을 활용하여 화물의 실시간 위치 및 상태를 추적하고 시각화합니다.
-   **관리자 대시보드:** 시스템 전반의 운영 현황(매출, 사용자 통계, 문의 내역 등)을 한눈에 파악할 수 있는 대시보드를 구현합니다.
-   **인증 및 권한 관리:** Spring Security, JWT, OAuth2를 통합하여 사용자(화주, 차주) 및 관리자별로 세분화된 접근 권한을 관리합니다.
-   **효율적인 API 연동:** Axios를 기반으로 프론트엔드와 백엔드 간의 안정적이고 효율적인 데이터 통신을 구현합니다.
-   **확장 가능한 채팅 시스템:** 1:1 실시간 채팅 기능을 통해 사용자 문의 및 상담을 지원하며, 상담 세션 관리를 용이하게 합니다.

<br>

## ⚙️ 기술 스택

> 프로젝트에 사용된 기술 스택을 각 분야별로 나누어 작성합니다.

-   **Backend:**
    -   ![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white)
    -   ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
    -   ![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=spring-security&logoColor=white)
    -   ![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=for-the-badge&logo=spring-data-jpa&logoColor=white)
    -   ![Lombok](https://img.shields.io/badge/Lombok-F00000?style=for-the-badge&logo=lombok&logoColor=white)
-   **Frontend:**
    -   ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
    -   ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
    -   ![Redux](https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white)
    -   ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
    -   ![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)
    -   ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
    -   ![Recharts](https://img.shields.io/badge/Recharts-8884d8?style=for-the-badge&logo=recharts&logoColor=white)
    -   ![React Quill](https://img.shields.io/badge/React_Quill-000000?style=for-the-badge&logo=quill&logoColor=white)
    -   ![Stomp.js](https://img.shields.io/badge/Stomp.js-000000?style=for-the-badge&logo=stomp&logoColor=white)
-   **Database:**
    -   ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
-   **DevOps & Deployment:**
    -   ![Amazon AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
    -   ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
    -   ![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

<br>

## 🚀 설치 및 실행 방법

> 프로젝트를 로컬 환경에서 실행하기 위한 방법을 단계별로 안내합니다.

1.  **Repository Clone**
    ```bash
    git clone https://github.com/mineruwo/Idle_React_Project.git
    ```
2.  **Backend Setup & Run**
    *   `backend/backend_idle` 디렉토리로 이동합니다.
    *   Gradle을 사용하여 의존성을 설치하고 프로젝트를 빌드합니다.
        ```bash
        cd backend/backend_idle
        ./gradlew build
        ```
    *   Spring Boot 애플리케이션을 실행합니다.
        ```bash
        ./gradlew bootRun
        ```
        (또는 IDE에서 실행)
3.  **Frontend Setup & Run**
    *   `frontend/frontend_idle` 디렉토리로 이동합니다.
    *   Yarn을 사용하여 의존성을 설치합니다.
        ```bash
        cd frontend/frontend_idle
        yarn install
        ```
    *   프론트엔드 개발 서버를 시작합니다.
        ```bash
        yarn start
        ```
    *   브라우저에서 `http://localhost:3000`으로 접속합니다.

<br>

## 📌 주요 기능

> 프로젝트의 핵심 기능들을 목록으로 정리하여 보여줍니다.

-   **회원 관리:**
    -   일반 사용자(화주, 차주) 및 관리자 회원가입, 로그인, 마이페이지 기능
    -   OAuth2 (Google, Kakao 등)를 통한 소셜 로그인 연동
    -   비밀번호 재설정 및 이메일 인증
-   **화물 운송 관리:**
    -   화물 오더 생성 및 상세 조회
    -   차주 입찰 및 오더 수락/거절
    -   실시간 화물 위치 추적 및 상태 업데이트
-   **게시판 기능:**
    -   공지사항(Notice) 및 자주 묻는 질문(FAQ) 생성, 조회, 수정, 삭제 (CRUD)
    -   공지사항/FAQ 활성화/비활성화 토글 기능
-   **실시간 채팅:**
    -   WebSocket을 이용한 1:1 고객 상담 채팅 기능
    -   채팅 세션 생성 및 관리
-   **관리자 대시보드:**
    -   매출 요약 및 일별 매출 데이터 시각화
    -   일별 고객 생성/삭제 통계
    -   최근 생성/삭제된 관리자 및 고객 목록 조회
    -   일별 문의 답변 통계
    -   차주 정산 배치 관리 및 상태 업데이트
-   **결제 시스템:**
    -   주문 및 서비스에 대한 결제 처리

<br>

## 📁 디렉토리 구조

> 프로젝트의 주요 디렉토리 구조를 설명하여 코드 이해를 돕습니다.

```
/
├── backend/          # Spring Boot 소스 코드
│   ├── src/
│   └── build.gradle
├── frontend/         # React 소스 코드
│   ├── public/
│   │   ├── img/      # Image 관리 폴더
│   ├── src/
│   │   ├── layouts
│   │   ├── pages
│   │   ├── router
│   │   ├── theme
│   │   ├── slices
│   │   └── store.js
│   └── package.json
├── docs/             # 프로젝트 관련 문서
└── README.md
```

<br>

## 🤝 협업 규칙

> 팀의 Git 사용 전략이나 커밋 메시지 규칙 등을 명시합니다.

### Git Flow

-   `main`: 배포 가능한 프로덕션 코드
-   `develop`: 다음 릴리즈를 위한 개발 브랜치
-   `feature/{jira_code}_{feature-name}`: 기능 개발 브랜치
-   `temp/{jira_code}`: 병합 및 테스트를 위한 임시 브랜치

### Commit Message Convention

-   `implement {feature-name} ({jira_code})`: 새로운 기능 추가
-   `bugfix {feature-name} ({jira_code})`: 버그 수정
-   `docs {feature-name} ({jira_code})`: 문서 수정
-   `refactor {feature-name} ({jira_code})`: 코드 리팩토링
-   `modify {feature-name} ({jira_code})` : 기존 기능 수정 및 로직 변경