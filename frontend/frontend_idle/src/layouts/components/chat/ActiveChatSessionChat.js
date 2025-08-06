import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { apiConfig } from '../../../config/apiConfig';

const ActiveChatSessionChat = ({ sessionId, chatRoomId, onClose }) => {
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const bottomRef = useRef(null);
    const currentUser = "Admin"; // 관리자 페이지에서 접속하므로 Admin으로 고정하거나, 실제 관리자 ID를 가져와야 합니다.

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
            // 관리자 접속 시 해당 세션에 메시지를 보낼 수 있도록 publish
            client.publish({
                destination: `/app/chat/${chatRoomId}`,
                headers: { userId: currentUser },
                body: JSON.stringify({ sender: currentUser, content: `${currentUser}님이 채팅방에 접속했습니다.`, chatRoomId: chatRoomId }),
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

    const modalStyle = {
        marginTop: '20px', // 리스트 아래에 공간을 줍니다.
        width: '100%', // 부모 요소의 너비를 꽉 채우도록 설정
        height: '500px', // 높이는 고정
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
    };

    const headerStyle = {
        padding: '10px',
        borderBottom: '1px solid #ccc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    const messageContainerStyle = {
        flexGrow: 1,
        overflowY: 'auto',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    };

    const messageBubbleStyle = (isMe, content) => ({
        backgroundColor: isMe ? '#007bff' : '#e9e9eb',
        color: isMe ? 'white' : 'black',
        borderRadius: '20px',
        padding: '8px 15px',
        maxWidth: content.length < 11 ? 'fit-content' : '70%',
        marginBottom: '10px',
        textAlign: 'left',
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
    });

    const inputAreaStyle = {
        display: 'flex',
        padding: '10px',
        borderTop: '1px solid #ccc',
    };

    return (
        <div style={modalStyle}>
            <div style={headerStyle}>
                <h5 style={{ margin: 0 }}>Chat Room: {chatRoomId}</h5>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <div ref={bottomRef} style={messageContainerStyle}>
                {messages.map((msg, index) => {
                    const isMe = msg.sender === currentUser;
                    const messageRowStyle = {
                        display: 'flex',
                        flexDirection: 'column',
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                    };

                    return (
                        <div id={`message-row-${index}`} key={index} style={messageRowStyle}>
                            <div id={`message-sender-${index}`} style={{ fontSize: '0.8rem', color: '#888', marginBottom: '2px' }}>
                                {msg.sender}
                            </div>
                            <div id={`message-bubble-${index}`} style={messageBubbleStyle(isMe, msg.content)}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={inputAreaStyle}>
                <input
                    type="text"
                    placeholder="메시지를 입력하세요"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    style={{ flexGrow: 1, border: '1px solid #ccc', borderRadius: '20px', padding: '8px 15px', marginRight: '10px' }}
                />
                <button onClick={sendMessage} style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>전송</button>
            </div>
        </div>
    );
};

export default ActiveChatSessionChat;