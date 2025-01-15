import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import playerCompRatings from '../player-comp-ratings.json';

const HeroSection = ({ onLogin }) => {
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [isLoggedIn, setIsLoggedIn] = useState(!!username);
    const [showModal, setShowModal] = useState(false);
    const [gameStats, setGameStats] = useState([]);
    const [playerStats, setPlayerStats] = useState({});

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

    const fetchGameStats = async () => {
        try {
            const response = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
            const data = await response.json();
            const latestArchiveUrl = data.archives[data.archives.length - 1];
            const latestGamesResponse = await fetch(latestArchiveUrl);
            const latestGamesData = await latestGamesResponse.json();
            const rapidGames = latestGamesData.games.filter(game => game.time_class === 'rapid').slice(-10);
            setGameStats(rapidGames);
        } catch (error) {
            console.error("Error fetching game stats:", error);
        }
    };

    const fetchPlayerStats = async () => {
        try {
            const response = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
            const data = await response.json();
            setPlayerStats(data);
        } catch (error) {
            console.error("Error fetching player stats:", error);
        }
    };

    const handleButtonClick = () => {
        setShowModal(true);
        fetchGameStats();
        fetchPlayerStats();
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleOutsideClick = (e) => {
        if (e.target.classList.contains('modal')) {
            handleCloseModal();
        }
    };

    const renderOverviewContent = () => {
        const { wins, losses, draws } = calculateWinLossDraw();
        return (
            <div className="overview-content">
                <h3>Overview</h3>
                <p>Username: {username}</p>
                <p>
                    Win/Loss/Draw (Last 30 Games): 
                    <span className="win"> {wins}</span> / 
                    <span className="loss"> {losses}</span> / 
                    <span className="draw"> {draws}</span>
                </p>
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

    const calculateWinLossDraw = () => {
        const last30Games = gameStats.slice(-30);
        let wins = 0, losses = 0, draws = 0;
        last30Games.forEach(game => {
            const result = game.white.username === username ? game.white.result : game.black.result;
            if (result === 'win') wins++;
            else if (result === 'loss') losses++;
            else if (result === 'draw') draws++;
        });
        return { wins, losses, draws };
    };

    const calculateAverageRating = () => {
        const ratings = [
            playerStats.tactics?.highest?.rating || 0,
            playerStats.chess_bullet?.last?.rating || 0,
            playerStats.chess_blitz?.last?.rating || 0,
            playerStats.chess_rapid?.last?.rating || 0
        ];
        const validRatings = ratings.filter(rating => rating !== 0);
        if (validRatings.length === 0) return "N/A";
        const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
        return (sum / validRatings.length).toFixed(1);
    };

    const renderRatingBox = (label, currentRating, previousRating, isAverage = false) => {
        const changeIndicator = getChangeIndicator(currentRating, previousRating);
        return (
            <div className={`rating-box ${isAverage ? 'average-rating' : ''}`}>
                <div className="rating-box-title">
                    <h4>{label}</h4>
                </div>
                <div className="rating-box-rating">
                    <p>{currentRating === "N/A" ? "N/A" : <CountUp start={0} end={currentRating} duration={2.13} />}</p>
                    {changeIndicator}
                </div>
            </div>
        );
    };

    const getChangeIndicator = (currentValue, previousValue) => {
        if (previousValue === "N/A" || currentValue === "N/A") return null;
        const change = currentValue - previousValue;
        if (change === 0) return null;
        const arrow = change > 0 ? '▲' : '▼';
        const color = change > 0 ? 'green' : 'red';
        return (
            <span className={`change-indicator ${change > 0 ? 'increase' : 'decrease'}`} style={{ color, fontWeight: 'bold' }}>
                {arrow} {Math.abs(change)}
            </span>
        );
    };

    const getPreviousRating = (key) => {
        const player = playerCompRatings.players.find(p => p.username === username);
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
            {isLoggedIn && (
                <>
                    <button className="floating-button" onClick={handleButtonClick}>
                        Your Analytics and Recommendations
                        <span className="chart-icon">📊</span>
                    </button>
                    {showModal && (
                        <div className="modal" onClick={handleOutsideClick}>
                            <div className="modal-content">
                                {renderOverviewContent()}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HeroSection;
