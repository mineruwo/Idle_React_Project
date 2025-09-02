import { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { apiConfig } from '../../../config/apiConfig';
import { fetchChatSessionDetails, fetchCustomerRecentInquiries } from '../../../api/adminApi';


const ActiveChatSessionChat = ({ sessionId, chatRoomId, onClose }) => {
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const bottomRef = useRef(null);
    const currentUser = "Admin"; 

    const [sessionDetails, setSessionDetails] = useState(null);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [recentInquiries, setRecentInquiries] = useState([]);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    // Fetch session details and customer info
    useEffect(() => {
        if (!chatRoomId) return;

        const getDetails = async () => {
            try {
                const details = await fetchChatSessionDetails(chatRoomId);
                setSessionDetails(details);
                setCustomerInfo(details.customer);

                if (details.customer && details.customer.id && details.customer.id !== "unknown") {
                    const inquiries = await fetchCustomerRecentInquiries(details.customer.id);
                    setRecentInquiries(inquiries);
                } else {
                    console.log("Skipping recent inquiries fetch for unknown customer.");
                    setRecentInquiries([]); // Ensure it's empty for unknown customers
                }
            } catch (error) {
                console.error("Error fetching chat session details or customer info:", error);
            }
        };
        getDetails();
    }, [chatRoomId]);

    // Calculate elapsed time
    useEffect(() => {
        if (sessionDetails && sessionDetails.createdAt) {
            const startTime = new Date(sessionDetails.createdAt).getTime();
            const timer = setInterval(() => {
                const now = new Date().getTime();
                const diff = now - startTime;

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setElapsedTime(
                    `${String(hours).padStart(2, '0')}:
                     ${String(minutes).padStart(2, '0')}:
                     ${String(seconds).padStart(2, '0')}`
                );
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [sessionDetails]);

    // STOMP client logic
    useEffect(() => {
        if (!sessionId || !chatRoomId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(apiConfig.webSocketUrl),
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('Connected to chat session: ' + frame);
            client.subscribe(`/topic/messages/${chatRoomId}`, (message) => {
                showMessage(JSON.parse(message.body));
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
                console.log('Disconnected from chat session.');
            }
        };
    }, [sessionId, chatRoomId]);

    const showMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    const sendMessage = () => {
        if (messageInput && stompClient && currentUser && chatRoomId) {
            stompClient.publish({
                destination: `/app/chat/${chatRoomId}`,
                headers: { userId: currentUser },
                body: JSON.stringify({ sender: currentUser, content: messageInput, chatRoomId: chatRoomId }),
            });
            setMessageInput('');
        }
    };

    useEffect(() => {
        const scrollToBottom = () => {
            if (bottomRef.current) {
                bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
            }
        };
        setTimeout(scrollToBottom, 0);
    }, [messages]);

    return (
        <div className="chat-page-container">
            <div className="chat-session-container">
                <div className="chat-session-header">
                    <h5>Chat Room: {chatRoomId}</h5>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div ref={bottomRef} className="chat-session-messages">
                    {messages.map((msg, index) => {
                        const isMe = msg.sender === currentUser;
                        return (
                            <div key={index} className={`message-item ${isMe ? 'sent' : 'received'}`}>
                                <div className="message-sender">
                                    {msg.sender}
                                </div>
                                <div className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="chat-session-input-area">
                    <input
                        type="text"
                        placeholder="메시지를 입력하세요"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="chat-session-input"
                    />
                    <button onClick={sendMessage} className="chat-session-send-button">전송</button>
                </div>
            </div>

            <div className="chat-info-panel">
                <div className="info-section">
                    <h4>고객 정보</h4>
                    {customerInfo ? (
                        <>
                            <p>이름: {customerInfo.name}</p>
                            <p>연락처: {customerInfo.contact}</p>
                            <p>이메일: {customerInfo.email}</p>
                        </>
                    ) : (
                        <p>고객 정보 없음</p>
                    )}
                </div>

                <div className="info-section">
                    <h4>최근 문의 내역</h4>
                    {recentInquiries.length > 0 ? (
                        <table className="info-table">
                            <thead>
                                <tr>
                                    <th>제목</th>
                                    <th>날짜</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentInquiries.slice(0, 3).map(inquiry => (
                                    <tr key={inquiry.id}>
                                        <td>{inquiry.title}</td>
                                        <td>{inquiry.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>최근 문의 내역 없음</p>
                    )}
                </div>

                <div className="info-section">
                    <h4>채팅 세션 유지 시간</h4>
                    {sessionDetails && sessionDetails.createdAt ? (
                        <>
                            <p>시작 시간: {new Date(sessionDetails.createdAt).toLocaleString()}</p>
                            <p>경과 시간: {elapsedTime}</p>
                        </>
                    ) : (
                        <p>세션 시작 시간 정보 없음</p>
                    )}
                </div>

                <div className="info-section">
                    <h4>현재 채팅 참여 인원</h4>
                    {sessionDetails && sessionDetails.participants && sessionDetails.participants.length > 0 ? (
                        <table className="info-table">
                            <thead>
                                <tr>
                                    <th>아이디</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessionDetails.participants.map((participant, index) => (
                                    <tr key={index}>
                                        <td>{participant.id}</td>
                                        <td>{participant.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>참여 인원 정보 없음</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveChatSessionChat;