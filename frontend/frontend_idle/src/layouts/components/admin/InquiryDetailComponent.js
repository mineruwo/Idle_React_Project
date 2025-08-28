import React, { useState } from 'react';
import { useSelector } from 'react-redux'; // Import useSelector
import ReactQuill from 'react-quill'; // Import ReactQuill
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS
import { updateInquiry } from '../../../api/inquiryApi';
import '../../../theme/admin.css'; // Import admin.css

const InquiryDetailComponent = ({ inquiry, onBackToList, refreshInquiries }) => {
    const [answer, setAnswer] = useState('');
    const currentAdminId = useSelector(state => state.adminLogin.id); // Get current admin's ID
    const currentAdminIdIndex = useSelector(state => state.adminLogin.idIndex); // Get current admin's ID Index

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
            answeredAt: new Date().toISOString(), // Set answeredAt to current time
            adminId: currentAdminId, // Set adminId from Redux store
            adminIdIndex: currentAdminIdIndex, // Set adminIdIndex from Redux store
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
            
            <div className="admin-card inquiry-detail-card">
                <div className="detail-item">
                    <p className="detail-label">문의 번호:</p>
                    <p className="detail-value">{inquiry.inquiryId}</p>
                </div>
                <div className="detail-item">
                    <p className="detail-label">제목:</p>
                    <p className="detail-value">{inquiry.inquiryTitle}</p>
                </div>
                <div className="detail-item">
                    <p className="detail-label">문의 내용:</p>
                    <div className="detail-content admin-text-area-display" dangerouslySetInnerHTML={{ __html: inquiry.inquiryContent }}>
                    </div>
                </div>
                <div className="detail-item">
                    <p className="detail-label">작성일:</p>
                    <p className="detail-value">{new Date(inquiry.createdAt).toLocaleString()}</p>
                </div>
                <div className="detail-item">
                    <p className="detail-label">상태:</p>
                    <p className="detail-value">{inquiry.status}</p>
                </div>
            <div className="detail-item">
                    <p className="detail-label">답변 내용:</p>
                    <div className="detail-content admin-text-area-display" dangerouslySetInnerHTML={{ __html: inquiry.inquiryAnswer }}>
                    </div>
                </div>
            </div> {/* Closes admin-card inquiry-detail-card */}

            <div className="admin-card mt-3"> {/* Margin top for separation */}
                <h3 className="admin-heading-sub">답변 작성</h3>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <ReactQuill
                            value={answer}
                            onChange={setAnswer} // ReactQuill's onChange provides the HTML string directly
                            placeholder="답변을 입력하세요..."
                            modules={{
                                toolbar: [
                                    ['bold', 'italic']
                                ],
                            }}
                            formats={[
                                'header',
                                'bold', 'italic', 'underline', 'strike', 'blockquote',
                                'list', 'bullet', 'indent',
                                'link', 'image'
                            ]}
                            className="admin-quill-editor" // Add a class for styling if needed
                        />
                    </div>
                    <button type="submit" className="admin-button-primary">답변 등록</button>
                </form>
            </div>
        </div>
    );
};

export default InquiryDetailComponent;