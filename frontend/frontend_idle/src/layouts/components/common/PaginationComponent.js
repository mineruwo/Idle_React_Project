import React from 'react';
import AdminButton from './AdminButton'; // Import AdminButton

const PaginationComponent = ({ currentPage, totalPages, onPageChange, maxVisibleButtons = 10 }) => { // Added maxVisibleButtons prop
    const pageNumbers = [];
    const halfVisible = Math.floor(maxVisibleButtons / 2);

    let startPage = Math.max(0, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

    // Adjust startPage and endPage to ensure maxVisibleButtons are always shown if possible
    if (endPage - startPage + 1 < maxVisibleButtons) {
        if (startPage === 0) {
            endPage = Math.min(totalPages - 1, maxVisibleButtons - 1);
        } else if (endPage === totalPages - 1) {
            startPage = Math.max(0, totalPages - maxVisibleButtons);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="pagination-container">
            <AdminButton
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                variant="default"
            >
                이전
            </AdminButton>

            {/* Render first page button and ellipsis if needed */}
            {startPage > 0 && (
                <>
                    <AdminButton onClick={() => onPageChange(0)} variant="default">1</AdminButton>
                    {startPage > 1 && <span>...</span>}
                </>
            )}

            {pageNumbers.map((number) => (
                <AdminButton
                    key={number}
                    onClick={() => onPageChange(number)}
                    variant="default"
                    isActive={number === currentPage} 
                    className={number === currentPage ? 'pagination-button-active' : ''} 
                >
                    {number + 1}
                </AdminButton>
            ))}

            {/* Render last page button and ellipsis if needed */}
            {endPage < totalPages - 1 && (
                <>
                    {endPage < totalPages - 2 && <span>...</span>}
                    <AdminButton onClick={() => onPageChange(totalPages - 1)} variant="default">{totalPages}</AdminButton>
                </>
            )}

            <AdminButton
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                variant="default"
            >
                다음
            </AdminButton>
        </div>
    );
};

export default PaginationComponent;
