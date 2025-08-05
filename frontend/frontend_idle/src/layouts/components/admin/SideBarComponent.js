import React, { useState } from 'react';
import './SidebarComponent.css';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarComponent = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const handleNavigation = (path, e) => {
    if (e) e.stopPropagation();
    navigate(path);
    // toggleSidebar();
  };

  const toggleSubMenu = (menuName, path) => {
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
    navigate(path);
  };

  // 현재 경로가 주어진 경로로 시작하는지 확인 (메인 메뉴 활성화용)
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // 현재 경로가 주어진 경로와 정확히 일치하는지 확인 (서브메뉴 활성화용)
  const isExactActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>관리자 페이지</h2>
        </div>
        <ul className="sidebar-list">
          <li
            onClick={() => handleNavigation('/admin/dashboard')}
            className={isExactActive('/admin/dashboard') ? 'active' : ''} // 대시보드는 정확히 일치할 때만 활성화
          >
            대시보드
          </li>

          {/* 관리자 계정 관리 */}
          <li
            onClick={() => toggleSubMenu('adminAccounts', '/admin/admin-accounts')}
            className={`has-submenu ${openSubMenu === 'adminAccounts' ? 'is-open' : ''} ${isActive('/admin/admin-accounts') ? 'active' : ''}`}
          >
            관리자 계정 관리
            {openSubMenu === 'adminAccounts' && (
              <ul className="submenu-list">
                <li onClick={(e) => handleNavigation('/admin/admin-accounts', e)} className={isExactActive('/admin/admin-accounts') ? 'active' : ''}>관리자 계정 관리</li>
                <li onClick={(e) => handleNavigation('/admin/admin-accounts/create', e)} className={isExactActive('/admin/admin-accounts/create') ? 'active' : ''}>관리자 계정 생성</li>
              </ul>
            )}
          </li>

          {/* 고객 계정 관리 */}
          <li
            onClick={() => toggleSubMenu('customerAccounts', '/admin/customer-accounts')}
            className={`has-submenu ${openSubMenu === 'customerAccounts' ? 'is-open' : ''} ${isActive('/admin/customer-accounts') ? 'active' : ''}`}
          >
            고객 계정 관리
            {openSubMenu === 'customerAccounts' && (
              <ul className="submenu-list">
                <li onClick={(e) => handleNavigation('/admin/customer-accounts', e)} className={isExactActive('/admin/customer-accounts') ? 'active' : ''}>고객 계정 관리</li>
                <li onClick={(e) => handleNavigation('/admin/customer-accounts/create', e)} className={isExactActive('/admin/customer-accounts/create') ? 'active' : ''}>고객 계정 생성</li>
              </ul>
            )}
          </li>

          {/* 매출 관리 */}
          <li
            onClick={() => toggleSubMenu('sales', '/admin/sales')}
            className={`has-submenu ${openSubMenu === 'sales' ? 'is-open' : ''} ${isActive('/admin/sales') ? 'active' : ''}`}
          >
            매출 관리
            {openSubMenu === 'sales' && (
              <ul className="submenu-list">
                <li onClick={(e) => handleNavigation('/admin/sales', e)} className={isExactActive('/admin/sales') ? 'active' : ''}>매출 상세 보기</li>
                <li onClick={(e) => handleNavigation('/admin/sales/settlement', e)} className={isExactActive('/admin/sales/settlement') ? 'active' : ''}>매출 정산 관리</li>
              </ul>
            )}
          </li>

          {/* 상담 문의 관리 */}
          <li
            onClick={() => toggleSubMenu('inquiries', '/admin/inquiries')}
            className={`has-submenu ${openSubMenu === 'inquiries' ? 'is-open' : ''} ${isActive('/admin/inquiries') ? 'active' : ''}`}
          >
            상담 문의 관리
            {openSubMenu === 'inquiries' && (
              <ul className="submenu-list">
                <li onClick={(e) => handleNavigation('/admin/inquiries', e)} className={isExactActive('/admin/inquiries') ? 'active' : ''}>문의 내역 확인</li>
                <li onClick={(e) => handleNavigation('/admin/inquiries/chat-sessions', e)} className={isExactActive('/admin/inquiries/chat-sessions') ? 'active' : ''}>실시간 채팅 세션 관리</li>
                <li onClick={(e) => handleNavigation('/admin/inquiries/my-inquiries', e)} className={isExactActive('/admin/inquiries/my-inquiries') ? 'active' : ''}>내 상담 내역 확인</li>
              </ul>
            )}
          </li>

          {/* 공지 사항 관리 */}
          <li
            onClick={() => toggleSubMenu('notices', '/admin/notices')}
            className={`has-submenu ${openSubMenu === 'notices' ? 'is-open' : ''} ${isActive('/admin/notices') ? 'active' : ''}`}
          >
            공지 사항 관리
            {openSubMenu === 'notices' && (
              <ul className="submenu-list">
                <li onClick={(e) => handleNavigation('/admin/notices', e)} className={isExactActive('/admin/notices') ? 'active' : ''}>공지 사항 관리</li>
                <li onClick={(e) => handleNavigation('/admin/notices/faq', e)} className={isExactActive('/admin/notices/faq') ? 'active' : ''}>자주 묻는 질문 관리</li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default SidebarComponent;