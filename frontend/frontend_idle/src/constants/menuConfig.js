const menuConfig = [
  { name: '대시보드', path: '/admin/dashboard', permissions: ['ALL_PERMISSION', 'DEV_ADMIN', 'ADMIN', 'MANAGER_COUNSELING', 'COUNSELOR'] },
  {
    name: '관리자 계정 관리',
    path: '/admin/admin-accounts',
    permissions: ['ALL_PERMISSION', 'DEV_ADMIN'],
    submenu: [
      { name: '관리자 계정 관리', path: '/admin/admin-accounts' },
      { name: '관리자 계정 생성', path: '/admin/admin-accounts/create' },
    ],
  },
  {
    name: '고객 계정 관리',
    path: '/admin/customer-accounts',
    permissions: ['ALL_PERMISSION', 'ADMIN'],
    submenu: [
      { name: '고객 계정 관리', path: '/admin/customer-accounts' },
      { name: '고객 계정 생성', path: '/admin/customer-accounts/create' },
    ],
  },
  {
    name: '매출 관리',
    path: '/admin/sales',
    permissions: ['ALL_PERMISSION', 'ADMIN'],
    submenu: [
      { name: '매출 상세 보기', path: '/admin/sales' },
      { name: '매출 정산 관리', path: '/admin/sales/settlement' },
    ],
  },
  {
    name: '상담 문의 관리',
    path: '/admin/inquiries',
    permissions: ['ALL_PERMISSION', 'MANAGER_COUNSELING', 'COUNSELOR'],
    submenu: [
      { name: '문의 내역 확인', path: '/admin/inquiries' },
      { name: '실시간 채팅 세션 관리', path: '/admin/inquiries/chat-sessions' },
      { name: '내 상담 내역 확인', path: '/admin/inquiries/my-inquiries' },
    ],
  },
  {
    name: '공지 사항 관리',
    path: '/admin/notices',
    permissions: ['ALL_PERMISSION', 'MANAGER_COUNSELING'],
    submenu: [
      { name: '공지 사항 관리', path: '/admin/notices' },
      { name: '자주 묻는 질문 관리', path: '/admin/faqs' },
    ],
  },
];

export default menuConfig;
