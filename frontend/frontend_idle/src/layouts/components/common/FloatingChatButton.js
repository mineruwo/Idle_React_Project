import React, { useState } from 'react';
import WebSocketTestModal from '../modal/WebSocketTestModal';

const FloatingChatButton = () => {
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return (
        <>
            {!isModalOpen && (
                <button
                    onClick={openModal}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#007bff',
                        color: 'white',
                        fontSize: '24px',
                        border: 'none',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 999,
                    }}
                >
                    💬
                </button>
            )}
            <WebSocketTestModal isOpen={isModalOpen} onClose={closeModal} />
        </>
    );
};

export default FloatingChatButton;
