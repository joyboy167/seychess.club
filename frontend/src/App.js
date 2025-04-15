import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeroSection from './components/HeroSection.js';
import RankingsTable from './components/RankingsTable.js';
import Footer from './components/Footer.js';
import GameLibrary from './components/GameLibrary.js';
import './App.css';

const App = () => {
    const [loggedInUsername, setLoggedInUsername] = useState(localStorage.getItem('username') || '');
    const [isAdminMode, setIsAdminMode] = useState(false);

    const handleLogin = (username) => {
        setLoggedInUsername(username);
    };

    const handleToggleAdminMode = () => {
        setIsAdminMode(!isAdminMode);
    };

    useEffect(() => {
        // Log environment variables to ensure they are loaded
        console.log('Environment Variables Check:');
        console.log('REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL || 'Undefined');
        console.log('REACT_APP_FRONTEND_URL:', process.env.REACT_APP_FRONTEND_URL || 'Undefined');

        // Test API call (optional, remove or modify as needed)
        if (process.env.REACT_APP_BACKEND_URL) {
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/test`)
                .then((response) => response.json())
                .then((data) => console.log('API Test Response:', data))
                .catch((error) => console.error('Error during API fetch:', error));
        } else {
            console.error('REACT_APP_BACKEND_URL is not set, cannot fetch API data.');
        }
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <div className="app-container">
                        <HeroSection onLogin={handleLogin} onToggleAdminMode={handleToggleAdminMode} isAdminMode={isAdminMode} />
                        <RankingsTable loggedInUsername={loggedInUsername} isAdminMode={isAdminMode} />
                        <Footer />
                    </div>
                } />
                <Route path="/game-library" element={<GameLibrary />} />
            </Routes>
        </Router>
    );
};

export default App;
