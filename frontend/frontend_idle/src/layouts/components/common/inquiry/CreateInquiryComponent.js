import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Quill CSS
import "../../../../CustomCSS/Inquiry.css";
import { createInquiry } from '../../../../api/inquiryApi';

const CreateInquiryComponent = ({ currentUser, refreshInquiries, onCancelWrite }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        const inquiryData = {
            inquiryTitle: title,
            inquiryContent: content,
            customerIdNum: currentUser.idNum,
        };

        try {
            await createInquiry(inquiryData);
            alert('문의가 성공적으로 접수되었습니다.');
            setTitle('');
            setContent('');
            refreshInquiries(); // Refresh the list
        } catch (error) {
            alert('문의 접수 중 오류가 발생했습니다.');
            console.error(error);
        }
    };

    return (
        <div className="inquiry-form-container">
            <h2 className="inquiry-title">문의 작성</h2>
            <form onSubmit={handleSubmit} className="inquiry-form">
                <div className="form-group">
                    <label htmlFor="title">제목</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="content">내용</label>
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        className="quill-editor"
                        modules={{
                            toolbar: false,
                        }}
                    />
                </div>
                <div className="form-buttons">
                    <button type="submit" className="inquiry-form-button">문의 접수</button>
                    <button type="button" onClick={onCancelWrite} className="inquiry-form-button secondary-button">목록으로 돌아가기</button>
                </div>
            </form>
        </div>
    );
};

export default CreateInquiryComponent;