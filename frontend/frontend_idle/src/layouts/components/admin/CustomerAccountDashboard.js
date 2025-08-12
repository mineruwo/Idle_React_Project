import React from 'react';
import { renderAccountPanel } from '../../../utils/dashboardUtils';
import { Paper } from '@mui/material'; // Import Paper component
import './CustomerAccountDashboard.css'; // Import CSS file

const CustomerAccountDashboard = () => {
    return (
        <Paper className="customer-dashboard-paper"> {/* Applied className */}
            <div className="customer-dashboard-content"> {/* Applied className */}
                {renderAccountPanel('최근 생성된 고객 계정', '생성일')}
                {renderAccountPanel('최근 삭제된 고객 계정', '삭제일')}
            </div>
        </Paper>
    );
};

export default CustomerAccountDashboard;
