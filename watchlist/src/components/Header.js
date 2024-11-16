// Header.js
import React from "react";
import './Header.css';

export default function Header({ toggleView, username, onLogout }) {
    return (
        <header>
            <div className="header-left">
                <h1 className="title">Watchlist</h1>
                <div className="display">
                    <img height='40px' src="/list-svgrepo-com.svg" onClick={() => toggleView(false)} alt="List View Icon" />
                    <img height='40px' src="/grid1-svgrepo-com.svg" onClick={() => toggleView(true)} alt="Grid View Icon" />
                </div>
            </div>
            <div className="header-right">
                <span className="username">Welcome, {username}!</span>
                <span 
                    onClick={onLogout} 
                    style={{ 
                        marginLeft: '15px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    Log out
                </span>
            </div>
        </header>
    );
}