import React from 'react';
import './MainContentComponent.css';

const MainContentComponent = ({ isSidebarOpen, children }) => {
  return (
    <div className={`main-content ${isSidebarOpen ? 'open' : ''}`}>
      {children}
    </div>
  );
};

export default MainContentComponent;
