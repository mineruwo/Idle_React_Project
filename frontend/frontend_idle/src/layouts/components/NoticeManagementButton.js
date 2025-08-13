import React from 'react';
import { Link } from 'react-router-dom';

const NoticeManagementButton = () => {
  return (
    <div>
      <Link to="/admin/notices/create">
        <button>공지사항 작성</button>
      </Link>
    </div>
  );
};

export default NoticeManagementButton;
