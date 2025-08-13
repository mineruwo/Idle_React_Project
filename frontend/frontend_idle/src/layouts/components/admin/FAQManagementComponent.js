import React, { useState, Fragment } from 'react';
import '../../../theme/admin.css';

const FAQManagementComponent = () => {
    // Mock data for demonstration
    const [faqs, setFaqs] = useState([
        { id: 1, question: "배송 조회는 어떻게 하나요?", answer: "마이페이지 > 주문/배송 조회 메뉴에서 확인하실 수 있습니다." },
        { id: 2, question: "결제 수단에는 어떤 것들이 있나요?", answer: "신용카드, 무통장 입금, 휴대폰 소액결제 등 다양한 결제 수단을 지원합니다." },
        { id: 3, question: "회원 탈퇴는 어떻게 하나요?", answer: "고객센터로 문의주시거나, 마이페이지 > 회원정보 수정 메뉴에서 직접 탈퇴하실 수 있습니다." },
    ]);
    const [expandedId, setExpandedId] = useState(null);

    const handleRowClick = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>자주 묻는 질문 관리</h2>
                <button className="admin-primary-btn">새 FAQ 등록</button>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>질문</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {faqs.map(faq => (
                        <Fragment key={faq.id}>
                            <tr className="admin-table-row" onClick={() => handleRowClick(faq.id)}>
                                <td>{faq.id}</td>
                                <td>{faq.question}</td>
                                <td><button className="admin-action-btn admin-modify-btn">수정</button></td>
                            </tr>
                            {expandedId === faq.id && (
                                <tr className="admin-content-row">
                                    <td colSpan="3">
                                        <div className="admin-content-box">
                                            <strong>답변:</strong>
                                            <p style={{ marginTop: '5px' }}>{faq.answer}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FAQManagementComponent;