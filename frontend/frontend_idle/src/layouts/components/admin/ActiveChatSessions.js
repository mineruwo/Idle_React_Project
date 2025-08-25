import usePollingData from '../../../hooks/usePollingData';
import { API_ENDPOINTS } from '../../../constants/api';
import { POLLING_INTERVAL } from '../../../constants/app';

const fetchActiveChatSessions = async () => {
  const response = await fetch(API_ENDPOINTS.ADMIN_CHAT_SESSIONS);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  return response.json();
};

function ActiveChatSessions() {
  const { data: sessions, loading, error } = usePollingData(fetchActiveChatSessions, POLLING_INTERVAL, {});

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>오류 발생: {error.message}</div>;
  }

  return (
    <div>
      <h2>활성 채팅 세션</h2>
      {Object.keys(sessions).length === 0 ? (
        <p>활성 채팅 세션이 없습니다.</p>
      ) : (
        <ul>
          {Object.entries(sessions).map(([chatRoomId, sessionIds]) => (
            <li key={chatRoomId}>
              <strong>채팅방 ID: {chatRoomId}</strong>
              <ul>
                {sessionIds.length === 0 ? (
                  <li>이 방에는 세션이 없습니다.</li>
                ) : (
                  sessionIds.map((sessionId) => (
                    <li key={sessionId}>세션 ID: {sessionId}</li>
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
