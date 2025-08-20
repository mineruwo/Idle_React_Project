
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

    const [roleFilter, setRoleFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('id'); // Default search type

    useEffect(() => {
        fetchCustomerList();
    }, [page, size, roleFilter, sortConfig, searchQuery, searchType]); // Add searchType and searchQuery to dependencies

    const fetchCustomerList = async () => {
        try {
            const params = {
                page,
                size,
                role: roleFilter,
                sort: `${sortConfig.key},${sortConfig.direction}`,
            };

            if (searchQuery) {
                params.searchType = searchType;
                params.searchQuery = searchQuery;
            }

            const response = await getCustomerList(params);
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

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0); // Reset to first page on new search
        fetchCustomerList();
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const roles = ['CARRIER', 'SHIPPER'];

    return (
        <div className="admin-container">
            <Modal show={showModal} message={modalMessage} onClose={closeModal} />
            <div className="admin-header">
                <h2>고객 계정 목록</h2>
            </div>

            <div className="admin-controls">
                <div className="admin-filter">
                    <label htmlFor="role-filter">역할:</label>
                    <select id="role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">모두</option>
                        {roles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                <form onSubmit={handleSearch} className="admin-search">
                    <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                        <option value="id">ID</option>
                        <option value="customName">이름</option>
                        <option value="contact">연락처</option> {/* Assuming 'contact' field exists in Customer entity */}
                    </select>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="검색..."
                    />
                    <button type="submit" className="admin-primary-btn">검색</button>
                </form>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort('id')} className={sortConfig.key === 'id' ? `sort-${sortConfig.direction}` : ''}>ID</th>
                        <th onClick={() => handleSort('customName')} className={sortConfig.key === 'customName' ? `sort-${sortConfig.direction}` : ''}>이름</th>
                        <th onClick={() => handleSort('createdAt')} className={sortConfig.key === 'createdAt' ? `sort-${sortConfig.direction}` : ''}>가입일</th>
                        <th onClick={() => handleSort('role')} className={sortConfig.key === 'role' ? `sort-${sortConfig.direction}` : ''}>역할</th>
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
