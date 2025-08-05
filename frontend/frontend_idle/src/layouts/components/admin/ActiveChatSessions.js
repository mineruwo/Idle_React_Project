import React, { useState, useEffect } from 'react';

function ActiveChatSessions() {
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      console.log('Fetching active chat sessions...');
      try {
        // 백엔드 API 엔드포인트에 맞게 URL을 조정하세요.
        // 개발 환경에서는 프록시 설정이 되어있지 않다면 전체 URL을 사용해야 할 수 있습니다.
        const response = await fetch('/api/admin/chat-sessions'); 
        if (!response.ok) {
          // 서버 응답이 2xx가 아닐 경우
          const errorText = await response.text(); // 응답 본문을 텍스트로 읽음
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
    // 5초마다 새로고침 (선택 사항)
    const intervalId = setInterval(fetchSessions, 5000); 

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
  }, []);

  if (loading) {
    return <div>Loading active chat sessions...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Active Chat Sessions</h2>
      {Object.keys(sessions).length === 0 ? (
        <p>No active chat sessions found.</p>
      ) : (
        <ul>
          {Object.entries(sessions).map(([chatRoomId, sessionIds]) => (
            <li key={chatRoomId}>
              <strong>Chat Room ID: {chatRoomId}</strong>
              <ul>
                {sessionIds.length === 0 ? (
                  <li>No sessions in this room.</li>
                ) : (
                  sessionIds.map((sessionId) => (
                    <li key={sessionId}>Session ID: {sessionId}</li>
                  ))
                )}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ActiveChatSessions;
