import { useState } from "react";
import { createCustomer } from "../../../api/adminApi";
import Modal from "../common/Modal";
import { CUSTOMER_ROLE_OPTIONS } from "../../../constants/roles";
import '../../../theme/admin.css';

const initialState = {
    id: '',
    passwordEnc: '',
    customName: '',
    phone: '',
    nickname: '',
    role: 'SHIPPER'
};

const CustomerAccountCreateComponent = () => {
    const [newCustomer, setNewCustomer] = useState(initialState);
    const [modalState, setModalState] = useState({ show: false, message: "" });

    const showModal = (message) => {
        setModalState({ show: true, message });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer({ ...newCustomer, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        for (const key in newCustomer) {
            if (!newCustomer[key]) {
                showModal("모든 필드를 입력해주세요.");
                return;
            }
        }

        try {
            await createCustomer(newCustomer);
            showModal("고객 계정이 성공적으로 생성되었습니다.");
            setNewCustomer(initialState);
        } catch (error) {
            console.error("Failed to create customer:", error);
            const errorMessage = error.response ? error.response.data : error.message;
            showModal(`고객 계정 생성에 실패했습니다: ${errorMessage}`);
        }
    };

    const closeModal = () => {
        setModalState({ ...modalState, show: false });
    };

    return (
        <div className="admin-container">
            <Modal show={modalState.show} message={modalState.message} onClose={closeModal} />
            <div className="admin-header">
                <h2>새 고객 계정 생성</h2>
            </div>
            <form>
                <div className="admin-form-group">
                    <label htmlFor="id">ID:</label>
                    <input type="text" id="id" name="id" value={newCustomer.id} onChange={handleChange} required />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="passwordEnc">비밀번호:</label>
                    <input type="password" id="passwordEnc" name="passwordEnc" value={newCustomer.passwordEnc} onChange={handleChange} required />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="customName">이름:</label>
                    <input type="text" id="customName" name="customName" value={newCustomer.customName} onChange={handleChange} required />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="phone">전화번호:</label>
                    <input type="tel" id="phone" name="phone" value={newCustomer.phone} onChange={handleChange} required />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="nickname">닉네임:</label>
                    <input type="text" id="nickname" name="nickname" value={newCustomer.nickname} onChange={handleChange} required />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="role">역할:</label>
                    <select id="role" name="role" value={newCustomer.role} onChange={handleChange}>
                        {CUSTOMER_ROLE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="admin-primary-btn">생성</button>
            </form>
        </div>
    );
};

export default CustomerAccountCreateComponent;