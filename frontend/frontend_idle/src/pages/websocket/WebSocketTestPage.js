import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WebSocketTestPage = () => {
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'), // 백엔드 웹소켓 엔드포인트
            debug: function (str) {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('Connected: ' + frame);
            client.subscribe('/topic/messages', (message) => {
                showMessage(JSON.parse(message.body));
            });
        };

        client.onStompError = (frame) => {
            console.log('Broker reported error: ' + frame.headers['message']);
            console.log('Additional details: ' + frame.body);
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, []);

    const showMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    const sendMessage = () => {
        if (messageInput && stompClient) {
            stompClient.publish({
                destination: '/app/chat',
                body: JSON.stringify({ 'sender': '', 'content': messageInput }),
            });
            setMessageInput('');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>WebSocket Chat Test</h1>
            <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'scroll', padding: '10px', marginBottom: '10px' }}>
                {messages.map((msg, index) => (
                    <p key={index}><strong>{msg.sender}</strong>: {msg.content}</p>
                ))}
            </div>
            <input
                type="text"
                id="message-input"
                placeholder="메시지를 입력하세요"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                }}
                style={{ width: 'calc(100% - 80px)', marginRight: '10px', padding: '8px' }}
            />
            <button onClick={sendMessage} style={{ padding: '8px 15px' }}>전송</button>
        </div>
    );
};

export default WebSocketTestPage;
