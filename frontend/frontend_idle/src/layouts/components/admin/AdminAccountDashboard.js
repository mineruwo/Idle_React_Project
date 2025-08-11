import React from 'react';
import { renderAccountPanel } from '../../../utils/dashboardUtils'; // 유틸리티 함수 임포트
import { Paper } from '@mui/material'; // Import Paper component
import './AdminAccountDashboard.css'; // Import CSS file

const AdminAccountDashboard = () => {
    return (
        <Paper className="admin-dashboard-paper"> {/* Applied className */}
            <div className="admin-dashboard-content"> {/* Applied className */}
                {renderAccountPanel('최근 생성된 관리자 계정', '생성일')}
                {renderAccountPanel('최근 삭제된 관리자 계정', '삭제일')}
            </div>
        </Paper>
    );
};

export default AdminAccountDashboard;
