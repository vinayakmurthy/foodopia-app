// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className="header">
      <div className="logo">
        <h1>Foodogram</h1>
      </div>
      <div className="search-bar">
        <input type="text" placeholder="Search Cuisines..." />
      </div>
      <div className="nav-links">
        <Link to="/profile">Profile</Link>
        <Link to="/create">Create</Link>
        <Link to="/notifications">Notifications</Link>
        <Link to="/settings">Settings</Link>
        <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/' }}>Logout</button>
      </div>
    </div>
  );
};

export default Header;
