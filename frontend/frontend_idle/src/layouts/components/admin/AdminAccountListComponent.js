import React, { useState } from "react";
import { getAdminList } from "../../../api/adminApi";
import Modal from "../common/Modal";
import PaginationComponent from "../common/PaginationComponent";
import usePaginatedData from "../../../hooks/usePaginatedData";
import { ROLE_OPTIONS } from "../../../constants/roles";
import { AdminTable } from "./AdminTable";
import { AdminControls } from "./AdminControls";
import AdminAccountDetail from "./AdminAccountDetail"; // Import the new component
import '../../../theme/admin.css';

const AdminAccountListComponent = () => {
    const { 
        data: adminList,
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
        fetchData, // Add fetchData from usePaginatedData
    } = usePaginatedData(getAdminList, {
        filters: { role: '' },
        sortConfig: { key: 'idIndex', direction: 'asc' },
        search: { query: '', type: 'adminId' },
    });

    const [expandedRowId, setExpandedRowId] = useState(null);
    const [modalState, setModalState] = useState({ show: false, message: "" });

    const handleRowClick = (item) => {
        const rowId = item.idIndex;
        setExpandedRowId(prevId => (prevId === rowId ? null : rowId));
    };

    const handleAdminDeleted = (deletedAdminId) => {
        // After an admin is deleted, refresh the list
        fetchData(); // Re-fetch data to update the list
        setExpandedRowId(null); // Collapse the expanded row
        showModal(`관리자 계정 (ID: ${deletedAdminId})이(가) 성공적으로 삭제되었습니다.`);
    };

    const showModal = (message) => {
        setModalState({ show: true, message });
    };

    const closeModal = () => {
        setModalState({ ...modalState, show: false });
    };

    const adminTableColumns = [
        { header: 'ID', key: 'idIndex', sortable: true },
        { header: '아이디', key: 'adminId', sortable: true },
        { header: '이름', key: 'name', sortable: true },
        { header: '역할', key: 'role', sortable: true },
        { header: '사번', key: 'emplId', sortable: true },
        {
            header: '등록일',
            key: 'regDate',
            sortable: true,
            render: (item) => new Date(item.regDate).toLocaleDateString()
        },
        {
            header: '삭제여부',
            key: 'del',
            sortable: false,
            render: (item) => (item.del ? "Yes" : "No")
        },
    ];

    const renderExpandedContent = (item) => (
        <td colSpan={adminTableColumns.length}>
            <AdminAccountDetail adminId={item.idIndex} onAdminDeleted={handleAdminDeleted} />
        </td>
    );

    const searchOptions = [
        { value: "adminId", label: "아이디" },
        { value: "name", label: "이름" },
        { value: "emplId", label: "사번" },
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
                <h2>관리자 계정 목록</h2>
            </div>

            <AdminControls
                roleFilter={filters.role}
                setRoleFilter={(value) => handleFilterChange({ role: value })}
                searchQuery={search.query}
                setSearchQuery={(value) => handleSearch({ ...search, query: value })}
                searchType={search.type}
                setSearchType={(value) => handleSearch({ ...search, type: value })}
                handleSearch={(e) => { e.preventDefault(); handleSearch(search); }}
                roles={ROLE_OPTIONS}
                searchOptions={searchOptions}
            />

            <AdminTable
                data={adminList}
                columns={adminTableColumns}
                sortConfig={sortConfig}
                onSort={handleSort}
                emptyMessage="관리자 계정이 없습니다."
                onRowClick={handleRowClick}
                selectedRowId={expandedRowId}
                renderExpandedContent={renderExpandedContent}
            />

            <PaginationComponent
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default AdminAccountListComponent;