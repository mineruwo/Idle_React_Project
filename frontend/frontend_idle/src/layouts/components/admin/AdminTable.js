import React from 'react';

export const AdminTable = ({ data, columns, sortConfig, onSort, emptyMessage, onRowClick, selectedRowId, renderExpandedContent }) => (
    <table className="admin-table">
        <thead>
            <tr>
                {columns.map(col => (
                    <th
                        key={col.key}
                        onClick={() => col.sortable && onSort(col.key)}
                        className={sortConfig.key === col.key ? `sort-${sortConfig.direction}` : ''}
                    >
                        {col.header}
                    </th>
                ))}
            </tr>
        </thead>
        <tbody>
            {data.length > 0 ? (
                data.map((item) => (
                    <React.Fragment key={item.idIndex || item.id || item.inquiryId}>
                        <tr className="admin-table-row" onClick={() => onRowClick && onRowClick(item)}>
                            {columns.map(col => (
                                <td key={`${item.idIndex || item.id || item.inquiryId}-${col.key}`}>
                                    {col.render ? col.render(item) : item[col.key]}
                                </td>
                            ))}
                        </tr>
                        {selectedRowId === (item.idIndex || item.id || item.inquiryId) && renderExpandedContent && (
                            <tr className="admin-content-row">
                                {renderExpandedContent(item)}
                            </tr>
                        )}
                    </React.Fragment>
                ))
            ) : (
                <tr>
                    <td colSpan={columns.length}>{emptyMessage}</td>
                </tr>
            )}
        </tbody>
    </table>
);
