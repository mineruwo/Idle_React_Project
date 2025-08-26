import React, { useState } from 'react';
import { updateInquiry } from '../../../api/inquiryApi';
import '../../../theme/admin.css'; // Import admin.css

const InquiryDetailComponent = ({ inquiry, onBackToList, refreshInquiries }) => {
    const [answer, setAnswer] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!answer.trim()) {
            alert('답변을 입력해주세요.');
            return;
        }

        const inquiryData = {
            ...inquiry,
            inquiryAnswer: answer,
            status: 'ANSWERED', // Or whatever the completed status is
        };

        try {
            await updateInquiry(inquiry.inquiryId, inquiryData);
            alert('답변이 성공적으로 등록되었습니다.');
            refreshInquiries(); // Refresh the list in the parent component
            onBackToList(); // Go back to the list view
        } catch (error) {
            alert('답변 등록 중 오류가 발생했습니다.');
            console.error(error);
        }
    };

    return (
        <div className="admin-content-container"> {/* Use a general admin content container */}
            <div className="admin-header-with-button">
                <button onClick={onBackToList} className="admin-button-secondary">목록으로 돌아가기</button>
                <h2 className="admin-heading">문의 상세 내역</h2>
            </div>
            
            <div className="admin-card"> {/* Use a card-like structure for details */}
                <p><strong>문의 번호:</strong> {inquiry.inquiryId}</p>
                <p><strong>제목:</strong> {inquiry.inquiryTitle}</p>
                <p><strong>문의 내용:</strong></p>
                <div className="admin-text-area-display"> {/* Styled div for displaying content */}
                    {inquiry.inquiryContent}
                </div>
                <p><strong>작성일:</strong> {new Date(inquiry.createdAt).toLocaleString()}</p>
                <p><strong>상태:</strong> {inquiry.status}</p>
                {inquiry.inquiryAnswer && (
                    <>
                        <p><strong>답변:</strong></p>
                        <div className="admin-text-area-display">
                            {inquiry.inquiryAnswer}
                        </div>
                    </>
                )}
            </div>

            <div className="admin-card mt-3"> {/* Margin top for separation */}
                <h3 className="admin-heading-sub">답변 작성</h3>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="답변을 입력하세요..."
                            required
                            className="admin-textarea"
                        />
                    </div>
                    <button type="submit" className="admin-button-primary">답변 등록</button>
                </form>
            </div>
        </div>
    );
};

export default InquiryDetailComponent;