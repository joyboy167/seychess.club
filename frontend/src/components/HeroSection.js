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

    const renderProgressPlan = () => {
        const rapidRating = playerStats.chess_rapid?.last?.rating || 0;
        const generalInfo = (
            <div>
                <h4>General Tips for All Levels</h4>
                <ul>
                    <li>Consistent Practice: Playing and analyzing games is the backbone of improvement.</li>
                    <li>Balance in Study: Divide training time among tactics, endgames, middlegame strategy, and openings in a proportion appropriate to your level.</li>
                    <li>Use Chess Tools Wisely: Engines and game review features are great, but always try to understand the reasoning behind moves, not just the raw evaluation.</li>
                    <li>Physical & Mental Well-being: Chess strength is also about focus, energy, and emotional control—take breaks, manage stress, and stay healthy.</li>
                </ul>
            </div>
        );

        const plans = [
            {
                range: "0–300 (Complete Beginners)",
                tips: [
                    "Learn the Rules Thoroughly",
                    "Ensure you fully understand how each piece moves, castling rules, en passant, and check/checkmate.",
                    "Practice setting up basic mates (e.g., checkmate with two rooks, checkmate with one queen).",
                    "Basic Board Awareness",
                    "Identify threats: if the opponent can capture one of your pieces for free, notice it in advance.",
                    "Play Slow or Turn-Based Games",
                    "Give yourself time to think. Rapid or daily games let you practice seeing threats and applying new knowledge without time pressure.",
                    "Simple Tactics",
                    "Start with 1-move or 2-move tactic puzzles. Focus on seeing unguarded pieces and basic forks."
                ]
            },
            {
                range: "300–600",
                tips: [
                    "Avoid Hanging Pieces",
                    "Develop a mental checklist: “Is my opponent threatening anything?” “Am I leaving any piece undefended?”",
                    "Basic Opening Principles",
                    "Bring out minor pieces (knights and bishops) before moving your queen. Control the center (e4, d4, e5, d5 squares).",
                    "Castle early and connect rooks.",
                    "Continue Simplified Tactics",
                    "Practice puzzles focusing on pins, forks, skewers, and simple checkmating patterns.",
                    "Short Games & Review",
                    "Use the Game Review (analysis) on chess.com or other software to see where you drop material or miss simple tactics."
                ]
            },
            {
                range: "600–800",
                tips: [
                    "Refine Opening Principles",
                    "Don’t memorize openings deeply yet, but learn the first few moves of common openings (e.g., Italian Game, Scotch, etc.) and the ideas behind them.",
                    "Basic Endgames",
                    "Practice simple King & Pawn vs. King, King & Queen vs. King, and King & Rook vs. King endgames.",
                    "Knowing these fundamentals ensures you can convert winning positions.",
                    "Tactical Motifs",
                    "Add slightly more complex puzzles: double attacks, discovered attacks, and basic mating nets (like back rank mates).",
                    "Blunder Checking",
                    "Before you make a move, quickly scan for whether you’re leaving a piece en prise or missing your opponent’s threats."
                ]
            },
            {
                range: "800–1000",
                tips: [
                    "Consistent Tactical Training",
                    "Work on tactics daily, focusing on 2–3 move sequences and common patterns.",
                    "Look for forcing moves (checks, captures, threats).",
                    "Basic Strategic Concepts",
                    "Develop all your pieces before launching an attack. Avoid moving the same piece multiple times in the opening.",
                    "Learn to identify weak squares and outposts.",
                    "Endgame Practice",
                    "Add more complex endgames to your practice, like King & Pawn vs. King & Pawn, and basic Rook endgames.",
                    "Game Analysis",
                    "Review your games to understand your mistakes. Focus on why you lost material or missed tactics."
                ]
            },
            {
                range: "1000–1200",
                tips: [
                    "Opening Repertoire",
                    "Start building a basic opening repertoire. Learn the main lines and ideas of a few openings for white and black.",
                    "Intermediate Tactics",
                    "Work on more complex tactics, including multi-move combinations and defensive tactics.",
                    "Positional Play",
                    "Learn about pawn structures, weak squares, and piece activity. Understand the importance of controlling open files and diagonals.",
                    "Endgame Knowledge",
                    "Study more advanced endgames, including opposition, triangulation, and basic Rook endgames.",
                    "Game Analysis",
                    "Analyze your games with a stronger player or coach to identify recurring mistakes and areas for improvement."
                ]
            },
            {
                range: "1200–1400",
                tips: [
                    "Advanced Opening Study",
                    "Deepen your knowledge of your chosen openings. Learn the typical middlegame plans and common traps.",
                    "Advanced Tactics",
                    "Work on complex tactical puzzles and combinations. Focus on calculation and visualization skills.",
                    "Positional Understanding",
                    "Study classic games to understand strategic concepts like pawn breaks, piece coordination, and prophylaxis.",
                    "Endgame Mastery",
                    "Learn advanced endgames, including Rook vs. Rook & Pawn, and minor piece endgames.",
                    "Game Analysis",
                    "Analyze your games in depth, focusing on strategic and tactical mistakes. Use a chess engine to verify your analysis."
                ]
            },
            {
                range: "1400+",
                tips: [
                    "Opening Theory",
                    "Stay up-to-date with the latest opening theory. Study games of top players to learn new ideas and trends.",
                    "Advanced Tactics & Calculation",
                    "Work on complex tactical exercises and calculation drills. Focus on improving your calculation speed and accuracy.",
                    "Positional Play & Strategy",
                    "Study advanced positional concepts, including pawn structures, weak squares, and piece activity. Learn to create and exploit imbalances.",
                    "Endgame Expertise",
                    "Master complex endgames, including Rook vs. Rook & Pawn, minor piece endgames, and advanced pawn endgames.",
                    "Game Analysis & Improvement",
                    "Analyze your games with a coach or stronger player. Focus on identifying and correcting recurring mistakes. Set specific goals for improvement."
                ]
            }
        ];

        const currentPlan = plans.find(plan => {
            const [min, max] = plan.range.split('–').map(Number);
            return rapidRating >= min && rapidRating <= max;
        });

        return (
            <div className="progress-plan">
                {generalInfo}
                {currentPlan && (
                    <div>
                        <h4>Progress Plan for Rapid ELO {currentPlan.range}</h4>
                        <ul>
                            {currentPlan.tips.map((tip, index) => (
                                <li key={index}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
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
                <div className="progress-plan-box">
                    <h4>Progress Plan</h4>
                    {renderProgressPlan()}
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
