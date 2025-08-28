import React from 'react';
import { ROLE_OPTIONS } from "../../../constants/roles";

export const AdminControls = ({
    roleFilter, setRoleFilter,
    searchQuery, setSearchQuery,
    searchType, setSearchType,
    handleSearch,
    roles,
    searchOptions,
}) => (
    <div className="admin-controls">
        <div className="admin-filter">
            <label htmlFor="role-filter">역할:</label>
            <select id="role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">모두</option>
                {roles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
        </div>
        <form onSubmit={handleSearch} className="admin-search">
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                {searchOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>)
                )}
            </select>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색..."
            />
            <button type="submit" className="admin-primary-btn">검색</button>
        </form>
    </div>
);
