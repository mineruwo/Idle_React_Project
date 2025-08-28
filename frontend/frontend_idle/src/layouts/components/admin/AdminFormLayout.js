import React from 'react';
import '../../../theme/admin.css'; // Ensure admin.css is imported for styling

const AdminFormLayout = ({ title, children }) => {
  return (
    <div className="admin-form-container">
      {title && <h2 className="admin-header admin-form-title">{title}</h2>} {/* Added admin-form-title class */}
      {children}
    </div>
  );
};

export default AdminFormLayout;