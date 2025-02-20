import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';
import { FaUser } from 'react-icons/fa'; // Import the user icon
import { getPlayerStats, fetchGameStats, fetchPlayerStats } from './analytics.js';

const players = [
    { username: "adamo25", platform: "chesscom", realName: "Adam Furneau" },
    { username: "Mordecai_6", platform: "chesscom", realName: "Darius Hoareau" },
    { username: "MinusE1", platform: "chesscom", realName: "Rudolph Camille" },
    { username: "Jeremy_Raguain", platform: "chesscom", realName: "Jeremy Raguain" },
    { username: "Buumpliz", platform: "chesscom", realName: "Alex Jovanovic" },
    { username: "durupa", platform: "chesscom", realName: "Alexander Durup" },
    { username: "adam8991", platform: "chesscom", realName: "Adam Afif" },
    { username: "lauvalsez", platform: "chesscom", realName: "Laurent Valentin" },
    { username: "seypanda", platform: "chesscom", realName: "Leo Kwon" },
    { username: "LC9797", platform: "chesscom", realName: "Leeroy Charlette" },
    { username: "vidhyasahar11", platform: "chesscom", realName: "Vidyashar" },
    { username: "barnabysadler", platform: "chesscom", realName: "Barnaby Sadler" },
    { username: "Seenu29", platform: "chesscom", realName: "Seenu" },
    { username: "mag_sey", platform: "chesscom", realName: "Magali Rocamora Sole" },
    { username: "viswara", platform: "chesscom", realName: "Viswarajan Pillay" },
    { username: "Dedicated69", platform: "chesscom", realName: "Naveen Volcere" }
];

