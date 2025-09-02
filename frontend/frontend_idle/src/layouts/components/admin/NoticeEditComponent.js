
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getNoticeForEdit, updateNotice } from '../../../api/adminApi';
import '../../../theme/admin.css';

const NoticeEditComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const adminId = useSelector(state => state.adminLogin.id);
  const [writerAdminId, setWriterAdminId] = useState('');

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const notice = await getNoticeForEdit(id);
        setTitle(notice.title);
        setContent(notice.content);
        setWriterAdminId(notice.writerAdmin?.adminId);
      } catch (error) {
        console.error('Error fetching notice:', error);
        alert('공지사항 정보를 가져오는데 실패했습니다.');
      }
    };
    fetchNotice();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedNotice = {
      title,
      content,
      writerAdminId: adminId, // 수정자는 현재 로그인한 관리자
    };

    try {
      await updateNotice(id, updatedNotice);
      alert('공지사항이 성공적으로 수정되었습니다.');
      navigate('/admin/notices');
    } catch (error) {
      console.error('Error updating notice:', error);
      alert('공지사항 수정에 실패했습니다.');
    }
  };

  return (
    <div className="admin-container">
        <div className="admin-header">
            <h2>공지사항 수정</h2>
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
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    placeholder="공지 내용을 입력하세요..."
                    modules={{
                        toolbar: [
                            [{ 'header': [1, 2, false] }],
                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            [{ 'indent': '-1' }, { 'indent': '+1' }],
                            ['link', 'image'],
                            ['clean']
                        ],
                    }}
                    formats={[
                        'header',
                        'bold', 'italic', 'underline', 'strike', 'blockquote',
                        'list', 'bullet', 'indent',
                        'link', 'image'
                    ]}
                    className="admin-quill-editor"
                />
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
            <button type="submit" className="admin-primary-btn">공지사항 수정</button>
        </form>
    </div>
  );
};

export default NoticeEditComponent;
