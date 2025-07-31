import React from 'react';
import './SidebarComponent.css';

const SidebarComponent = ({ isOpen, toggleSidebar }) => {

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
          <li>대시보드</li>
          <li>관리자 계정 관리</li>
          <li>고객 계정 관리</li>
          <li>매출 관리</li>
          <li>상담 문의 관리</li>
          <li>공지사항 관리</li>
        </ul>
      </div>
    </>
  );
};

export default SidebarComponent;