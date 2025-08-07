import { useState, useEffect } from "react";
import { getAdminList } from "../../../api/adminApi";
import Modal from "../common/Modal";
import PaginationComponent from "../common/PaginationComponent"; // PaginationComponent 임포트
import './AdminAccountListComponent.css';

const AdminAccountListComponent = () => {
    const [adminList, setAdminList] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
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
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error("Failed to fetch admin list:", error);
            setModalMessage("관리자 목록을 불러오는데 실패했습니다: " + (error.response ? error.response.data : error.message));
            setShowModal(true);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleSizeChange = (e) => {
        setSize(parseInt(e.target.value));
        setPage(0); // size 변경 시 첫 페이지로 이동
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="admin-account-list-container">
            <Modal show={showModal} message={modalMessage} onClose={closeModal} />
            <h2>관리자 계정 목록</h2>

            <div className="size-selector">
                <label htmlFor="pageSize">페이지 당 항목 수:</label>
                <select id="pageSize" value={size} onChange={handleSizeChange}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
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
                            <tr key={admin.idIndex}>
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