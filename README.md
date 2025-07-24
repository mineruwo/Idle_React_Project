# 📖 [Idle Team Project]

<br>

<!-- 프로젝트의 상태를 나타내는 뱃지를 추가할 수 있습니다. 예: build, coverage -->
<!-- ![Build Status](https://img.shields.io/badge/build-passing-brightgreen) -->

## 📝 프로젝트 개요

> [Spring boot와 React를 이용한 화물 운송 추적 페이지]

<br>

## 👥 팀 소개

### 팀 명
- [Idle]

### 팀원 구성
| 이름 | 역할 | GitHub |
| --- | --- | --- |
| [이름] | [역할, 예: Backend Developer] | [GitHub 프로필 링크] |
| [이름] | [역할, 예: Frontend Developer] | [GitHub 프로필 링크] |
| [이름] | [역할, 예: Designer] | [GitHub 프로필 링크] |

<br>

## 🗓️ 개발 기간
- 2025.07.25 ~ 2025.08.XX (미정)

<br>

## ✨ 중점 개발 사항
> [이번 프로젝트에서 특별히 집중했던 기술적인 부분이나 핵심 기능에 대해 설명합니다.]
- **[핵심 기술 1]:** [설명]
- **[핵심 기술 2]:** [설명]
- **[핵심 기능 3]:** [설명]

<br>

## ⚙️ 기술 스택
> [프로젝트에 사용된 기술 스택을 각 분야별로 나누어 작성합니다.]
- **Backend:**
  - ![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white)
  - ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
- **Frontend:**
  - ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
  - ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
- **Database:**
  - ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
- **DevOps:**
  - ![Amazon AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
  - ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<br>

## 🚀 설치 및 실행 방법
> [프로젝트를 로컬 환경에서 실행하기 위한 방법을 단계별로 안내합니다.]
1. **Repository Clone**
   ```bash
   git clone [Repository URL]
   ```
2. **Dependencies Installation**
   ```bash
   # Backend (e.g., Gradle)
   ./gradlew build

   # Frontend (e.g., npm)
   cd frontend
   npm install
   ```

<br>

## 📌 주요 기능
> [프로젝트의 핵심 기능들을 목록으로 정리하여 보여줍니다.]
- **회원 관리:** 회원가입, 로그인, 마이페이지 기능
- **게시판:** CRUD 기능이 구현된 게시판
- **실시간 채팅:** WebSocket을 이용한 1:1 채팅 기능

<br>

## 📁 디렉토리 구조
> [프로젝트의 주요 디렉토리 구조를 설명하여 코드 이해를 돕습니다.]
```
/
├── backend/          # Spring Boot 소스 코드
│   ├── src/
│   └── build.gradle
├── frontend/         # React 소스 코드
│   ├── src/
│   └── package.json
├── docs/             # 프로젝트 관련 문서
└── README.md
```

<br>

## 🤝 협업 규칙 
> [팀의 Git 사용 전략이나 커밋 메시지 규칙 등을 명시합니다.]
### Git Flow
- `main`: 배포 가능한 프로덕션 코드
- `develop`: 다음 릴리즈를 위한 개발 브랜치
- `feature/{jira_code}_{feature-name}`: 기능 개발 브랜치
- `temp/{jira_code}`: 병합 및 테스트를 위한 임시 브랜치

### Commit Message Convention
- `implement {feature-name} ({jira_code})`: 새로운 기능 추가
- `bugfix {feature-name} ({jira_code})`: 버그 수정
- `docs {feature-name} ({jira_code})`: 문서 수정
- `refactor {feature-name} ({jira_code})`: 코드 리팩토링
- `modify {feature-name} ({jira_code})` : 기존 기능 수정 및 로직 변경

<br>
