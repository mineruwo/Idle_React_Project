import React from 'react';
import '../../../theme/admin.css';

const AdminButton = ({ children, onClick, className = '', type = 'button', disabled = false }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`admin-button ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default AdminButton;
