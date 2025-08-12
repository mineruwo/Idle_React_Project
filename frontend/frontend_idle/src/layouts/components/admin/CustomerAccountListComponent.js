import { useState, useEffect, Fragment } from "react";
import { getCustomerList } from "../../../api/adminApi";
import Modal from "../common/Modal";
import PaginationComponent from "../common/PaginationComponent";
import './AdminAccountListComponent.css'; // Reuse the same CSS for consistency

const CustomerAccountListComponent = () => {
    const [customerList, setCustomerList] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
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
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error("Failed to fetch customer list:", error);
            setModalMessage("고객 목록을 불러오는데 실패했습니다: " + (error.response ? error.response.data : error.message));
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

    const handleRowClick = (customerId) => {
        setSelectedCustomerId(selectedCustomerId === customerId ? null : customerId);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="admin-account-list-container">
            <Modal show={showModal} message={modalMessage} onClose={closeModal} />
            <h2>고객 계정 목록</h2>

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
                        <th>이름</th>
                        <th>가입일</th>
                        <th>역할</th>
                    </tr>
                </thead>
                <tbody>
                    {customerList.length > 0 ? (
                        customerList.map((customer) => (
                            <Fragment key={customer.id}>
                                <tr onClick={() => handleRowClick(customer.id)} style={{ cursor: 'pointer' }}>
                                    <td>{customer.id}</td>
                                    <td>{customer.customName}</td>
                                    <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                    <td>{customer.role}</td>
                                </tr>
                                {selectedCustomerId === customer.id && (
                                    <tr>
                                        <td colSpan="4">
                                            {/* 여기에 사용자의 상세 정보 및 수정 폼을 추가하세요. */}
                                            <div>
                                                <p><strong>상세 정보:</strong></p>
                                                <p>여기에 상세 정보가 표시됩니다.</p>
                                                <button>수정</button>
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