import React, { useState, useEffect } from 'react';
import { getCustomerById } from '../../../api/adminApi';
import { getRecentInquiriesByCustomerId } from '../../../api/inquiryApi'; // Import new API
import '../../../theme/admin.css'; // Import admin.css

const CustomerInfoSidebar = ({ customerId }) => {
    const [customer, setCustomer] = useState(null);
    const [recentInquiries, setRecentInquiries] = useState([]); // New state for recent inquiries
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

    useEffect(() => {
        if (customerId) {
            const fetchRecentInquiries = async () => {
                try {
                    const inquiries = await getRecentInquiriesByCustomerId(customerId);
                    setRecentInquiries(inquiries);
                } catch (error) {
                    console.error('Error fetching recent inquiries:', error);
                    setRecentInquiries([]); // Clear on error
                }
            };
            fetchRecentInquiries();
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
            <div className="detail-item">
                <p className="detail-label">아이디:</p>
                <p className="detail-value">{customer.id}</p>
            </div>
            <div className="detail-item">
                <p className="detail-label">이름:</p>
                <p className="detail-value">{customer.customName}</p>
            </div>
            <div className="detail-item">
                <p className="detail-label">닉네임:</p>
                <p className="detail-value">{customer.nickname}</p>
            </div>
            <div className="detail-item">
                <p className="detail-label">역할:</p>
                <p className="detail-value">{customer.role}</p>
            </div>
            <div className="detail-item">
                <p className="detail-label">연락처:</p>
                <p className="detail-value">{customer.phone}</p>
            </div>
            <div className="detail-item">
                <p className="detail-label">가입일:</p>
                <p className="detail-value">{new Date(customer.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="detail-item">
                <p className="detail-label">포인트:</p>
                <p className="detail-value">{customer.userPoint}</p>
            </div>

            <h4 className="admin-heading-sub" style={{ marginTop: '20px', marginBottom: '10px' }}>최근 문의 내역</h4>
            {recentInquiries.length > 0 ? (
                <ul className="recent-inquiries-list">
                    {recentInquiries.map((inquiry) => (
                        <li key={inquiry.inquiryId} className="recent-inquiry-item">
                            {inquiry.inquiryTitle}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="detail-value">최근 문의 내역이 없습니다.</p>
            )}
        </div>
    );
};

export default CustomerInfoSidebar;