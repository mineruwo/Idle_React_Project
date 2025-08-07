import { useEffect, useState } from 'react';
import './ActiveChatSessionsList.css'; // CSS 파일 import

const ActiveChatSessionsList = ({ onSessionSelect }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch('/api/admin/chat-sessions');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // 데이터 형식을 배열로 변환
                const formattedSessions = Object.entries(data).flatMap(([chatRoomId, sessionIds]) => 
                    sessionIds.map(sessionId => ({ sessionId, chatRoomId }))
                );
                setSessions(formattedSessions);
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
        const intervalId = setInterval(fetchSessions, 5000);

        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return <div className="loading-message">로딩 중...</div>;
    }

    if (error) {
        return <div className="error-message">오류 발생: {error.message}</div>;
    }

    return (
        <div className="chat-list-container">
            <h2 className="chat-list-title">현재 활성화된 채팅 목록</h2>
            {sessions.length === 0 ? (
                <div className="chat-list-empty">
                    <p>현재 활성화된 채팅 세션이 없습니다.</p>
                </div>
            ) : (
                <table className="chat-list-table">
                    <thead>
                        <tr>
                            <th>세션 아이디</th>
                            <th>채팅방 아이디</th>
                            <th>접속된 유저 아이디</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map(({ sessionId, chatRoomId }) => (
                            <tr key={sessionId}>
                                <td>{sessionId}</td>
                                <td>{chatRoomId}</td>
                                <td>{/* 유저 아이디가 있다면 여기에 표시 */}</td>
                                <td>
                                    <button 
                                        className="chat-list-button"
                                        onClick={() => onSessionSelect(chatRoomId, sessionId)}
                                    >
                                        채팅 참여
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ActiveChatSessionsList;