import { useState } from 'react';
import ModalChatSession from '../modal/ModalChatSession';
import './FloatingChatButton.css'; // CSS 파일 import

const FloatingChatButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <>
            <button className="floating-chat-button" onClick={toggleModal}>
                💬
            </button>
            <ModalChatSession isOpen={isModalOpen} onClose={toggleModal} />
        </>
    );
};

export default FloatingChatButton;
