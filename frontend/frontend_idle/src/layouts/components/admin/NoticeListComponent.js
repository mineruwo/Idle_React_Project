import React, { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getAllNotices, deleteNotice, toggleNoticeActive } from '../../../api/adminApi';
import '../../../theme/admin.css'; // 공통 CSS 파일 임포트

const NoticeListComponent = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedNoticeId, setExpandedNoticeId] = useState(null); // 펼쳐진 공지 ID 상태

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const data = await getAllNotices();
            setNotices(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (noticeId) => {
        setExpandedNoticeId(expandedNoticeId === noticeId ? null : noticeId);
    };

    const handleDelete = async (noticeId) => {
        if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까? 데이터는 복구할 수 없습니다.')) {
            try {
                await deleteNotice(noticeId);
                alert('공지사항이 삭제되었습니다.');
                fetchNotices(); // 목록 새로고침
            } catch (err) {
                alert('삭제에 실패했습니다.');
            }
        }
    };

    const handleToggle = async (noticeId) => {
        const notice = notices.find(n => n.id === noticeId);
        const action = notice.is_del ? '활성화' : '비활성화';
        if (window.confirm(`이 공지사항을 ${action}하시겠습니까?`)) {
            try {
                await toggleNoticeActive(noticeId);
                alert(`공지사항이 ${action}되었습니다.`);
                fetchNotices(); // 목록 새로고침
            } catch (err) {
                alert(`${action}에 실패했습니다.`);
            }
        }
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류 발생: {error.message}</div>;
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>공지 사항 관리</h2>
                <Link to="/admin/notices/create" className="admin-primary-btn">
                    공지사항 생성
                </Link>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>작성일</th>
                    </tr>
                </thead>
                <tbody>
                    {notices.length > 0 ? (
                        notices.map(notice => (
                            <Fragment key={notice.id}>
                                <tr className={`admin-table-row ${notice.is_del ? 'deactivated' : ''}`} onClick={() => handleRowClick(notice.id)}>
                                    <td>{notice.id}</td>
                                    <td>{notice.title}</td>
                                    <td>{notice.writerAdminId}</td>
                                    <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
                                </tr>
                                {expandedNoticeId === notice.id && (
                                    <tr className="admin-content-row">
                                        <td colSpan="4">
                                            <div className="admin-content-box">
                                                {notice.content}
                                            </div>
                                            <div className="admin-actions">
                                                <Link to={`/admin/notices/edit/${notice.id}`} className="admin-action-btn admin-modify-btn">수정</Link>
                                                <button onClick={() => handleDelete(notice.id)} className="admin-action-btn admin-delete-btn">삭제</button>
                                                <button onClick={() => handleToggle(notice.id)} className="admin-action-btn admin-toggle-btn">
                                                    {notice.is_del ? '활성화' : '비활성화'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">등록된 공지사항이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default NoticeListComponent;