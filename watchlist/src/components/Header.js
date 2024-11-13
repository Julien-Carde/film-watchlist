// Header.js
import React from "react";
import './Header.css';

export default function Header({ toggleView }) {
    return (
        <div className="container">
            <h1 className="title">Watchlist</h1>
            <div className="display">
                <img height='40px' src="/list-svgrepo-com.svg" onClick={() => toggleView(false)} alt="List View Icon" />
                <img height='40px' src="/grid1-svgrepo-com.svg" onClick={() => toggleView(true)} alt="Grid View Icon" />
            </div>
        </div>
    );
}