import { useEffect } from 'react';
import './Modal.css'; // CSS 파일 import

const Modal = ({ show, message, onClose, onConfirm, showCancelButton = false, autoCloseDelay = null }) => {

    useEffect(() => {
        if (show && autoCloseDelay) {
            const timer = setTimeout(() => {
                if (onConfirm) {
                    onConfirm();
                } else {
                    onClose();
                }
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [show, autoCloseDelay, onConfirm, onClose]);


    if (!show) {
        return null;
    }

    const isAutoClosing = autoCloseDelay !== null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <p>{message}</p>
                {!isAutoClosing && (
                    <div className="modal-buttons">
                        <button onClick={onConfirm} className="btn btn-primary">
                            확인
                        </button>
                        {showCancelButton && (
                            <button onClick={onClose} className="btn btn-secondary">
                                취소
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;