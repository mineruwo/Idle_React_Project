
import React, { useEffect, useState } from 'react';
import NoticeManagementButton from '../NoticeManagementButton';
import { getAllNotices } from '../../../api/adminApi'; // Import the API function

const NoticeManagement = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const data = await getAllNotices();
                setNotices(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류 발생: {error.message}</div>;
    }

    return (
        <div>
            <h2>공지 사항 관리</h2>
            <NoticeManagementButton />
            <h3>공지사항 목록</h3>
            {notices.length === 0 ? (
                <p>등록된 공지사항이 없습니다.</p>
            ) : (
                <ul>
                    {notices.map(notice => (
                        <li key={notice.id}>
                            <h4>{notice.title}</h4>
                            <p>{notice.content}</p>
                            <small>작성자: {notice.writerAdminId} | 작성일: {new Date(notice.createdAt).toLocaleString()}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NoticeManagement;