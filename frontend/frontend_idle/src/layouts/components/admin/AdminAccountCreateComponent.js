import { useState } from "react";
import Modal from "../common/Modal";
import { createAdmin } from "../../../api/adminApi";
import './AdminAccountCreateComponent.css';

const AdminAccountCreateComponent = () => {
    const [adminInfo, setAdminInfo] = useState({
        id: "",
        password: "",
        name: "",
        employeeNumber: "",
        role: "DEV_ADMIN", // 기본값 설정
    });

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const roleOptions = [
        { value: "DEV_ADMIN", label: "개발 관리자" },
        { value: "ADMIN", label: "관리자" },
        { value: "MANAGER_COUNSELING", label: "상담 매니저" },
        { value: "COUNSELER", label: "상담원" },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdminInfo({ ...adminInfo, [name]: value });
    };

    const handleCreate = async () => {
        // 간단한 유효성 검사
        for (const key in adminInfo) {
            if (!adminInfo[key]) {
                setModalMessage("모든 필드를 입력해주세요.");
                setShowModal(true);
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

            setModalMessage("관리자 계정이 성공적으로 생성되었습니다.");
            setShowModal(true);
            // 성공 후 입력 필드 초기화
            setAdminInfo({
                id: "",
                password: "",
                name: "",
                employeeNumber: "",
                role: "DEV_ADMIN",
            });
        } catch (error) {
            console.error("Admin creation failed:", error);
            setModalMessage("계정 생성에 실패했습니다: " + (error.response ? error.response.data : error.message));
            setShowModal(true);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="create-admin-form-card">
            <Modal show={showModal} message={modalMessage} onClose={closeModal} />
            <h2>관리자 계정 생성</h2>
            <form>
                <div className="form-group">
                    <label htmlFor="id">아이디</label>
                    <input type="text" id="id" name="id" value={adminInfo.id} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">비밀번호</label>
                    <input type="text" id="password" name="password" value={adminInfo.password} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="name">이름</label>
                    <input type="text" id="name" name="name" value={adminInfo.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="employeeNumber">사번</label>
                    <input type="text" id="employeeNumber" name="employeeNumber" value={adminInfo.employeeNumber} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="role">역할</label>
                    <select id="role" name="role" value={adminInfo.role} onChange={handleChange}>
                        {roleOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="button" className="btn btn-primary w-100" onClick={handleCreate}>
                    생성
                </button>
            </form>
        </div>
    );
};

export default AdminAccountCreateComponent;