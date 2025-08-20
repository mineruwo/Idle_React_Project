import React, { useState, useEffect } from 'react';
import '../../../theme/admin.css'; // 공통 CSS 임포트
import ActiveChatSessionChat from './ActiveChatSessionChat'; // 채팅 컴포넌트 임포트

const ActiveChatSessionsList = () => {
    const [sessions, setSessions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeChat, setActiveChat] = useState(null); // { chatRoomId, sessionId } 또는 null

    useEffect(() => {
        const fetchSessions = async () => {
            console.log('Fetching active chat sessions...');
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/chat-sessions`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }
                const data = await response.json();
                console.log('Received active chat sessions data:', data);
                setSessions(data);
            } catch (e) {
                console.error('Error fetching active chat sessions:', e);
                setError(e);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
        const intervalId = setInterval(fetchSessions, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const handleAccessSession = (chatRoomId, sessionId) => {
        setActiveChat({ chatRoomId, sessionId });
    };

    const handleCloseChat = () => {
        setActiveChat(null);
    };

    if (loading) {
        return <div className="admin-container"><p>활성 채팅 세션 로딩 중...</p></div>;
    }

    if (error) {
        return <div className="admin-container"><p>오류: {error.message}</p></div>;
    }

    if (activeChat) {
        return (
            <ActiveChatSessionChat
                sessionId={activeChat.sessionId}
                chatRoomId={activeChat.chatRoomId}
                onClose={handleCloseChat}
            />
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>활성 채팅 세션 목록</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>채팅방 ID</th>
                        <th>세션 ID</th>
                        <th>사용자</th>
                        <th>담당 상담원</th>
                        <th>시작 시간</th>
                        <th>상태</th>
                        <th>접속</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(sessions).length === 0 ? (
                        <tr>
                            <td colSpan="7">활성 채팅 세션이 없습니다.</td>
                        </tr>
                    ) : (
                        Object.entries(sessions).map(([chatRoomId, sessionIds]) => (
                            sessionIds.map((sessionId, index) => (
                                <tr key={`${chatRoomId}-${sessionId}`} className="admin-table-row">
                                    {index === 0 && <td rowSpan={sessionIds.length}>{chatRoomId}</td>}
                                    <td>{sessionId}</td>
                                    <td>N/A</td>
                                    <td>N/A</td>
                                    <td>N/A</td>
                                    <td>활성</td>
                                    <td>
                                        <button
                                            onClick={() => handleAccessSession(chatRoomId, sessionId)}
                                            className="admin-action-btn admin-modify-btn"
                                        >
                                            접속
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ActiveChatSessionsList;