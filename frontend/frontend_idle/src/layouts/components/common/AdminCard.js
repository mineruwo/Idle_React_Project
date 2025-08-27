import React from 'react';
import '../../../theme/admin.css';

const AdminCard = ({ title, children, className = '' }) => {
    return (
        <div className={`admin-card ${className}`}>
            {title && <h3 style={{ color: 'var(--admin-pink-header)', borderBottom: '1px solid var(--admin-pink-panel-border)', paddingBottom: '10px', marginBottom: '15px' }}>{title}</h3>}
            {children}
        </div>
    );
};

export default AdminCard;
