import React, { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getAllFAQs, deleteFAQ, toggleFAQActive } from '../../../api/adminApi';
import '../../../theme/admin.css';

const FAQManagementComponent = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const data = await getAllFAQs();
            setFaqs(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('정말로 이 FAQ를 삭제하시겠습니까? 데이터는 복구할 수 없습니다.')) {
            try {
                await deleteFAQ(id);
                alert('FAQ가 삭제되었습니다.');
                fetchFAQs(); // Refresh list
            } catch (err) {
                alert('삭제에 실패했습니다.');
            }
        }
    };

    const handleToggle = async (id) => {
        const faq = faqs.find(f => f.id === id);
        const action = faq.is_del ? '활성화' : '비활성화';
        if (window.confirm(`이 FAQ를 ${action}하시겠습니까?`)) {
            try {
                await toggleFAQActive(id);
                alert(`FAQ가 ${action}되었습니다.`);
                fetchFAQs(); // Refresh list
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
                <h2>자주 묻는 질문 관리</h2>
                <Link to="/admin/faqs/create" className="admin-primary-btn">
                    새 FAQ 등록
                </Link>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>질문</th>
                        <th>상태</th>
                        <th>조회수</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {faqs.length > 0 ? (
                        faqs.map(faq => (
                            <Fragment key={faq.id}>
                                <tr className={`admin-table-row ${faq.is_del ? 'deactivated' : ''}`} onClick={() => handleRowClick(faq.id)}>
                                    <td>{faq.id}</td>
                                    <td>{faq.question}</td>
                                    <td>{faq.is_del ? '비활성' : '활성'}</td>
                                    <td>{faq.viewCount}</td>
                                    <td>
                                        <Link to={`/admin/faqs/edit/${faq.id}`} className="admin-action-btn admin-modify-btn">수정</Link>
                                    </td>
                                </tr>
                                {expandedId === faq.id && (
                                    <tr className="admin-content-row">
                                        <td colSpan="5">
                                            <div className="admin-content-box">
                                                <strong>답변:</strong>
                                                <p style={{ marginTop: '5px' }}>{faq.answer}</p>
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
                            <td colSpan="4">등록된 FAQ가 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default FAQManagementComponent;