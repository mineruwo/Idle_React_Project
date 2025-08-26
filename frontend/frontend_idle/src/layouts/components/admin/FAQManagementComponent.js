import React, { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getAllFAQs, deleteFAQ, toggleFAQActive } from '../../../api/adminApi';
import useDashboardData from '../../../hooks/useDashboardData';
import Modal from '../common/Modal';
import '../../../theme/admin.css';

const FAQManagementComponent = () => {
    const { data: faqs, loading, error, fetchData } = useDashboardData(getAllFAQs);
    const [expandedId, setExpandedId] = useState(null);
    const [modalState, setModalState] = useState({ show: false, message: "", onConfirm: null, showCancel: false });

    const showModal = (message, onConfirm = null, showCancel = false) => {
        setModalState({ show: true, message, onConfirm, showCancel });
    };

    const closeModal = () => {
        setModalState({ ...modalState, show: false });
    };

    const handleRowClick = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleDeleteConfirm = async (id) => {
        try {
            await deleteFAQ(id);
            showModal('FAQ가 삭제되었습니다.');
            fetchData(); // Refresh list
        } catch (err) {
            showModal('삭제에 실패했습니다.');
        }
    };

    const handleDelete = (id) => {
        showModal('정말로 이 FAQ를 삭제하시겠습니까? 데이터는 복구할 수 없습니다.', () => handleDeleteConfirm(id), true);
    };

    const handleToggleConfirm = async (id) => {
        const faq = faqs.find(f => f.id === id);
        const action = faq.is_del ? '활성화' : '비활성화';
        try {
            await toggleFAQActive(id);
            showModal(`FAQ가 ${action}되었습니다.`);
            fetchData(); // Refresh list
        } catch (err) {
            showModal(`${action}에 실패했습니다.`);
        }
    };

    const handleToggle = (id) => {
        const faq = faqs.find(f => f.id === id);
        const action = faq.is_del ? '활성화' : '비활성화';
        showModal(`이 FAQ를 ${action}하시겠습니까?`, () => handleToggleConfirm(id), true);
    };

    const columns = [
        { header: '번호', key: 'id', render: (item) => item.id },
        { header: '질문', key: 'question', render: (item) => item.question },
        { header: '상태', key: 'is_del', render: (item) => (item.is_del ? '비활성' : '활성') },
        { header: '조회수', key: 'viewCount', render: (item) => item.viewCount },
        {
            header: '관리',
            key: 'actions',
            render: (item) => (
                <Link to={`/admin/faqs/edit/${item.id}`} className="admin-action-btn admin-modify-btn">수정</Link>
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
                <h2>자주 묻는 질문 관리</h2>
                <Link to="/admin/faqs/create" className="admin-primary-btn">
                    새 FAQ 등록
                </Link>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        {columns.map(col => <th key={col.key}>{col.header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {faqs.length > 0 ? (
                        faqs.map(faq => (
                            <Fragment key={faq.id}>
                                <tr className={`admin-table-row ${faq.is_del ? 'deactivated' : ''}`} onClick={() => handleRowClick(faq.id)}>
                                    {columns.map(col => (
                                        <td key={`${faq.id}-${col.key}`}>{col.render ? col.render(faq) : faq[col.key]}</td>
                                    ))}
                                </tr>
                                {expandedId === faq.id && (
                                    <tr className="admin-content-row">
                                        <td colSpan={columns.length}>
                                            <div className="admin-content-box">
                                                <strong>답변:</strong>
                                                <div style={{ marginTop: '5px' }} dangerouslySetInnerHTML={{ __html: faq.answer }}></div>
                                            </div>
                                            <div className="admin-actions">
                                                <button onClick={() => handleDelete(faq.id)} className="admin-action-btn admin-delete-btn">삭제</button>
                                                <button onClick={() => handleToggle(faq.id)} className="admin-action-btn admin-toggle-btn">
                                                    {faq.is_del ? '활성화' : '비활성화'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length}>등록된 FAQ가 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default FAQManagementComponent;
