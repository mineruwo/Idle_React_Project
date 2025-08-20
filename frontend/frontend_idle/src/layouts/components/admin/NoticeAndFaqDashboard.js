
import React, { useEffect, useState } from 'react';
import { getAllNotices, getAllFAQs } from '../../../api/adminApi';
import '../../../theme/admin.css';

const NoticeAndFaqDashboard = () => {
    const [notices, setNotices] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const noticeData = await getAllNotices();
                const faqData = await getAllFAQs();
                setNotices(noticeData.slice(0, 3));
                setFaqs(faqData.slice(0, 3));
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류 발생: {error.message}</div>;
    }

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <h4>최근 공지사항</h4>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>제목</th>
                            <th>조회수</th>
                            <th>작성자</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notices.length > 0 ? (
                            notices.map(notice => (
                                <tr key={notice.id}>
                                    <td>{notice.title}</td>
                                    <td>{notice.viewCount}</td>
                                    <td>{notice.writerAdminId}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">등록된 공지사항이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ flex: 1 }}>
                <h4>최근 자주 묻는 질문</h4>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>질문</th>
                            <th>조회수</th>
                            <th>작성자</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faqs.length > 0 ? (
                            faqs.map(faq => (
                                <tr key={faq.id}>
                                    <td>{faq.question}</td>
                                    <td>{faq.viewCount}</td>
                                    <td>{faq.writerAdminId}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">등록된 FAQ가 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NoticeAndFaqDashboard;
