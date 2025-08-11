import React from 'react';
import './PaginationComponent.css';

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="pagination-container">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="pagination-button"
            >
                이전
            </button>
            {pageNumbers.map((number) => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`pagination-button ${number === currentPage ? 'active' : ''}`}
                >
                    {number + 1}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="pagination-button"
            >
                다음
            </button>
        </div>
    );
};

export default PaginationComponent;
