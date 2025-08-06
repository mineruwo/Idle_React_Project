import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useSelector } from 'react-redux';

import { apiConfig } from '../../../config/apiConfig';
import './ModalChatSession.css'; // CSS 파일 import

const ModalChatSession = ({ isOpen, onClose }) => {
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const bottomRef = useRef(null); 
    const [chatRoomId, setChatRoomId] = useState(null);

    const reduxUserInfo = useSelector((state) => state.adminLogin?.userInfo);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (chatRoomId === null) {
                let storedChatRoomId = sessionStorage.getItem('chatRoomId');
                if (!storedChatRoomId) {
                    storedChatRoomId = `room_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
                    sessionStorage.setItem('chatRoomId', storedChatRoomId);
                }
                setChatRoomId(storedChatRoomId);
            }

            if (currentUser === null) {
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
        if (isOpen && currentUser && chatRoomId) { 
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
                client.subscribe(`/topic/messages/${chatRoomId}`, (message) => {
                    showMessage(JSON.parse(message.body));
                });
            };

            client.onStompError = (frame) => {
                console.log('Broker reported error: ' + frame.headers['message']);
                console.log('Additional details: ' + frame.body);
            };

            client.connectHeaders = { 'chatRoomId': chatRoomId }; 
            client.activate();
            setStompClient(client);

            return () => {
                if (client) {
                    client.deactivate();
                }
            };
        }
    }, [isOpen, currentUser, chatRoomId]);

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
        if (bottomRef.current) {
            bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!isOpen) {
            setMessages([]);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-chat-session">
            <div className="modal-chat-header">
                <h5>WebSocket Chat</h5>
                <button onClick={onClose} className="close-button">&times;</button>
            </div>
            <div ref={bottomRef} className="message-container">
                {messages.map((msg, index) => {
                    const isMe = msg.sender === currentUser;
                    return (
                        <div key={index} className={`message-row ${isMe ? 'sent' : 'received'}`}>
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
            <div className="input-area">
                <input
                    type="text"
                    placeholder="메시지를 입력하세요"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>전송</button>
            </div>
        </div>
    );
};

export default ModalChatSession;