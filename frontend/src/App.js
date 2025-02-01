import React, { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection.js';
import RankingsTable from './components/RankingsTable.js';
import Footer from './components/Footer.js';
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
        // Log environment variables to check if they are being read correctly
        console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
        console.log('Frontend URL:', process.env.REACT_APP_FRONTEND_URL);
    }, []);

    return (
        <div>
            <HeroSection onLogin={handleLogin} onToggleAdminMode={handleToggleAdminMode} isAdminMode={isAdminMode} />
            <RankingsTable loggedInUsername={loggedInUsername} isAdminMode={isAdminMode} />
            <Footer />
        </div>
    );
};

export default App;
