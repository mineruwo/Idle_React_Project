import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useSelector } from 'react-redux';

import { apiConfig } from '../../../config/apiConfig';

const WebSocketTestModal = ({ isOpen, onClose }) => {
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const bottomRef = useRef(null); // 스크롤을 위한 새로운 ref
    const [chatRoomId, setChatRoomId] = useState(null); // 채팅방 ID 상태

    const reduxUserInfo = useSelector((state) => state.adminLogin?.userInfo);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (isOpen) {
            // Determine and set chatRoomId if not already set
            if (chatRoomId === null) { // Only set if chatRoomId is null
                let storedChatRoomId = sessionStorage.getItem('chatRoomId');
                if (!storedChatRoomId) {
                    storedChatRoomId = `room_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
                    sessionStorage.setItem('chatRoomId', storedChatRoomId);
                }
                setChatRoomId(storedChatRoomId);
            }

            // Determine and set currentUser if not already set
            if (currentUser === null) { // Only set if currentUser is null
                let determinedUser = reduxUserInfo;
                if (!determinedUser) {
                    const sessionUser = sessionStorage.getItem('userInfo');
                    if (sessionUser) {
                        determinedUser = JSON.parse(sessionUser);
                    }
                }
                let newCurrentUserIdentifier;
                if (determinedUser) {
                    newCurrentUserIdentifier = determinedUser.username;
                } else {
                    let guestId = sessionStorage.getItem('guestId');
                    if (!guestId) {
                        guestId = `Guest_${Math.floor(Math.random() * 10000)}`;
                        sessionStorage.setItem('guestId', guestId);
                    }
                    newCurrentUserIdentifier = guestId;
                }
                setCurrentUser(newCurrentUserIdentifier);
            }
        }
    }, [isOpen, reduxUserInfo, chatRoomId, currentUser]);

    useEffect(() => {
        if (isOpen && currentUser && chatRoomId) { // chatRoomId가 있을 때만 연결
            const client = new Client({
                webSocketFactory: () => new SockJS(apiConfig.webSocketUrl),
                debug: function (str) {
                    console.log(str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            client.onConnect = (frame) => {
                console.log('Connected: ' + frame);
                // 채팅방 ID에 따라 구독 경로 변경
                client.subscribe(`/topic/messages/${chatRoomId}`, (message) => {
                    showMessage(JSON.parse(message.body));
                });
            };

            client.onStompError = (frame) => {
                console.log('Broker reported error: ' + frame.headers['message']);
                console.log('Additional details: ' + frame.body);
            };

            client.connectHeaders = { 'chatRoomId': chatRoomId }; // 연결 헤더에 chatRoomId 추가
            client.activate();
            setStompClient(client);

            return () => {
                if (client) {
                    client.deactivate();
                }
            };
        }
    }, [isOpen, currentUser, chatRoomId]); // chatRoomId를 의존성 배열에 추가

    const showMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    const sendMessage = () => {
        if (messageInput && stompClient && currentUser && chatRoomId) {
            stompClient.publish({
                // 채팅방 ID에 따라 발행 경로 변경
                destination: `/app/chat/${chatRoomId}`,
                headers: { userId: currentUser },
                body: JSON.stringify({ sender: currentUser, content: messageInput, chatRoomId: chatRoomId }), // 메시지 본문에 chatRoomId 추가
            });
            setMessageInput('');
        }
    };

    // 메시지가 업데이트될 때마다 스크롤을 최하단으로 이동
    useEffect(() => {
        const scrollToBottom = () => {
            if (bottomRef.current) {
                console.log("Scrolling... current ref:", bottomRef.current);
                console.log("Scroll Height:", bottomRef.current.scrollHeight);
                console.log("Client Height:", bottomRef.current.clientHeight);
                bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
            } else {
                console.log("bottomRef.current is null (inside setTimeout)");
            }
        };
        // DOM 업데이트 후 스크롤이 실행되도록 지연
        setTimeout(scrollToBottom, 0);
    }, [messages]);

    useEffect(() => {
        if (!isOpen) {
            // 모달이 닫힐 때 메시지 초기화
            setMessages([]);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const modalStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '350px',
        height: '500px',
        backgroundColor: 'white',
        zIndex: 1000,
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
        alignItems: 'flex-start', // 모든 메시지를 기본적으로 왼쪽 정렬
    };

    const messageBubbleStyle = (isMe, content) => ({
        backgroundColor: isMe ? '#007bff' : '#e9e9eb',
        color: isMe ? 'white' : 'black',
        borderRadius: '20px',
        padding: '8px 15px',
        maxWidth: content.length < 11 ? 'fit-content' : '70%', // 11글자 미만이면 내용에 맞게, 이상이면 70%
        marginBottom: '10px',
        textAlign: 'left',
        wordBreak: 'keep-all', // 한글 단어 단위 줄바꿈
        overflowWrap: 'break-word', // fallback
    });

    const inputAreaStyle = {
        display: 'flex',
        padding: '10px',
        borderTop: '1px solid #ccc',
    };

    return (
        <div style={modalStyle}>
            <div style={headerStyle}>
                <h5 style={{ margin: 0 }}>WebSocket Chat</h5>
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

export default WebSocketTestModal;
