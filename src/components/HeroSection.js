import React, { useEffect, useState } from 'react';

const HeroSection = ({ onLogin }) => {
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [isLoggedIn, setIsLoggedIn] = useState(!!username);

    useEffect(() => {
        // Navbar functionality
        const navbarItems = document.querySelectorAll(".navbar-item");
        const navbarContents = document.querySelectorAll(".navbar-content");

        navbarContents.forEach(content => content.classList.remove("active"));
        navbarItems[0].classList.add("active");
        navbarContents[0].classList.add("active");

        navbarItems.forEach((item, index) => {
            item.addEventListener("click", () => {
                navbarItems.forEach(navItem => navItem.classList.remove("active"));
                navbarContents.forEach(content => content.classList.remove("active"));

                navbarItems[index].classList.add("active");
                navbarContents[index].classList.add("active");
            });
        });
    }, []);

    const handleLogin = () => {
        const inputUsername = prompt('Please enter your username:');
        if (inputUsername) {
            setUsername(inputUsername);
            setIsLoggedIn(true);
            localStorage.setItem('username', inputUsername);
            onLogin(inputUsername); // Notify parent component of login
        }
    };

    const handleLogout = () => {
        setUsername('');
        setIsLoggedIn(false);
        localStorage.removeItem('username');
        onLogin(''); // Notify parent component of logout
    };

    return (
        <div className="hero-section">
            <div className="hero-content">
                <div className="login-section">
                    {isLoggedIn ? (
                        <div>
                            Hello, {username} <button onClick={handleLogout}>Logout</button>
                        </div>
                    ) : (
                        <button onClick={handleLogin}>Login</button>
                    )}
                </div>
                <h1 className="title">The Seychess Club.</h1>
                <div className="navbar">
                    <div className="navbar-item active">About</div>
                    <div className="navbar-item">Community</div>
                    <div className="navbar-item">Tournaments</div>
                    <div className="navbar-item">Dev Log</div>
                </div>
                <div className="navbar-content active">
                    <p>
                        Building a player-led community for us Seychellois to compete with friends on the Chess.com leaderboards across several formats.
                        Expanding to Lichess soon and bringing tournaments and other competitive formats.
                        Join us and be part of the growing chess community in Seychelles.
                    </p>
                </div>
                <div className="navbar-content">
                    <p>This project is built by the community. If you have any notes, suggestions,<br />or friends who want to be featured on the site,<br />feel free to message me <a href="https://www.chess.com/member/adamo25" target="_blank" rel="noopener noreferrer">here</a> for further information.</p>
                </div>
                <div className="navbar-content">
                    <p>This section provides information about upcoming chess federation tournaments and potential SeyChess online tournaments in the future. We hope to find a format for players to compete for leaderboard head-to-head points and other competitive aspects. Watch this space for updates!</p>
                </div>
                <div className="navbar-content center-align">
                    <p>Hi guys, it's Adam. Here is our roadmap for upcoming improvements to the site:<br />Main goal: Work on the navbar consistency.<br />Minor goal: Responsive design improvements.<br />Minor goal: Growing to 15 players.<br /></p>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
