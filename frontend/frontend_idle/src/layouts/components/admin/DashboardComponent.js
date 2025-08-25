
import React from 'react';
import { useSelector } from 'react-redux';
import AdminAccountDashboard from './AdminAccountDashboard';
import CustomerAccountDashboard from './CustomerAccountDashboard';
import RecentAdminAccountsDashboard from './RecentAdminAccountsDashboard'; // New import
import RecentCustomerAccountsDashboard from './RecentCustomerAccountsDashboard'; // New import
import NoticeAndFaqDashboard from './NoticeAndFaqDashboard';
import '../../../theme/admin.css';

const DashboardComponent = () => {
  const { adminName, role } = useSelector((state) => state.adminLogin);

  const menuConfig = {
    ALL_PERMISSION: ['대시보드', '관리자 계정 관리', '고객 계정 관리', '매출 관리', '상담 문의 관리', '공지 사항 관리'],
    DEV_ADMIN: ['대시보드', '관리자 계정 관리'],
    ADMIN: ['대시보드', '고객 계정 관리', '매출 관리'],
    MANAGER_COUNSELING: ['대시보드', '상담 문의 관리', '공지 사항 관리'],
    COUNSELOR: ['대시보드', '상담 문의 관리'],
  };

  const accessibleMenus = menuConfig[role] || [];

  // Simple card component for dashboard sections
  const DashboardSection = ({ title, children }) => (
    <div className="admin-form-container" style={{ marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--admin-pink-header)', borderBottom: '1px solid var(--admin-pink-panel-border)', paddingBottom: '10px', marginBottom: '15px' }}>{title}</h3>
        {children}
    </div>
  );

  return (
    <div className="admin-container">
        <div className="admin-header">
            <h2>{adminName}님, 환영합니다.</h2>
        </div>

        {accessibleMenus.includes('관리자 계정 관리') && (
          <DashboardSection title="관리자 계정 관리">
             <AdminAccountDashboard />
          </DashboardSection>
        )}

        {accessibleMenus.includes('고객 계정 관리') && (
            <DashboardSection title="고객 계정 관리">
                <CustomerAccountDashboard />
            </DashboardSection>
        )}

        {accessibleMenus.includes('매출 관리') && (
            <DashboardSection title="매출 관리">
                <p>매출 관리 관련 내용이 여기에 표시됩니다.</p>
            </DashboardSection>
        )}

        {accessibleMenus.includes('상담 문의 관리') && (
            <DashboardSection title="상담 문의 관리">
                <p>상담 문의 관련 내용이 여기에 표시됩니다.</p>
            </DashboardSection>
        )}

        {accessibleMenus.includes('공지 사항 관리') && (
            <DashboardSection title="공지 사항 관리">
                <NoticeAndFaqDashboard />
            </DashboardSection>
        )}

        {accessibleMenus.length === 1 && accessibleMenus[0] === '대시보드' && (
             <DashboardSection title="대시보드">
                <p>접근 가능한 메뉴가 없습니다.</p>
            </DashboardSection>
        )}
    </div>
  );
};

export default DashboardComponent;
