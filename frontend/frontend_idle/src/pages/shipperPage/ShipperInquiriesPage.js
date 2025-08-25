import React, { useState, useEffect, useCallback } from 'react';
import CreateInquiryComponent from '../../layouts/components/common/inquiry/CreateInquiryComponent';
import MyInquiriesComponent from '../../layouts/components/common/inquiry/MyInquiriesComponent';
import { getMe } from '../../api/loginApi';
import { getInquiriesByCustomerId } from '../../api/inquiryApi';

const ShipperInquiriesPage = () => {
    const [inquiries, setInquiries] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInquiries = useCallback(async () => {
        if (!currentUser) return;
        try {
            const inquiriesData = await getInquiriesByCustomerId(currentUser.idNum);
            setInquiries(inquiriesData.content); // Assuming the data is paginated
        } catch (error) {
            setError('문의 내역을 불러오는 중 오류가 발생했습니다.');
            console.error(error);
        }
    }, [currentUser]);

    useEffect(() => {
        const fetchUserAndInquiries = async () => {
            setLoading(true);
            try {
                const userData = await getMe();
                setCurrentUser(userData);
            } catch (error) {
                setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserAndInquiries();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchInquiries();
        }
    }, [currentUser, fetchInquiries]);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <CreateInquiryComponent
                currentUser={currentUser}
                refreshInquiries={fetchInquiries}
            />
            <MyInquiriesComponent inquiries={inquiries} />
        </div>
    );
};

export default ShipperInquiriesPage;
