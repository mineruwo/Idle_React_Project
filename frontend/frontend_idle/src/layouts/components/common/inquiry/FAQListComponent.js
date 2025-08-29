import React, { useState, useEffect } from 'react';
import { getAllFAQs } from '../../../../api/publicApi';
import "../../../../CustomCSS/FAQ.css"; // Assuming a new CSS file for styling

const FAQListComponent = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openFaqId, setOpenFaqId] = useState(null);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const faqsData = await getAllFAQs();
                setFaqs(faqsData);
            } catch (err) {
                setError('FAQ를 불러오는 중 오류가 발생했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFAQs();
    }, []);

    const toggleFaq = (id) => {
        setOpenFaqId(openFaqId === id ? null : id);
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="faq-container">
            <h2 className="faq-title">자주 묻는 질문 (FAQ)</h2>
            <div className="faq-list">
                {faqs.map((faq, index) => (
                    <div key={`${faq.id}-${index}`} className={`faq-item ${openFaqId === faq.id ? 'open' : ''}`}>
                        <div className="faq-question" onClick={() => toggleFaq(faq.id)}>
                            <span>{faq.question}</span>
                            <span>{openFaqId === faq.id ? '▲' : '▼'}</span>
                        </div>
                        {openFaqId === faq.id && (
                            <div className="faq-answer" dangerouslySetInnerHTML={{ __html: faq.answer }}></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQListComponent;
