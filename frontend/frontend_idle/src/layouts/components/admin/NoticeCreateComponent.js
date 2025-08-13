import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createNotice } from '../../../api/adminApi';
import '../../../theme/admin.css';

const NoticeCreateComponent = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const adminId = useSelector(state => state.adminLogin.id);
  const [writerAdminId, setWriterAdminId] = useState(adminId);

  useEffect(() => {
    setWriterAdminId(adminId);
  }, [adminId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newNotice = {
      title,
      content,
      writerAdminId,
    };

    try {
      await createNotice(newNotice);
      alert('공지사항이 성공적으로 등록되었습니다.');
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error creating notice:', error);
      alert('공지사항 등록에 실패했습니다.');
    }
  };

  return (
    <div className="admin-container">
        <div className="admin-header">
            <h2>새 공지사항 작성</h2>
        </div>
        <form onSubmit={handleSubmit} className="admin-form-container">
            <div className="admin-form-group">
                <label htmlFor="title">제목:</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div className="admin-form-group">
                <label htmlFor="content">내용:</label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                ></textarea>
            </div>
            <div className="admin-form-group">
                <label htmlFor="writerAdminId">작성자 관리자 ID:</label>
                <input
                    type="text"
                    id="writerAdminId"
                    value={writerAdminId || ''}
                    readOnly
                    required
                />
            </div>
            <button type="submit" className="admin-primary-btn">공지사항 등록</button>
        </form>
    </div>
  );
};

export default NoticeCreateComponent;