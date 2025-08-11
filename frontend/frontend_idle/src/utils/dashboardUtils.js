import React from 'react';

export const renderAccountPanel = (title, dateColumnName) => (
    <div style={{ flex: 1, border: '1px dashed #aaa', padding: '15px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4>{title}</h4>
            <div>
                <button className="btn btn-outline-secondary btn-sm" style={{margin: '0 2px'}}>1일</button>
                <button className="btn btn-outline-secondary btn-sm" style={{margin: '0 2px'}}>1주일</button>
                <button className="btn btn-outline-secondary btn-sm" style={{margin: '0 2px'}}>1달</button>
            </div>
        </div>
        <table className="table table-hover" style={{ fontSize: '0.9rem' }}>
            <thead>
                <tr>
                    <th>아이디</th>
                    <th>이름</th>
                    <th>권한</th>
                    <th>{dateColumnName}</th>
                </tr>
            </thead>
            <tbody>
                {/* 데이터가 없을 경우를 위한 예시 행 */}
                <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>데이터가 없습니다.</td>
                </tr>
            </tbody>
        </table>
    </div>
);
