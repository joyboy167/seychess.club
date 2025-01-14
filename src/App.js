import React, { useState } from 'react';
import HeroSection from './components/HeroSection.js';
import RankingsTable from './components/RankingsTable.js';
import Footer from './components/Footer.js';
import './App.css';

const App = () => {
    const [loggedInUsername, setLoggedInUsername] = useState(localStorage.getItem('username') || '');

    const handleLogin = (username) => {
        setLoggedInUsername(username);
    };

    return (
        <div>
            <HeroSection onLogin={handleLogin} />
            <RankingsTable loggedInUsername={loggedInUsername} />
            <Footer />
        </div>
    );
};

export default App;
