import { useState } from "react";
import Modal from "../common/Modal";
import { createAdmin } from "../../../api/adminApi";
import { ROLE_OPTIONS } from "../../../constants/roles";
import AdminFormLayout from "./AdminFormLayout";
import AdminButton from "../common/AdminButton"; // Import AdminButton
import '../../../theme/admin.css';

const initialState = {
    id: "",
    password: "",
    name: "",
    employeeNumber: "",
    role: "DEV_ADMIN",
};

const AdminAccountCreateComponent = () => {
    const [adminInfo, setAdminInfo] = useState(initialState);
    const [modalState, setModalState] = useState({ show: false, message: "" });

    const showModal = (message) => {
        setModalState({ show: true, message });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdminInfo({ ...adminInfo, [name]: value });
    };

    const handleCreate = async () => {
        for (const key in adminInfo) {
            if (!adminInfo[key]) {
                showModal("모든 필드를 입력해주세요.");
                return;
            }
        }

        const adminDataForApi = {
            adminId: adminInfo.id,
            password: adminInfo.password,
            name: adminInfo.name,
            emplId: adminInfo.employeeNumber,
            role: adminInfo.role,
        };

        try {
            const result = await createAdmin(adminDataForApi);
            console.log("Admin creation successful:", result);

            showModal("관리자 계정이 성공적으로 생성되었습니다.");
            setAdminInfo(initialState);
        } catch (error) {
            console.error("Admin creation failed:", error);
            const errorMessage = error.response ? error.response.data : error.message;
            showModal(`계정 생성에 실패했습니다: ${errorMessage}`);
        }
    };

    const closeModal = () => {
        setModalState({ ...modalState, show: false });
    };

    return (
        <AdminFormLayout title="관리자 계정 생성"> 
            <Modal show={modalState.show} message={modalState.message} onClose={closeModal} />
            <form>
                <div className="admin-form-group"> 
                    <label htmlFor="id" className="admin-label">아이디</label>
                    <input type="text" id="id" name="id" value={adminInfo.id} onChange={handleChange} className="admin-input" />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="password" className="admin-label">비밀번호</label>
                    <input type="password" id="password" name="password" value={adminInfo.password} onChange={handleChange} className="admin-input" />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="name" className="admin-label">이름</label>
                    <input type="text" id="name" name="name" value={adminInfo.name} onChange={handleChange} className="admin-input" />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="employeeNumber" className="admin-label">사번</label>
                    <input type="text" id="employeeNumber" name="employeeNumber" value={adminInfo.employeeNumber} onChange={handleChange} className="admin-input" />
                </div>
                <div className="admin-form-group">
                    <label htmlFor="role" className="admin-label">역할</label>
                    <select id="role" name="role" value={adminInfo.role} onChange={handleChange} className="admin-select">
                        {ROLE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <AdminButton type="button" onClick={handleCreate} variant="primary"> {/* Changed to AdminButton */}
                    생성
                </AdminButton>
            </form>
        </AdminFormLayout>
    );
};

export default AdminAccountCreateComponent;
