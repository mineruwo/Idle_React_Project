import React, { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getAllNotices, deleteNotice, toggleNoticeActive } from '../../../api/adminApi';
import useDashboardData from '../../../hooks/useDashboardData';
import Modal from '../common/Modal';
import AdminButton from '../common/AdminButton'; // Import AdminButton
import '../../../theme/admin.css';

const NoticeListComponent = () => {
    const { data: notices, loading, error, fetchData } = useDashboardData(getAllNotices);
    const [expandedNoticeId, setExpandedNoticeId] = useState(null);
    const [modalState, setModalState] = useState({ show: false, message: "", onConfirm: null, showCancel: false });

    const showModal = (message, onConfirm = null, showCancel = false) => {
        setModalState({ show: true, message, onConfirm, showCancel });
    };

    const closeModal = () => {
        setModalState({ ...modalState, show: false });
    };

    const handleRowClick = (noticeId) => {
        setExpandedNoticeId(expandedNoticeId === noticeId ? null : noticeId);
    };

    const handleDeleteConfirm = async (noticeId) => {
        try {
            await deleteNotice(noticeId);
            showModal('공지사항이 삭제되었습니다.');
            fetchData(); // Refresh list
        } catch (err) {
            showModal('삭제에 실패했습니다.');
        }
    };

    const handleDelete = (noticeId) => {
        showModal('정말로 이 공지사항을 삭제하시겠습니까? 데이터는 복구할 수 없습니다.', () => handleDeleteConfirm(noticeId), true);
    };

    const handleToggleConfirm = async (noticeId) => {
        const notice = notices.find(n => n.id === noticeId);
        const action = notice.is_del ? '활성화' : '비활성화';
        try {
            await toggleNoticeActive(noticeId);
            showModal(`공지사항이 ${action}되었습니다.`);
            fetchData(); // Refresh list
        } catch (err) {
            showModal(`${action}에 실패했습니다.`);
        }
    };

    const handleToggle = (noticeId) => {
        const notice = notices.find(n => n.id === noticeId);
        const action = notice.is_del ? '활성화' : '비활성화';
        showModal(`이 공지사항을 ${action}하시겠습니까?`, () => handleToggleConfirm(noticeId), true);
    };

    const columns = [
        { header: '번호', key: 'id', render: (item) => item.id },
        { header: '제목', key: 'title', render: (item) => item.title },
        { header: '작성자', key: 'writerAdminId', render: (item) => item.writerAdminId },
        { header: '작성일', key: 'createdAt', render: (item) => new Date(item.createdAt).toLocaleDateString() },
        { header: '조회수', key: 'viewCount', render: (item) => item.viewCount },
        {
            header: '관리',
            key: 'actions',
            render: (item) => (
                <Link to={`/admin/notices/edit/${item.id}`} className="admin-action-btn admin-modify-btn">수정</Link>
            ),
        },
    ];

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류 발생: {error.message}</div>;
    }

    return (
        <div className="admin-container">
            <Modal 
                show={modalState.show} 
                message={modalState.message} 
                onClose={closeModal} 
                onConfirm={modalState.onConfirm} 
                showCancel={modalState.showCancel} 
            />
            <div className="admin-header">
                <h2>공지 사항 관리</h2>
                <Link to="/admin/notices/create">
                    <AdminButton variant="primary"> 
                        공지사항 생성
                    </AdminButton>
                </Link>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        {columns.map(col => <th key={col.key}>{col.header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {notices.length > 0 ? (
                        notices.map(notice => (
                            <Fragment key={notice.id}>
                                <tr className={`admin-table-row ${notice.is_del ? 'deactivated' : ''}`} onClick={() => handleRowClick(notice.id)}>
                                    {columns.map(col => (
                                        <td key={`${notice.id}-${col.key}`}>{col.render ? col.render(notice) : notice[col.key]}</td>
                                    ))}
                                </tr>
                                {expandedNoticeId === notice.id && (
                                    <tr className="admin-content-row">
                                        <td colSpan={columns.length}>
                                            <div className="admin-content-box">
                                            </div>
                                            <div className="admin-actions">
                                                <Link to={`/admin/notices/edit/${notice.id}`}> {/* Removed className from Link */}
                                                    <AdminButton variant="modify">수정</AdminButton> {/* Changed to AdminButton */}
                                                </Link>
                                                <AdminButton onClick={() => handleDelete(notice.id)} variant="delete">삭제</AdminButton> 
                                                <AdminButton onClick={() => handleToggle(notice.id)} variant="toggle"> 
                                                    {notice.is_del ? '활성화' : '비활성화'}
                                                </AdminButton>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length}>등록된 공지사항이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default NoticeListComponent;