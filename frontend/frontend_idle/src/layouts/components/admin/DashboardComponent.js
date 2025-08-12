import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useSelector } from 'react-redux'; // Import useSelector
import AdminAccountDashboard from './AdminAccountDashboard'; // Import AdminAccountDashboard
import CustomerAccountDashboard from './CustomerAccountDashboard'; // Import CustomerAccountDashboard
import './DashboardComponent.css'; // Import CSS file

const DashboardComponent = () => {
  const { adminName, role } = useSelector((state) => state.adminLogin); // Get adminName and role

  // Define menu configuration based on roles, similar to SidebarComponent
  const menuConfig = {
    ALL_PERMISSION: ['대시보드', '관리자 계정 관리', '고객 계정 관리', '매출 관리', '상담 문의 관리', '공지 사항 관리'],
    DEV_ADMIN: ['대시보드', '관리자 계정 관리'],
    ADMIN: ['대시보드', '고객 계정 관리', '매출 관리'],
    MANAGER_COUNSELING: ['대시보드', '상담 문의 관리', '공지 사항 관리'],
    COUNSELOR: ['대시보드', '상담 문의 관리'],
  };

  const accessibleMenus = menuConfig[role] || [];

  return (
    <Box className="dashboard-main-box">
      <Typography variant="h4" gutterBottom className="dashboard-title">
        {adminName}님 대시보드
      </Typography>

      <Box className="dashboard-content-box">
        {/* 관리자 계정 관리 영역 */}
        {accessibleMenus.includes('관리자 계정 관리') && (
          // Replaced Paper with AdminAccountDashboard
          <AdminAccountDashboard />
        )}

        {/* 고객 계정 관리 영역 */}
        {accessibleMenus.includes('고객 계정 관리') && (
          // Replaced Paper with CustomerAccountDashboard
          <CustomerAccountDashboard />
        )}

        {/* 매출 관리 영역 */}
        {accessibleMenus.includes('매출 관리') && (
          <Paper className="dashboard-debug-paper bg-fff3e0">
            <Typography variant="h6">매출 관리 영역</Typography>
          </Paper>
        )}

        {/* 상담 문의 관리 영역 */}
        {accessibleMenus.includes('상담 문의 관리') && (
          <Paper className="dashboard-debug-paper bg-f3e5f5">
            <Typography variant="h6">상담 문의 관리 영역</Typography>
          </Paper>
        )}

        {/* 공지 사항 관리 영역 */}
        {accessibleMenus.includes('공지 사항 관리') && (
          <Paper className="dashboard-debug-paper bg-ffebee">
            <Typography variant="h6">공지 사항 관리 영역</Typography>
          </Paper>
        )}

        {/* 기타 대시보드 내용 (권한이 없는 경우) */}
        {accessibleMenus.length === 1 && accessibleMenus.includes('대시보드') && ( // Only '대시보드' is accessible
          <Paper className="dashboard-debug-paper bg-eceff1">
            <Typography variant="h6">접근 가능한 대시보드 내용이 없습니다.</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default DashboardComponent;