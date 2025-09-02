
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getFaqForEdit, updateFAQ } from '../../../api/adminApi';
import '../../../theme/admin.css';

const FAQEditComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const adminId = useSelector(state => state.adminLogin.id);
  const [writerAdminId, setWriterAdminId] = useState('');

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        const faq = await getFaqForEdit(id);
        setQuestion(faq.question);
        setAnswer(faq.answer);
        setWriterAdminId(faq.writerAdmin?.adminId);
      } catch (error) {
        console.error('Error fetching FAQ:', error);
        alert('FAQ 정보를 가져오는데 실패했습니다.');
      }
    };
    fetchFaq();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFAQ = {
      question,
      answer,
      writerAdminId: adminId, // 수정자는 현재 로그인한 관리자
    };

    try {
      await updateFAQ(id, updatedFAQ);
      alert('FAQ가 성공적으로 수정되었습니다.');
      navigate('/admin/faqs');
    } catch (error) {
      console.error('Error updating FAQ:', error);
      alert('FAQ 수정에 실패했습니다.');
    }
  };

  return (
    <div className="admin-container">
        <div className="admin-header">
            <h2>FAQ 수정</h2>
        </div>
        <form onSubmit={handleSubmit} className="admin-form-container">
            <div className="admin-form-group">
                <label htmlFor="question">질문:</label>
                <input
                    type="text"
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                />
            </div>
            <div className="admin-form-group">
                <label htmlFor="answer">답변:</label>
                <ReactQuill
                    theme="snow"
                    value={answer}
                    onChange={setAnswer}
                    placeholder="답변 내용을 입력하세요..."
                    modules={{
                        toolbar: [
                            [{ 'header': [1, 2, false] }],
                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            [{ 'indent': '-1' }, { 'indent': '+1' }],
                            ['link', 'image'],
                            ['clean']
                        ],
                    }}
                    formats={[
                        'header',
                        'bold', 'italic', 'underline', 'strike', 'blockquote',
                        'list', 'bullet', 'indent',
                        'link', 'image'
                    ]}
                    className="admin-quill-editor"
                />
            </div>
            <div className="admin-form-group">
                <label htmlFor="writerAdminId">작성자 관리자 ID:</label>
                <input
                    type="text"
                    id="writerAdminId"
                    value={writerAdminId || ''}
                    readOnly
                    required
                />
            </div>
            <button type="submit" className="admin-primary-btn">FAQ 수정</button>
        </form>
    </div>
  );
};

export default FAQEditComponent;
