import React, { useEffect, useState } from 'react';
import { apiConfig } from '../../../config/apiConfig';

const ActiveChatSessionsList = () => {
    const [sessions, setSessions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSessions = async () => {
        try {
            const response = await fetch(`${apiConfig.apiBaseUrl}/admin/chat-sessions`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, message: ${await response.text()}`);
            }
            const data = await response.json();
            setSessions(data);
        } catch (error) {
            console.error("Error fetching active chat sessions:", error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 5000); // 5초마다 새로고침
        return () => clearInterval(interval);
    }, []);

    const handleConnectClick = (sessionId, chatRoomId) => {
        console.log(`Connecting to session: ${sessionId}, chatRoomId: ${chatRoomId}`);
        // 여기에 실제 채팅방 접속 로직을 추가합니다.
        // 예: 채팅 모달 열기, 특정 채팅방으로 라우팅 등
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>오류 발생: {error.message}</div>;
    }

    const sessionEntries = Object.entries(sessions);

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>현재 활성화된 채팅 목록</h2>
            {sessionEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em', color: '#555' }}>
                    현재 활성화된 채팅방이 없습니다.
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ padding: '12px 15px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>세션 아이디</th>
                            <th style={{ padding: '12px 15px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>채팅방 아이디</th>
                            <th style={{ padding: '12px 15px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>접속된 유저 아이디</th>
                            <th style={{ padding: '12px 15px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessionEntries.map(([sessionId, userIds]) => (
                            <tr key={sessionId} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px 15px', textAlign: 'left' }}>{sessionId}</td>
                                <td style={{ padding: '10px 15px', textAlign: 'left' }}>
                                    {/* chatRoomId는 userIds의 첫 번째 요소에서 추출하거나, 백엔드에서 별도로 제공해야 합니다.
                                        현재 백엔드 응답 형식 (Map<String, Set<String>>)으로는 chatRoomId를 직접 알 수 없습니다.
                                        일단 sessionId를 chatRoomId로 가정하고 진행합니다. 실제 백엔드 응답에 따라 수정 필요.
                                    */}
                                    {sessionId}
                                </td>
                                <td style={{ padding: '10px 15px', textAlign: 'left' }}>
                                    {userIds.length > 2
                                        ? `${Array.from(userIds).slice(0, 2).join(', ')} ...`
                                        : Array.from(userIds).join(', ')}
                                </td>
                                <td style={{ padding: '10px 15px', textAlign: 'left' }}>
                                    <button
                                        onClick={() => handleConnectClick(sessionId, sessionId)} // chatRoomId도 sessionId로 가정
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '5px',
                                            border: 'none',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        접속
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
