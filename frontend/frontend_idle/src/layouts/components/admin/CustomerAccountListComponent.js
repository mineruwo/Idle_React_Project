
import React, { useState, Fragment, useEffect } from "react";
import { getCustomerList, getCustomerById, updateCustomer, deleteCustomer } from "../../../api/adminApi"; // Import new API functions
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
        fetchData, // Added fetchData
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

    const handleRowClick = (customer) => {
        setSelectedCustomerId(prevId => (prevId === customer.id ? null : customer.id));
    };

    const handleCustomerDeleted = (deletedCustomerId) => {
        fetchData(); // Re-fetch data to update the list
        setSelectedCustomerId(null); // Collapse the expanded row
        showModal(`고객 계정 (ID: ${deletedCustomerId})이(가) 성공적으로 삭제되었습니다.`);
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

    // Inline CustomerDetail component
    const CustomerDetail = ({ customerId, onCustomerDeleted }) => {
        const [customer, setCustomer] = useState(null);
        const [detailLoading, setDetailLoading] = useState(true);
        const [detailError, setDetailError] = useState(null);
        const [isEditing, setIsEditing] = useState(false);
        const [editData, setEditData] = useState(null);

        useEffect(() => {
            const fetchCustomerDetails = async () => {
                if (!customerId) return;
                try {
                    setDetailLoading(true);
                    const data = await getCustomerById(customerId);
                    setCustomer(data);
                    setEditData(data);
                } catch (err) {
                    setDetailError(err);
                    console.error(`Error fetching customer details for ID ${customerId}:`, err);
                } finally {
                    setDetailLoading(false);
                }
            };

            fetchCustomerDetails();
        }, [customerId]);

        const handleEditClick = () => {
            setIsEditing(true);
            setEditData({ ...customer });
        };

        const handleCancelClick = () => {
            setIsEditing(false);
            setEditData({ ...customer });
        };

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setEditData(prevData => ({
                ...prevData,
                [name]: value
            }));
        };

        const handleSaveClick = async () => {
            try {
                const updatedCustomer = await updateCustomer(customer.id, {
                    customName: editData.customName,
                    phone: editData.phone,
                    nickname: editData.nickname,
                    role: editData.role,
                });
                setCustomer(updatedCustomer);
                setIsEditing(false);
                showModal('고객 정보가 성공적으로 업데이트되었습니다.');
            } catch (err) {
                console.error('Error updating customer:', err);
                showModal('고객 정보 업데이트에 실패했습니다.');
            }
        };

        const handleDeleteClick = async () => {
            if (window.confirm('정말로 이 고객 계정을 삭제하시겠습니까?')) {
                try {
                    await deleteCustomer(customer.id);
                    showModal('고객 계정이 성공적으로 삭제되었습니다.');
                    if (onCustomerDeleted) {
                        onCustomerDeleted(customer.id);
                    }
                } catch (err) {
                    console.error('Error deleting customer:', err);
                    showModal('고객 계정 삭제에 실패했습니다.');
                }
            }
        };

        if (detailLoading) {
            return (
                <div className="admin-content-box">
                    <p>상세 정보 로딩 중...</p>
                </div>
            );
        }

        if (detailError) {
            return (
                <div className="admin-content-box">
                    <p>상세 정보를 불러오는데 실패했습니다: {detailError.message}</p>
                </div>
            );
        }

        if (!customer) {
            return (
                <div className="admin-content-box">
                    <p>해당 고객 정보를 찾을 수 없습니다.</p>
                </div>
            );
        }

        return (
            <div className="admin-content-box">
                {isEditing ? (
                    // Edit Form
                    <form className="admin-form-container">
                        <div className="admin-form-group">
                            <label htmlFor="id">ID:</label>
                            <input type="text" id="id" name="id" value={editData.id} disabled />
                        </div>
                        <div className="admin-form-group">
                            <label htmlFor="customName">이름:</label>
                            <input type="text" id="customName" name="customName" value={editData.customName} onChange={handleInputChange} />
                        </div>
                        <div className="admin-form-group">
                            <label htmlFor="phone">전화번호:</label>
                            <input type="text" id="phone" name="phone" value={editData.phone} onChange={handleInputChange} />
                        </div>
                        <div className="admin-form-group">
                            <label htmlFor="nickname">닉네임:</label>
                            <input type="text" id="nickname" name="nickname" value={editData.nickname} onChange={handleInputChange} />
                        </div>
                        <div className="admin-form-group">
                            <label htmlFor="role">역할:</label>
                            <select id="role" name="role" value={editData.role} onChange={handleInputChange}>
                                {CUSTOMER_ROLE_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label>가입일:</label>
                            <input type="text" value={new Date(editData.createdAt).toLocaleString()} disabled />
                        </div>
                        <div className="admin-form-group">
                            <label>탈퇴 여부:</label>
                            <input type="text" value={editData.isLefted ? 'Yes' : 'No'} disabled />
                        </div>
                        <div className="admin-actions">
                            <button type="button" onClick={handleSaveClick} className="admin-action-btn admin-modify-btn">
                                수정 완료
                            </button>
                            <button type="button" onClick={handleDeleteClick} className="admin-action-btn admin-delete-btn">
                                삭제
                            </button>
                            <button type="button" onClick={handleCancelClick} className="admin-action-btn admin-button-secondary">
                                취소
                            </button>
                        </div>
                    </form>
                ) : (
                    // View Table
                    <>
                        <table className="detail-table">
                            <tbody>
                                <tr>
                                    <td className="detail-label">ID</td>
                                    <td className="detail-value">{customer.id}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">이름</td>
                                    <td className="detail-value">{customer.customName}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">전화번호</td>
                                    <td className="detail-value">{customer.phone}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">닉네임</td>
                                    <td className="detail-value">{customer.nickname}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">역할</td>
                                    <td className="detail-value">{customer.role}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">가입일</td>
                                    <td className="detail-value">{new Date(customer.createdAt).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">탈퇴 여부</td>
                                    <td className="detail-value">{customer.isLefted ? 'Yes' : 'No'}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="admin-actions">
                            <button type="button" onClick={handleEditClick} className="admin-action-btn admin-modify-btn">
                                수정
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    };

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
                        <CustomerDetail customerId={customer.id} onCustomerDeleted={handleCustomerDeleted} />
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
