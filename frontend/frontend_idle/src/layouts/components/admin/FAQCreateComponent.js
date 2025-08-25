import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { createFAQ } from '../../../api/adminApi';
import Modal from '../common/Modal';
import '../../../theme/admin.css';
import { useNavigate } from 'react-router-dom';

const FAQCreateComponent = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const { id: writerAdminId } = useSelector(state => state.adminLogin);
  const navigate = useNavigate();

  const [modalState, setModalState] = useState({ show: false, message: "" });

  const showModal = (message) => {
    setModalState({ show: true, message });
  };

  const closeModal = () => {
    setModalState({ ...modalState, show: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newFAQ = {
      question,
      answer,
      writerAdminId,
    };

    try {
      await createFAQ(newFAQ);
      showModal('FAQ가 성공적으로 등록되었습니다.');
      setQuestion('');
      setAnswer('');
      // navigate('/admin/faqs'); // Navigate after user closes modal
    } catch (error) {
      console.error('Error creating FAQ:', error);
      const errorMessage = error.response ? error.response.data : error.message;
      showModal(`FAQ 등록에 실패했습니다: ${errorMessage}`);
    }
  };

  return (
    <div className="admin-container">
        <Modal show={modalState.show} message={modalState.message} onClose={closeModal} />
        <div className="admin-header">
            <h2>새 FAQ 작성</h2>
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
                <textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                ></textarea>
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
            <button type="submit" className="admin-primary-btn">FAQ 등록</button>
        </form>
    </div>
  );
};

export default FAQCreateComponent;