const HeroSection = ({ onLogin, onToggleAdminMode, isAdminMode }) => {
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(!!username);
    const [showModal, setShowModal] = useState(false);
    const [gameStats, setGameStats] = useState([]);
    const [playerStats, setPlayerStats] = useState({});
    const [compRatings, setCompRatings] = useState([]);
    const [winLossStats, setWinLossStats] = useState({ rapid: {}, blitz: {}, bullet: {} });
    const [realName, setRealName] = useState('');
    const usernameInputRef = useRef(null);

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

        // Fetch baseline data for admin view
        if (isAdminMode) {
            fetchCompRatings();
        }

        if (isLoggedIn) {
            fetchWinLossStats();
            fetchRealName(username);
        }
    }, [isAdminMode, isLoggedIn, username]);

    const fetchCompRatings = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/baselines');
            const data = await response.json();
            if (data.success) {
                setCompRatings(data.data);
            } else {
                console.error('Failed to fetch baseline data:', data.message);
            }
        } catch (error) {
            console.error('Error fetching baseline data:', error);
        }
    };

    const fetchRealName = (username) => {
        const player = players.find(player => player.username === username);
        setRealName(player ? player.realName : 'Unknown');
    };

    const handleLogin = () => {
        if (username === 'adamo25' && password !== 'admin-adamo') {
            alert('Incorrect password for adamo25');
            return;
        }

        if (username) {
            setIsLoggedIn(true);
            localStorage.setItem('username', username);
            onLogin(username); // Notify parent component of login
            fetchRealName(username); // Fetch real name after login
        }
    };

    const handleLogout = () => {
        setUsername('');
        setPassword('');
        setIsLoggedIn(false);
        localStorage.removeItem('username');
        onLogin(''); // Notify parent component of logout
        setRealName(''); // Clear real name on logout
    };

    const fetchWinLossStats = async () => {
        try {
            const stats = await getPlayerStats(username);
            setWinLossStats(stats);
        } catch (error) {
            console.error("Error fetching win/loss stats:", error);
        }
    };

    const handleButtonClick = () => {
        if (isLoggedIn) {
            setShowModal(true);
            fetchGameStats(username).then(setGameStats).catch(console.error);
            fetchPlayerStats(username).then(setPlayerStats).catch(console.error);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                usernameInputRef.current.focus(); // Focus on the username input field
            }, 500); // Adjust the timeout duration to match the scroll animation duration
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleOutsideClick = (e) => {
        if (e.target.classList.contains('modal')) {
            handleCloseModal();
        }
    };

    const calculateWinLossDraw = () => {
        const last7Games = gameStats.slice(-7);
        let wins = 0, losses = 0, draws = 0;
        last7Games.forEach(game => {
            const result = game.white.username === username ? game.white.result : game.black.result;
            if (result === 'win') wins++;
            else if (result === 'loss') losses++;
            else if (result === 'draw') draws++;
        });
        return { wins, losses, draws };
    };

    const calculateWinPercentage = (wins, losses) => {
        const totalGames = wins + losses;
        return totalGames > 0 ? ((wins / totalGames) * 100).toFixed(2) : "0.00";
    };

    const calculateAverageRating = () => {
        const bulletRating = playerStats.chess_bullet?.last?.rating || 0;
        const blitzRating = playerStats.chess_blitz?.last?.rating || 0;
        const rapidRating = playerStats.chess_rapid?.last?.rating || 0;
        const puzzleRating = playerStats.tactics?.highest?.rating || 0;

        const weightedAverage = (bulletRating * 0.1) + (blitzRating * 0.3) + (rapidRating * 0.5) + (puzzleRating * 0.1);
        return weightedAverage ? parseFloat(weightedAverage.toFixed(1)) : "N/A";
    };

    const renderRatingBox = (label, currentRating, previousRating, isAverage = false) => {
        const changeIndicator = getChangeIndicator(currentRating, previousRating, isAverage);
        return (
            <div className={`rating-box ${isAverage ? 'average-rating' : ''}`}>
                <div className="rating-box-title">
                    <h4>{label} {isAverage && <span className="chart-icon">📊</span>}</h4>
                </div>
                <div className="rating-box-rating">
                    <p>{currentRating === "N/A" ? "N/A" : <CountUp start={0} end={currentRating} duration={2.13} decimals={isAverage ? 1 : 0} />}</p>
                    {changeIndicator}
                </div>
            </div>
        );
    };

    const getChangeIndicator = (currentValue, previousValue, isAverage = false) => {
        if (previousValue === "N/A" || currentValue === "N/A") return null;
        const change = currentValue - previousValue;
        if (change === 0) return null;
        const arrow = change > 0 ? '▲' : '▼';
        const color = change > 0 ? 'green' : 'red';
        return (
            <span className={`change-indicator ${change > 0 ? 'increase' : 'decrease'}`} style={{ color, fontWeight: 'bold' }}>
                {arrow} {Math.abs(change).toFixed(isAverage ? 1 : 0)}
            </span>
        );
    };

    const getPreviousRating = (key) => {
        const player = compRatings.find(p => p.username === username);
        return player ? player[key] : "N/A";
    };

    const renderRecommendations = () => {
        const recommendations = [];
        const puzzleRating = playerStats.tactics?.highest?.rating || "N/A";
        const bulletRating = playerStats.chess_bullet?.last?.rating || "N/A";
        const blitzRating = playerStats.chess_blitz?.last?.rating || "N/A";
        const rapidRating = playerStats.chess_rapid?.last?.rating || "N/A";

        if (puzzleRating !== "N/A" && puzzleRating < 1000) {
            recommendations.push("Try to play puzzles until you reach a rating of 1000.");
        }

        if (bulletRating === "N/A") {
            recommendations.push("Play at least one bullet game to get a rating.");
        }

        if (blitzRating === "N/A") {
            recommendations.push("Play at least one blitz game to get a rating.");
        }

        if (rapidRating === "N/A") {
            recommendations.push("Play at least one rapid game to get a rating.");
        }

        if (rapidRating !== "N/A" && rapidRating < 700) {
            recommendations.push("Focus on playing puzzles and stick to rapid games until you understand the game better. Avoid lower time controls for now.");
        }

        return recommendations.length > 0 ? (
            <ul>
                {recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                ))}
            </ul>
        ) : (
            <p>No specific recommendations at this time. Keep up the good work!</p>
        );
    };

    const getWinRateMessage = (winPercentage) => {
        if (winPercentage > 55) {
            return "Keep playing games (you are probably underrated).";
        } else if (winPercentage < 45) {
            return "Stop playing games (take a break, work on your game).";
        } else {
            return "You are near your ceiling at your current level.";
        }
    };

    const renderOverviewContent = () => {
        const { wins, losses, draws } = calculateWinLossDraw();
        const rapidWinPercentage = calculateWinPercentage(winLossStats.rapid.wins, winLossStats.rapid.losses);
        const blitzWinPercentage = calculateWinPercentage(winLossStats.blitz.wins, winLossStats.blitz.losses);
        const bulletWinPercentage = calculateWinPercentage(winLossStats.bullet.wins, winLossStats.bullet.losses);

        return (
            <div className="overview-content">
                <h3>Overview</h3>
                <div className="username-box">
                    <h4>Username</h4>
                    <p>{username} <span className="real-name">({realName})</span></p>
                </div>
                <div className="win-loss-box">
                    <h4>Win/Loss (Last 7 Days)</h4>
                    <p>
                        Rapid: <span className="win">{winLossStats.rapid.wins}</span> / <span className="loss">{winLossStats.rapid.losses}</span> (<span className="win-percentage">{rapidWinPercentage}%</span>) - {getWinRateMessage(rapidWinPercentage)}
                        <br />
                        Blitz: <span className="win">{winLossStats.blitz.wins}</span> / <span className="loss">{winLossStats.blitz.losses}</span> (<span className="win-percentage">{blitzWinPercentage}%</span>) - {getWinRateMessage(blitzWinPercentage)}
                        <br />
                        Bullet: <span className="win">{winLossStats.bullet.wins}</span> / <span className="loss">{winLossStats.bullet.losses}</span> (<span className="win-percentage">{bulletWinPercentage}%</span>) - {getWinRateMessage(bulletWinPercentage)}
                    </p>
                </div>
                <div className="rating-boxes">
                    {renderRatingBox('Puzzle 🧩', playerStats.tactics?.highest?.rating, getPreviousRating('puzzle'))}
                    {renderRatingBox('Bullet 🚀', playerStats.chess_bullet?.last?.rating, getPreviousRating('bullet'))}
                    {renderRatingBox('Blitz ⚡', playerStats.chess_blitz?.last?.rating, getPreviousRating('blitz'))}
                    {renderRatingBox('Rapid ⏱️', playerStats.chess_rapid?.last?.rating, getPreviousRating('rapid'))}
                    {renderRatingBox('Average', calculateAverageRating(), getPreviousRating('avgRating'), true)}
                </div>
                <div className="recommendation-box">
                    <h4>Recommendations</h4>
                    {renderRecommendations()}
                </div>
            </div>
        );
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
                        <div className="login-box">
                            <FaUser className="user-icon" />
                            <input
                                type="text"
                                placeholder="enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                ref={usernameInputRef}
                            />
                            {username === 'adamo25' && (
                                <input
                                    type="password"
                                    placeholder="enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                />
                            )}
                        </div>
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
                        Building a player-led Chess community for Seychelles, and all those connected to it, whether globally or locally. <br/> 
                        Our goal is to be inclusive, connect players, help people learn, and provide opportunities to compete, casually and otherwise. <br/>
                        Join our online leaderboard and compete with friends on the Chess.com ratings across several formats, <br/>
                        And join us our Chess.com club group, to hear about monthly tournaments, <br/>
                        and be part of the growing chess community in Seychelles.
                    </p>
                </div>
                <div className="navbar-content">
                    <p>This project is built by the community, first and foremost.<br/> 
                    So, if you have any notes, suggestions, or friends who want to be featured on the site,<br />
                    feel free to message us on our <a href="https://www.instagram.com/theseychessclub/" target="_blank" rel="noopener noreferrer">Instagram Page</a> for further information.</p>
                </div>
                <div className="navbar-content">
                    <p>This section provides information about upcoming Chess Federation and Seychess tournaments.<br/> 
                    We hope to find a format for players to compete for leaderboard head-to-head points and other competitive aspects.<br/> 
                    We have now started a monthly Seychess Sunday Series, so more info on that on Socials!</p>
                </div>
                <div className="navbar-content center-align">
                    <p>Hey this is just a short section about what we are working on.<br/> 
                    A roadmap for upcoming improvements to the site, or goals for The Seychess Club as a whole.<br />
                    Main goal right now is growing the community, and seeing how the servers handle it hahaha.<br/>
                    Working and seeing what we can do with connecting the people we currently have, to become a club socially. <br/> 
                    And we have also launched the Seychess Sunday series, which is the starting point of competing.<br />
                    After that we will be looking into the aspects of helping players learn and improve with an achievements dashboard. </p>
                </div>
            </div>
            {isLoggedIn && username === 'adamo25' && (
                <button className="admin-toggle-button" onClick={onToggleAdminMode}>
                    Admin View ({isAdminMode ? 'ON' : 'OFF'})
                </button>
            )}
            <button className="floating-button" onClick={handleButtonClick}>
                {isLoggedIn ? 'Your Analytics and Recommendations' : 'Already a member? Login above.'}
                <span className="chart-icon">📊</span>
            </button>
            {isLoggedIn && showModal && (
                <div className="modal" onClick={handleOutsideClick}>
                    <div className="modal-content">
                        {renderOverviewContent()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeroSection;
