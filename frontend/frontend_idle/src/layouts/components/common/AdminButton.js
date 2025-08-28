import React from 'react';
import '../../../theme/admin.css';

const AdminButton = ({
    children,
    onClick,
    type = 'button',
    variant = 'default', // 'default', 'primary', 'action', 'delete', 'toggle', 'filter'
    className = '',
    isActive = false, // For filter buttons
    ...props
}) => {
    let buttonClass = 'admin-button'; // Base class

    switch (variant) {
        case 'primary':
            buttonClass = 'admin-primary-btn';
            break;
        case 'action':
            buttonClass = 'admin-action-btn';
            break;
        case 'modify':
            buttonClass = 'admin-action-btn admin-modify-btn';
            break;
        case 'delete':
            buttonClass = 'admin-action-btn admin-delete-btn';
            break;
        case 'toggle':
            buttonClass = 'admin-action-btn admin-toggle-btn';
            break;
        case 'filter':
            buttonClass = 'filter-button';
            if (isActive) {
                buttonClass += ' active';
            }
            break;
        default:
            // Use admin-button as default
            break;
    }

    // Combine with any additional classes passed
    const finalClassName = `${buttonClass} ${className}`.trim();

    return (
        <button
            type={type}
            onClick={onClick}
            className={finalClassName}
            {...props}
        >
            {children}
        </button>
    );
};

export default AdminButton;