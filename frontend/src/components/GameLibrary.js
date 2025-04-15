import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';

const GameLibrary = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const renderMenu = () => (
        <div className="menu-container">
            <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <FaBars />
            </button>
            {isMenuOpen && (
                <div className="menu-dropdown">
                    <Link to="/">Leaderboard</Link>
                    <Link to="/game-library">Game Library</Link>
                </div>
            )}
        </div>
    );

    return (
        <div className="game-library">
            {renderMenu()}
            <h1>Game Library</h1>
            <p>Coming soon...</p>
        </div>
    );
};

export default GameLibrary;
