
import { useState } from "react";
import { createCustomer } from "../../../api/adminApi";
import Modal from "../common/Modal";
import '../../../theme/admin.css'; // 공통 CSS 임포트

const CustomerCreateComponent = () => {
    const [newCustomer, setNewCustomer] = useState({
        id: '',
        passwordEnc: '',
        customName: '',
        phone: '',
        nickname: '',
        role: 'SHIPPER' // Default role
    });
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const handleCreateFormChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer({ ...newCustomer, [name]: value });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCustomer(newCustomer);
            setModalMessage("고객 계정이 성공적으로 생성되었습니다.");
            setShowModal(true);
            setNewCustomer({
                id: '',
                passwordEnc: '',
                customName: '',
                phone: '',
                nickname: '',
                role: 'SHIPPER'
            });
        } catch (error) {
            console.error("Failed to create customer:", error);
            setModalMessage("고객 계정 생성에 실패했습니다: " + (error.response ? error.response.data : error.message));
            setShowModal(true);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="admin-container">
            <Modal show={showModal} message={modalMessage} onClose={closeModal} />
            <div className="admin-header">
                <h2>새 고객 계정 생성</h2>
            </div>
            <form onSubmit={handleCreateSubmit} className="admin-form-container">
                <div className="admin-form-group">
                    <label htmlFor="id">ID:</label>
                    <input type="text" id="id" name="id" value={newCustomer.id} onChange={handleCreateFormChange} required />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="passwordEnc">비밀번호:</label>
                    <input type="password" id="passwordEnc" name="passwordEnc" value={newCustomer.passwordEnc} onChange={handleCreateFormChange} required />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="customName">이름:</label>
                    <input type="text" id="customName" name="customName" value={newCustomer.customName} onChange={handleCreateFormChange} required />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="phone">전화번호:</label>
                    <input type="tel" id="phone" name="phone" value={newCustomer.phone} onChange={handleCreateFormChange} required />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="nickname">닉네임:</label>
                    <input type="text" id="nickname" name="nickname" value={newCustomer.nickname} onChange={handleCreateFormChange} required />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="role">역할:</label>
                    <select id="role" name="role" value={newCustomer.role} onChange={handleCreateFormChange}>
                        <option value="SHIPPER">Shipper</option>
                        <option value="CARRIER">Carrier</option>
                    </select>
                </div>
                <button type="submit" className="admin-primary-btn">생성</button>
            </form>
        </div>
    );
};

export default CustomerCreateComponent;
