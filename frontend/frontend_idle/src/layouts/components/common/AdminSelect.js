import React from 'react';
import '../../../theme/admin.css';

const AdminSelect = ({ value, onChange, options, className = '' }) => {
    return (
        <select
            value={value}
            onChange={onChange}
            className={`admin-select ${className}`}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default AdminSelect;
