import React, { useState, useEffect } from "react";
import { getMe } from "../../api/loginApi";
import FAQListComponent from "../../layouts/components/common/inquiry/FAQListComponent";
import MyInquiriesListComponent from "../../layouts/components/common/inquiry/MyInquiriesListComponent";
import CreateInquiryComponent from "../../layouts/components/common/inquiry/CreateInquiryComponent";
import "../../CustomCSS/InquiryNav.css";
import GNB from "../../layouts/components/common/GNB";
import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";

const CarOwnerInquiriesPage = () => {
    const [showWriteForm, setShowWriteForm] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inquiryListKey, setInquiryListKey] = useState(Date.now());

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const userData = await getMe();
                setCurrentUser(userData);
            } catch (err) {
                setError("사용자 정보를 불러오는데 실패했습니다.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleInquiryCreated = () => {
        setInquiryListKey(Date.now());
        setShowWriteForm(false);
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <div className="topmenu">
                <GNB />
                <NaviTap />
            </div>
            <div className="inquiry-page-container">
                <div className="inquiry-page-wrapper">
                    {showWriteForm ? (
                        <>
                            <CreateInquiryComponent
                                currentUser={currentUser}
                                refreshInquiries={handleInquiryCreated}
                                onCancelWrite={() => setShowWriteForm(false)}
                            />
                        </>
                    ) : (
                        <>
                            <div className="inquiry-header">
                                <h2>고객 문의</h2>
                                <button
                                    onClick={() => setShowWriteForm(true)}
                                    className="write-inquiry-button"
                                >
                                    문의 작성
                                </button>
                            </div>
                            <FAQListComponent />
                            <hr className="inquiry-divider" />
                            <MyInquiriesListComponent
                                key={inquiryListKey}
                                currentUser={currentUser}
                            />
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CarOwnerInquiriesPage;
