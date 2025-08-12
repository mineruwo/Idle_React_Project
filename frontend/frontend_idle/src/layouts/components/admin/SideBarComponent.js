import { useState } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import { useSelector } from 'react-redux'; // useSelector 임포트
import './SidebarComponent.css';

const SidebarComponent = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const adminLoginState = useSelector((state) => state.adminLogin); // adminLoginState 가져오기
  const { role } = adminLoginState; // 권한 가져오기

  // 권한에 따른 메뉴 정의
  const menuConfig = {
    ALL_PERMISSION: ['대시보드', '관리자 계정 관리', '고객 계정 관리', '매출 관리', '상담 문의 관리', '공지 사항 관리'],
    DEV_ADMIN: ['대시보드', '관리자 계정 관리'],
    ADMIN: ['대시보드', '고객 계정 관리', '매출 관리'],
    MANAGER_COUNSELING: ['대시보드', '상담 문의 관리', '공지 사항 관리'],
    COUNSELOR: ['대시보드', '상담 문의 관리'],
  };

  const accessibleMenus = menuConfig[role] || [];

  const handleNavigation = (path, e) => {
    if (e) e.stopPropagation();
    if (!adminLoginState.isAuthenticated) { // 로그인되어 있지 않으면
        navigate("/admin/login"); // 로그인 페이지로 리다이렉트
        return; // 네비게이션 중단
    }
    navigate(path);
    // toggleSidebar();
  };

  const toggleSubMenu = (menuName, path) => {
    if (!adminLoginState.isAuthenticated) { // 로그인되어 있지 않으면
        navigate("/admin/login"); // 로그인 페이지로 리다이렉트
        return; // 네비게이션 중단
    }
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
    navigate(path);
  };

  // useMatch 훅을 컴포넌트 최상위에서 호출
  const matchDashboard = useMatch({ path: '/admin/dashboard', end: true });
  const matchAdminAccounts = useMatch({ path: '/admin/admin-accounts/*', end: false });
  const matchAdminAccountsExact = useMatch({ path: '/admin/admin-accounts', end: true });
  const matchAdminAccountsCreate = useMatch({ path: '/admin/admin-accounts/create', end: true });
  const matchCustomerAccounts = useMatch({ path: '/admin/customer-accounts/*', end: false });
  const matchCustomerAccountsExact = useMatch({ path: '/admin/customer-accounts', end: true });
  const matchCustomerAccountsCreate = useMatch({ path: '/admin/customer-accounts/create', end: true });
  const matchSales = useMatch({ path: '/admin/sales/*', end: false });
  const matchSalesExact = useMatch({ path: '/admin/sales', end: true });
  const matchSalesSettlement = useMatch({ path: '/admin/sales/settlement', end: true });
  const matchInquiries = useMatch({ path: '/admin/inquiries/*', end: false });
  const matchInquiriesExact = useMatch({ path: '/admin/inquiries', end: true });
  const matchMyInquiries = useMatch({ path: '/admin/inquiries/my-inquiries', end: true });
  const matchChatSessions = useMatch({ path: '/admin/inquiries/chat-sessions', end: true });
  const matchNotices = useMatch({ path: '/admin/notices/*', end: false });
  const matchNoticesExact = useMatch({ path: '/admin/notices', end: true });
  const matchFAQ = useMatch({ path: '/admin/notices/faq', end: true });

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>관리자 페이지</h2>
      </div>
      <ul className="sidebar-list">
        <li
          onClick={() => handleNavigation('/admin/dashboard')}
          className={matchDashboard ? 'active' : ''} // 대시보드는 정확히 일치할 때만 활성화
        >
          대시보드
        </li>

        {/* 관리자 계정 관리 */}
        {accessibleMenus.includes('관리자 계정 관리') && (
          <li
            onClick={() => toggleSubMenu('adminAccounts', '/admin/admin-accounts')}
            className={`has-submenu ${openSubMenu === 'adminAccounts' ? 'is-open' : ''} ${matchAdminAccounts ? 'active' : ''}`}
          >
            관리자 계정 관리
            {openSubMenu === 'adminAccounts' && (
              <ul className="submenu-list">
                <li onClick={(e) => handleNavigation('/admin/admin-accounts', e)} className={matchAdminAccountsExact ? 'active' : ''}>관리자 계정 관리</li>
                <li onClick={(e) => handleNavigation('/admin/admin-accounts/create', e)} className={matchAdminAccountsCreate ? 'active' : ''}>관리자 계정 생성</li>
              </ul>
            )}
          </li>
        )}

        {/* 고객 계정 관리 */}
        {accessibleMenus.includes('고객 계정 관리') && (
          <li
            onClick={() => toggleSubMenu('customerAccounts', '/admin/customer-accounts')}
            className={`has-submenu ${openSubMenu === 'customerAccounts' ? 'is-open' : ''} ${matchCustomerAccounts ? 'active' : ''}`}
          >
            고객 계정 관리
            {openSubMenu === 'customerAccounts' && (
              <ul className="submenu-list">
                <li onClick={(e) => handleNavigation('/admin/customer-accounts', e)} className={matchCustomerAccountsExact ? 'active' : ''}>고객 계정 관리</li>
                <li onClick={(e) => handleNavigation('/admin/customer-accounts/create', e)} className={matchCustomerAccountsCreate ? 'active' : ''}>고객 계정 생성</li>
              </ul>
            )}
          </li>
        )}

        {/* 매출 관리 */}
        {accessibleMenus.includes('매출 관리') && (
          <li
            onClick={() => toggleSubMenu('sales', '/admin/sales')}
            className={`has-submenu ${openSubMenu === 'sales' ? 'is-open' : ''} ${matchSales ? 'active' : ''}`}
          >
            매출 관리
            {openSubMenu === 'sales' && (
              <ul className="submenu-list">
                <li onClick={(e) => handleNavigation('/admin/sales', e)} className={matchSalesExact ? 'active' : ''}>매출 상세 보기</li>
                <li onClick={(e) => handleNavigation('/admin/sales/settlement', e)} className={matchSalesSettlement ? 'active' : ''}>매출 정산 관리</li>
              </ul>
            )}
          </li>
        )}

        {/* 상담 문의 관리 */}
        {accessibleMenus.includes('상담 문의 관리') && (
          <li
            onClick={() => toggleSubMenu('inquiries', '/admin/inquiries')}
            className={`has-submenu ${openSubMenu === 'inquiries' ? 'is-open' : ''} ${matchInquiries ? 'active' : ''}`}
          >
            상담 문의 관리
            {openSubMenu === 'inquiries' && (
              <ul className="submenu-list">
                <li onClick={(e) => handleNavigation('/admin/inquiries', e)} className={matchInquiriesExact ? 'active' : ''}>문의 내역 확인</li>
                <li onClick={(e) => handleNavigation('/admin/inquiries/chat-sessions', e)} className={matchChatSessions ? 'active' : ''}>실시간 채팅 세션 관리</li>
                <li onClick={(e) => handleNavigation('/admin/inquiries/my-inquiries', e)} className={matchMyInquiries ? 'active' : ''}>내 상담 내역 확인</li>
              </ul>
            )}
          </li>
        )}

        {/* 공지 사항 관리 */}
        {accessibleMenus.includes('공지 사항 관리') && (
          <li
            onClick={() => toggleSubMenu('notices', '/admin/notices')}
            className={`has-submenu ${openSubMenu === 'notices' ? 'is-open' : ''} ${matchNotices ? 'active' : ''}`}
          >
            공지 사항 관리
            {openSubMenu === 'notices' && (
              <ul className="submenu-list">
                <li onClick={(e) => handleNavigation('/admin/notices', e)} className={matchNoticesExact ? 'active' : ''}>공지 사항 관리</li>
                <li onClick={(e) => handleNavigation('/admin/notices/faq', e)} className={matchFAQ ? 'active' : ''}>자주 묻는 질문 관리</li>
              </ul>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

export default SidebarComponent;