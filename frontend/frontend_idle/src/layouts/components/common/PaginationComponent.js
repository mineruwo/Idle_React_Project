import React from 'react';
import AdminButton from './AdminButton'; // Import AdminButton

const PaginationComponent = ({ currentPage, totalPages, onPageChange, maxVisibleButtons = 10 }) => { // Added maxVisibleButtons prop
    const pageNumbers = [];
    const halfVisible = Math.floor(maxVisibleButtons / 2);

    let startPage = currentPage - halfVisible;
    let endPage = currentPage + halfVisible;

    // Ensure startPage is not less than 0
    if (startPage < 0) {
        endPage += -startPage; // Shift endPage by the amount startPage is below 0
        startPage = 0;
    }

    // Ensure endPage is not greater than totalPages - 1
    if (endPage >= totalPages) {
        startPage -= (endPage - (totalPages - 1)); // Shift startPage by the amount endPage is above totalPages - 1
        endPage = totalPages - 1;
    }

    // Re-check startPage after adjusting for endPage (in case totalPages is very small)
    if (startPage < 0) {
        startPage = 0;
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
                className="pagination-button"
            >
                이전
            </AdminButton>

            {/* Render first page button and ellipsis if needed */}
            {startPage > 0 && (
                <>
                    <AdminButton onClick={() => onPageChange(0)} variant="default" className="pagination-button">1</AdminButton>
                    {startPage > 1 && <span>...</span>}
                </>
            )}

            {pageNumbers.map((number) => (
                <AdminButton
                    key={number}
                    onClick={() => onPageChange(number)}
                    variant="default"
                    isActive={number === currentPage} 
                    className={`pagination-button ${number === currentPage ? 'pagination-button-active' : ''}`} 
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
                className="pagination-button"
            >
                다음
            </AdminButton>
        </div>
    );
};

export default PaginationComponent;
