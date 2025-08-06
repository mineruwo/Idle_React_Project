import { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { apiConfig } from '../../../config/apiConfig';
import './ActiveChatSessionChat.css'; // CSS 파일 import

const ActiveChatSessionChat = ({ sessionId, chatRoomId, onClose }) => {
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const bottomRef = useRef(null);
    const currentUser = "Admin"; 

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
    );
};

export default ActiveChatSessionChat;