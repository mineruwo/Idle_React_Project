import React, { useState, useEffect } from 'react';
import { getAllNotices } from '../../../api/adminApi'; // Assuming this path is correct
import './NoticeComponent.css'; // Import new CSS file for collapse animation

const NoticeComponent = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedNoticeId, setExpandedNoticeId] = useState(null); // State for individual notice expansion

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                setLoading(true);
                const response = await getAllNotices();
                const activeNotices = response.filter(notice => !notice.is_del);
                setNotices(activeNotices);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    const handleNoticeClick = (id) => {
        setExpandedNoticeId(expandedNoticeId === id ? null : id);
    };

    if (loading) {
        return <div className="container py-5">로딩 중...</div>;
    }

    if (error) {
        return <div className="container py-5">오류 발생: {error.message}</div>;
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4 fw-bold">공지사항</h2>
            <ul className="list-group">
                {notices.length > 0 ? (
                    notices.map(notice => (
                        <li key={notice.id} className="list-group-item notice-item" onClick={() => handleNoticeClick(notice.id)}>
                            <div className="notice-header">
                                <h5 className="mb-1">{notice.title}</h5>
                                <small className="text-muted">{new Date(notice.createdAt).toLocaleDateString()}</small>
                                <i className={`arrow ${expandedNoticeId === notice.id ? 'down' : 'up'}`}></i>
                            </div>
                            <div 
                                dangerouslySetInnerHTML={{ __html: notice.content }}
                                className={`notice-content mt-2 ${expandedNoticeId === notice.id ? 'expanded' : ''}`}>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="list-group-item">등록된 공지사항이 없습니다.</li>
                )}
            </ul>
        </div>
    );
};

export default NoticeComponent;