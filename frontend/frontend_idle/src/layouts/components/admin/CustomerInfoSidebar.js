import React, { useState, useEffect } from 'react';
import { getCustomerById } from '../../../api/adminApi';
import '../../../theme/admin.css'; // Import admin.css

const CustomerInfoSidebar = ({ customerId }) => {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (customerId) {
            const fetchCustomer = async () => {
                setLoading(true);
                try {
                    const customerData = await getCustomerById(customerId);
                    setCustomer(customerData);
                } catch (error) {
                    setError('고객 정보를 불러오는 중 오류가 발생했습니다.');
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCustomer();
        }
    }, [customerId]);

    if (!customerId) {
        return <div className="admin-card sidebar-card">고객을 선택해주세요.</div>;
    }

    if (loading) {
        return <div className="admin-card sidebar-card">로딩 중...</div>;
    }

    if (error) {
        return <div className="admin-card sidebar-card">{error}</div>;
    }

    if (!customer) {
        return <div className="admin-card sidebar-card">고객 정보를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="admin-card sidebar-card">
            <h3 className="admin-heading-sub">고객 정보</h3>
            <p><strong>아이디:</strong> {customer.id}</p>
            <p><strong>이름:</strong> {customer.customName}</p>
            <p><strong>닉네임:</strong> {customer.nickname}</p>
            <p><strong>역할:</strong> {customer.role}</p>
            <p><strong>연락처:</strong> {customer.phone}</p>
            <p><strong>가입일:</strong> {new Date(customer.createdAt).toLocaleDateString()}</p>
            <p><strong>포인트:</strong> {customer.userPoint}</p>
        </div>
    );
};

export default CustomerInfoSidebar;