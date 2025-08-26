
import { useState, Fragment } from "react";
import { getCustomerList } from "../../../api/adminApi";
import Modal from "../common/Modal";
import PaginationComponent from "../common/PaginationComponent";
import usePaginatedData from "../../../hooks/usePaginatedData";
import { CUSTOMER_ROLE_OPTIONS } from "../../../constants/roles";
import { AdminTable } from './AdminTable';
import { AdminControls } from './AdminControls';
import '../../../theme/admin.css';

const CustomerAccountListComponent = () => {
    const { 
        data: customerList,
        page,
        totalPages,
        loading,
        error,
        handlePageChange,
        handleFilterChange,
        handleSort,
        handleSearch,
        sortConfig,
        filters,
        search,
    } = usePaginatedData(getCustomerList, {
        filters: { role: '' },
        sortConfig: { key: 'id', direction: 'asc' },
        search: { query: '', type: 'id' },
    });

    const [modalState, setModalState] = useState({ show: false, message: "" });
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    const showModal = (message) => {
        setModalState({ show: true, message });
    };

    const closeModal = () => {
        setModalState({ ...modalState, show: false });
    };

    const handleRowClick = (customerId) => {
        setSelectedCustomerId(selectedCustomerId === customerId ? null : customerId);
    };

    const customerTableColumns = [
        { header: 'ID', key: 'id', sortable: true },
        { header: '이름', key: 'customName', sortable: true },
        {
            header: '가입일',
            key: 'createdAt',
            sortable: true,
            render: (item) => new Date(item.createdAt).toLocaleDateString()
        },
        { header: '역할', key: 'role', sortable: true },
    ];

    const searchOptions = [
        { value: "id", label: "ID" },
        { value: "customName", label: "이름" },
        { value: "phone", label: "전화번호" },
        { value: "nickname", label: "닉네임" },
    ];

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div className="error-message">오류 발생: {error.message}</div>;
    }

    return (
        <div className="admin-container">
            <Modal show={modalState.show} message={modalState.message} onClose={closeModal} />
            <div className="admin-header">
                <h2>고객 계정 목록</h2>
            </div>

            <AdminControls
                roleFilter={filters.role}
                setRoleFilter={(value) => handleFilterChange({ role: value })}
                searchQuery={search.query}
                setSearchQuery={(value) => handleSearch({ ...search, query: value })}
                searchType={search.type}
                setSearchType={(value) => handleSearch({ ...search, type: value })}
                handleSearch={(e) => { e.preventDefault(); handleSearch(search); }}
                roles={CUSTOMER_ROLE_OPTIONS}
                searchOptions={searchOptions}
            />

            <AdminTable
                data={customerList}
                columns={customerTableColumns}
                sortConfig={sortConfig}
                onSort={handleSort}
                emptyMessage="고객 계정이 없습니다."
                onRowClick={handleRowClick}
                selectedRowId={selectedCustomerId}
                renderExpandedContent={(customer) => (
                    <td colSpan={customerTableColumns.length}>
                        <div className="admin-content-box">
                            <p><strong>상세 정보:</strong></p>
                            <p>전화번호: {customer.phone}</p>
                            <p>닉네임: {customer.nickname}</p>
                            <p>이메일: {customer.email}</p>
                            <p>주소: {customer.address}</p>
                            <p>가입일: {new Date(customer.createdAt).toLocaleString()}</p>
                            <p>최근 로그인: {customer.lastLogin ? new Date(customer.lastLogin).toLocaleString() : 'N/A'}</p>
                            <p>탈퇴일: {customer.leftedAt ? new Date(customer.leftedAt).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div className="admin-actions">
                            <button className="admin-action-btn admin-modify-btn">수정</button>
                            {/* Add more action buttons here */}
                        </div>
                    </td>
                )}
            />

            <PaginationComponent
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default CustomerAccountListComponent;
