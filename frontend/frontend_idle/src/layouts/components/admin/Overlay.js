import React from 'react';
import './Overlay.css';

const Overlay = ({ onClick }) => {
  return <div className="overlay" onClick={onClick}></div>;
};

export default Overlay;
