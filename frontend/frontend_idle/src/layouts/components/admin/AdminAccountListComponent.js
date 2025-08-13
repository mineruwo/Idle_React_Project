
import { useState, useEffect } from "react";
import { getAdminList } from "../../../api/adminApi";
import Modal from "../common/Modal";
import PaginationComponent from "../common/PaginationComponent";
import '../../../theme/admin.css'; // 공통 CSS 임포트

const AdminAccountListComponent = () => {
    const [adminList, setAdminList] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    useEffect(() => {
        fetchAdminList();
    }, [page, size]);

    const fetchAdminList = async () => {
        try {
            const response = await getAdminList(page, size);
            setAdminList(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Failed to fetch admin list:", error);
            setModalMessage("관리자 목록을 불러오는데 실패했습니다: " + (error.response ? error.response.data : error.message));
            setShowModal(true);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="admin-container">
            <Modal show={showModal} message={modalMessage} onClose={closeModal} />
            <div className="admin-header">
                <h2>관리자 계정 목록</h2>
                {/* You can add a create button here if needed, for example: */}
                {/* <Link to="/admin/admin-accounts/create" className="admin-primary-btn">새 관리자 생성</Link> */}
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>아이디</th>
                        <th>이름</th>
                        <th>역할</th>
                        <th>사번</th>
                        <th>등록일</th>
                        <th>삭제여부</th>
                    </tr>
                </thead>
                <tbody>
                    {adminList.length > 0 ? (
                        adminList.map((admin) => (
                            <tr key={admin.idIndex} className="admin-table-row">
                                <td>{admin.idIndex}</td>
                                <td>{admin.adminId}</td>
                                <td>{admin.name}</td>
                                <td>{admin.role}</td>
                                <td>{admin.emplId}</td>
                                <td>{new Date(admin.regDate).toLocaleDateString()}</td>
                                <td>{admin.del ? "Yes" : "No"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">관리자 계정이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <PaginationComponent
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default AdminAccountListComponent;
