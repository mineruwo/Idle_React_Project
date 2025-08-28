import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminById, updateAdmin, deleteAdmin } from '../../../api/adminApi'; // Import updateAdmin, deleteAdmin
import { ROLE_OPTIONS } from '../../../constants/roles'; // Import ROLE_OPTIONS
import '../../../theme/admin.css';

const AdminAccountDetail = ({ adminId, onAdminDeleted }) => { // Added onAdminDeleted prop
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // New state for edit mode
    const [editData, setEditData] = useState(null); // New state for form data

    useEffect(() => {
        const fetchAdminDetails = async () => {
            if (!adminId) return;
            try {
                setLoading(true);
                const data = await getAdminById(adminId);
                setAdmin(data);
                setEditData(data); // Initialize editData when admin data is fetched
            } catch (err) {
                setError(err);
                console.error(`Error fetching admin details for ID ${adminId}:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminDetails();
    }, [adminId]);

    const handleEditClick = () => {
        setIsEditing(true);
        setEditData({ ...admin }); // Copy current admin data to editData
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditData({ ...admin }); // Reset editData to original admin data
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
            // Only update name and role for now, password is handled separately
            const updatedAdmin = await updateAdmin(admin.idIndex, {
                name: editData.name,
                role: editData.role
            });
            setAdmin(updatedAdmin); // Update the displayed admin data
            setIsEditing(false); // Exit edit mode
            alert('관리자 정보가 성공적으로 업데이트되었습니다.');
        } catch (err) {
            console.error('Error updating admin:', err);
            alert('관리자 정보 업데이트에 실패했습니다.');
        }
    };

    const handleDeleteClick = async () => {
        if (window.confirm('정말로 이 관리자 계정을 삭제하시겠습니까?')) {
            try {
                await deleteAdmin(admin.idIndex);
                alert('관리자 계정이 성공적으로 삭제되었습니다.');
                if (onAdminDeleted) {
                    onAdminDeleted(admin.idIndex); // Notify parent to remove from list
                }
            } catch (err) {
                console.error('Error deleting admin:', err);
                alert('관리자 계정 삭제에 실패했습니다.');
            }
        }
    };

    if (loading) {
        return (
            <div className="admin-content-box">
                <p>상세 정보 로딩 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-content-box">
                <p>상세 정보를 불러오는데 실패했습니다: {error.message}</p>
            </div>
        );
    }

    if (!admin) {
        return (
            <div className="admin-content-box">
                <p>해당 관리자 정보를 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="admin-content-box">
            {isEditing ? (
                // Edit Form
                <form className="admin-form-container">
                    <div className="admin-form-group">
                        <label htmlFor="adminId">Admin ID:</label>
                        <input type="text" id="adminId" name="adminId" value={editData.adminId} disabled />
                    </div>
                    <div className="admin-form-group">
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" name="name" value={editData.name} onChange={handleInputChange} />
                    </div>
                    <div className="admin-form-group">
                        <label htmlFor="role">Role:</label>
                        <select id="role" name="role" value={editData.role} onChange={handleInputChange}>
                            {ROLE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-form-group">
                        <label>Registration Date:</label>
                        <input type="text" value={new Date(editData.regDate).toLocaleString()} disabled />
                    </div>
                    <div className="admin-form-group">
                        <label>Deleted:</label>
                        <input type="text" value={editData.del ? 'Yes' : 'No'} disabled />
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
                                <td className="detail-label">Admin ID</td>
                                <td className="detail-value">{admin.adminId}</td>
                            </tr>
                            <tr>
                                <td className="detail-label">Name</td>
                                <td className="detail-value">{admin.name}</td>
                            </tr>
                            <tr>
                                <td className="detail-label">Role</td>
                                <td className="detail-value">{admin.role}</td>
                            </tr>
                            <tr>
                                <td className="detail-label">Registration Date</td>
                                <td className="detail-value">{new Date(admin.regDate).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td className="detail-label">Deleted</td>
                                <td className="detail-value">{admin.del ? 'Yes' : 'No'}</td>
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

export default AdminAccountDetail;
