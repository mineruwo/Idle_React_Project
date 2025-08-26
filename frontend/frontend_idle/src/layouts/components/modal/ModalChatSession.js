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
    const createChatSessionOnBackend = async (chatRoomId, userInfo) => {
        const customerData = userInfo ? { id: userInfo.id, customName: userInfo.username } : null; // Adjust based on actual userInfo structure
        try {
            const response = await fetch(`${apiConfig.apiBaseUrl}/admin/chat-sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionStorage.getItem('accessToken') && { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }) // Conditionally add Authorization header
                },
                body: JSON.stringify({
                    chatRoomId: chatRoomId,
                    customer: customerData
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to create chat session on backend:', errorData);
                // Handle error, e.g., show a message to the user
            } else {
                const sessionData = await response.json();
                console.log('Chat session created on backend:', sessionData);
            }
        } catch (error) {
            console.error('Error creating chat session on backend:', error);
        }
    };

    const deleteChatSessionOnBackend = async (chatRoomIdToDelete) => {
        try {
            const response = await fetch(`${apiConfig.apiBaseUrl}/api/admin/chat-sessions/${chatRoomIdToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionStorage.getItem('accessToken') && { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` })
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to delete chat session on backend:', errorData);
            } else {
                console.log('Chat session deleted on backend:', chatRoomIdToDelete);
                sessionStorage.removeItem('chatRoomId'); // Clear chatRoomId from session storage
                sessionStorage.removeItem('chatSessionCreated'); // Clear the flag
                sessionStorage.removeItem('guestId'); // Clear guestId if it exists
            }
        } catch (error) {
            console.error('Error deleting chat session on backend:', error);
        }
    };

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (isOpen) {
            let currentChatRoomId = chatRoomId;
            if (currentChatRoomId === null) {
                let storedChatRoomId = sessionStorage.getItem('chatRoomId');
                if (!storedChatRoomId) {
                    storedChatRoomId = `room_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
                    sessionStorage.setItem('chatRoomId', storedChatRoomId);
                }
                currentChatRoomId = storedChatRoomId;
                setChatRoomId(currentChatRoomId);
            }

            let currentDeterminedUser = currentUser;
            if (currentDeterminedUser === null) {
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
                currentDeterminedUser = newCurrentUserIdentifier;
                setCurrentUser(currentDeterminedUser);
            }

            // Call backend to create chat session only if a new chatRoomId was just generated
            // and currentUser is determined.
            // This ensures the API call happens only once for a new session.
            console.log('ModalChatSession useEffect triggered. isOpen:', isOpen, 'chatRoomId:', currentChatRoomId, 'currentUser:', currentDeterminedUser, 'chatSessionCreated flag:', sessionStorage.getItem('chatSessionCreated'));
            if (currentChatRoomId && currentDeterminedUser && !sessionStorage.getItem('chatSessionCreated')) {
                console.log('Attempting to create chat session on backend...');
                createChatSessionOnBackend(currentChatRoomId, reduxUserInfo || JSON.parse(sessionStorage.getItem('userInfo')));
                sessionStorage.setItem('chatSessionCreated', 'true'); // Prevent multiple calls
            } else {
                console.log('Skipping chat session creation. Conditions: chatRoomId:', currentChatRoomId, 'currentUser:', currentDeterminedUser, 'chatSessionCreated flag:', sessionStorage.getItem('chatSessionCreated'));
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
                    // Call backend to delete chat session when WebSocket closes
                    if (chatRoomId) { // Ensure chatRoomId exists before attempting deletion
                        deleteChatSessionOnBackend(chatRoomId);
                    }
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