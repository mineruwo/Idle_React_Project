
import React from 'react';
import { getAllNotices, getAllFAQs } from '../../../api/adminApi';
import useDashboardData from '../../../hooks/useDashboardData';
import '../../../theme/admin.css';

const DashboardTable = ({ title, data, columns, emptyMessage }) => (
    <div style={{ flex: 1 }}>
        <h4>{title}</h4>
        <table className="admin-table">
            <thead>
                <tr>
                    {columns.map(col => <th key={col.header}>{col.header}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.length > 0 ? (
                    data.map(item => (
                        <tr key={item.id}>
                            {columns.map(col => <td key={`${item.id}-${col.accessor}`}>{col.accessor(item)}</td>)}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.length}>{emptyMessage}</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

const NoticeAndFaqDashboard = () => {
    const { data: notices, loading: noticesLoading, error: noticesError } = useDashboardData(getAllNotices, 3);
    const { data: faqs, loading: faqsLoading, error: faqsError } = useDashboardData(getAllFAQs, 3);

    const noticeColumns = [
        { header: '제목', accessor: item => item.title },
        { header: '조회수', accessor: item => item.viewCount },
        { header: '작성자', accessor: item => item.writerAdminId },
    ];

    const faqColumns = [
        { header: '질문', accessor: item => item.question },
        { header: '조회수', accessor: item => item.viewCount },
        { header: '작성자', accessor: item => item.writerAdminId },
    ];

    if (noticesLoading || faqsLoading) {
        return <div>로딩 중...</div>;
    }

    if (noticesError || faqsError) {
        return <div>오류 발생: {noticesError?.message || faqsError?.message}</div>;
    }

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            <DashboardTable 
                title="최근 공지사항" 
                data={notices} 
                columns={noticeColumns} 
                emptyMessage="등록된 공지사항이 없습니다." 
            />
            <DashboardTable 
                title="최근 자주 묻는 질문" 
                data={faqs} 
                columns={faqColumns} 
                emptyMessage="등록된 FAQ가 없습니다." 
            />
        </div>
    );
};

export default NoticeAndFaqDashboard;
