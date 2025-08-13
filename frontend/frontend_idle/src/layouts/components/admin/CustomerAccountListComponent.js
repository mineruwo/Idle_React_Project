
import { useState, useEffect, Fragment } from "react";
import { getCustomerList } from "../../../api/adminApi";
import Modal from "../common/Modal";
import PaginationComponent from "../common/PaginationComponent";
import '../../../theme/admin.css'; // 공통 CSS 임포트

const CustomerAccountListComponent = () => {
    const [customerList, setCustomerList] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    useEffect(() => {
        fetchCustomerList();
    }, [page, size]);

    const fetchCustomerList = async () => {
        try {
            const response = await getCustomerList(page, size);
            setCustomerList(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Failed to fetch customer list:", error);
            setModalMessage("고객 목록을 불러오는데 실패했습니다: " + (error.response ? error.response.data : error.message));
            setShowModal(true);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleRowClick = (customerId) => {
        setSelectedCustomerId(selectedCustomerId === customerId ? null : customerId);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="admin-container">
            <Modal show={showModal} message={modalMessage} onClose={closeModal} />
            <div className="admin-header">
                <h2>고객 계정 목록</h2>
                {/* <Link to="/admin/customer-accounts/create" className="admin-primary-btn">새 고객 생성</Link> */}
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>이름</th>
                        <th>가입일</th>
                        <th>역할</th>
                    </tr>
                </thead>
                <tbody>
                    {customerList.length > 0 ? (
                        customerList.map((customer) => (
                            <Fragment key={customer.id}>
                                <tr className="admin-table-row" onClick={() => handleRowClick(customer.id)}>
                                    <td>{customer.id}</td>
                                    <td>{customer.customName}</td>
                                    <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                    <td>{customer.role}</td>
                                </tr>
                                {selectedCustomerId === customer.id && (
                                    <tr className="admin-content-row">
                                        <td colSpan="4">
                                            <div className="admin-content-box">
                                                <p><strong>상세 정보:</strong></p>
                                                <p>여기에 상세 정보가 표시됩니다.</p>
                                            </div>
                                            <div className="admin-actions">
                                                <button className="admin-action-btn admin-modify-btn">수정</button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">고객 계정이 없습니다.</td>
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

export default CustomerAccountListComponent;
