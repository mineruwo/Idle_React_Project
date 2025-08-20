
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

    const [roleFilter, setRoleFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'idIndex', direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('adminId');

    useEffect(() => {
        fetchAdminList();
    }, [page, size, roleFilter, sortConfig]);

    const fetchAdminList = async () => {
        try {
            const params = {
                page,
                size,
                role: roleFilter,
                sort: `${sortConfig.key},${sortConfig.direction}`,
            };

            if (searchQuery) { // Only add search parameters if searchQuery is not empty
                params.searchType = searchType;
                params.searchQuery = searchQuery;
            }
            const response = await getAdminList(params);
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
        fetchAdminList();
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const roles = ['ALL_PERMISSION', 'DEV_ADMIN', 'ADMIN', 'MANAGER_COUNSELING', 'COUNSELOR'];

    return (
        <div className="admin-container">
            <Modal show={showModal} message={modalMessage} onClose={closeModal} />
            <div className="admin-header">
                <h2>관리자 계정 목록</h2>
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
                        <option value="adminId">아이디</option>
                        <option value="name">이름</option>
                        <option value="emplId">사번</option>
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
                        <th onClick={() => handleSort('idIndex')} className={sortConfig.key === 'idIndex' ? `sort-${sortConfig.direction}` : ''}>ID</th>
                        <th onClick={() => handleSort('adminId')} className={sortConfig.key === 'adminId' ? `sort-${sortConfig.direction}` : ''}>아이디</th>
                        <th onClick={() => handleSort('name')} className={sortConfig.key === 'name' ? `sort-${sortConfig.direction}` : ''}>이름</th>
                        <th onClick={() => handleSort('role')} className={sortConfig.key === 'role' ? `sort-${sortConfig.direction}` : ''}>역할</th>
                        <th onClick={() => handleSort('emplId')} className={sortConfig.key === 'emplId' ? `sort-${sortConfig.direction}` : ''}>사번</th>
                        <th onClick={() => handleSort('regDate')} className={sortConfig.key === 'regDate' ? `sort-${sortConfig.direction}` : ''}>등록일</th>
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
