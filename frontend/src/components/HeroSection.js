import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';
import { FaUser, FaBars } from 'react-icons/fa'; // Add FaBars import
import { getPlayerStats, fetchGameStats, fetchPlayerStats } from './analytics.js';
import { useNavigate, Link } from 'react-router-dom';

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
    { username: "Dedicated69", platform: "chesscom", realName: "Naveen Volcere" },
    { username: "GM_Shakthi006", platform: "chesscom", realName: "Shakthi Alexander" },
    { username: "shakthipillay109876543210", platform: "chesscom", realName: "Shakthi Pillay" }
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const usernameInputRef = useRef(null);
    const navigate = useNavigate();

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

    const plans = [
        {
            range: "0–300",
            tips: [
                "Learn the basic rules and piece movements - Focus on one piece at a time and practice their movements on an empty board until it becomes natural",
                "Practice simple checkmates with queen and rook - Start with king and queen vs lone king, then move to king and rook. Use chess.com's practice mode",
                "Focus on not leaving pieces undefended - Before each move, scan the board and ask yourself if any of your pieces could be captured for free",
                "Play longer time control games - Use 15+10 or longer games to give yourself time to think through each move carefully"
            ]
        },
        {
            range: "300–600",
            tips: [
                "Learn basic opening principles - Control the center with pawns and develop your knights and bishops before moving the queen. Watch beginner-friendly opening videos",
                "Practice basic tactics like pins and forks - Do at least 10 puzzle rush survival mode puzzles daily, focusing on these specific patterns",
                "Start solving simple puzzles daily - Set aside 15 minutes each day for tactical training, focusing on one-move and two-move combinations",
                "Review your games for obvious mistakes - After each game, use the analysis feature to find missed captures and basic tactical opportunities"
            ]
        },
        {
            range: "600–800",
            tips: [
                "Study common opening patterns - Pick one opening for white and one for black. Learn the first 5-6 moves and understand why each move is played",
                "Learn basic endgame principles - Practice king and pawn endgames, focusing on opposition and key squares. Use chess.com's endgame drills",
                "Practice tactical patterns daily - Spend 20 minutes on puzzles, focusing on combinations involving multiple pieces and longer sequences",
                "Focus on piece coordination - Look for ways to get your pieces working together. Study games where one side dominates due to better piece placement"
            ]
        },
        {
            range: "800–1000",
            tips: [
                "Build a basic opening repertoire - Learn 2-3 responses against common openings. Study model games in your chosen openings to understand typical plans",
                "Study common middlegame positions - Focus on pawn structures from your openings. Learn typical piece placements and pawn breaks",
                "Improve calculation skills - Practice visualizing 2-3 moves ahead without moving pieces. Use chess.com's vision training exercises",
                "Learn common pawn structures - Study isolated pawns, doubled pawns, and pawn chains. Understand which pieces work well with each structure"
            ]
        },
        {
            range: "1000–1200",
            tips: [
                "Study pawn structures deeply - Learn how to handle isolated pawns, backward pawns, and pawn majorities. Practice recognizing which pawn breaks to use in different positions",
                "Analyze master games in your openings - Find professional games that use your opening repertoire and study the middlegame plans that arise from them",
                "Practice calculation with visualization - Set up complex positions and practice calculating variations without moving pieces. Start with 3-move sequences",
                "Learn positional sacrifices - Study examples where material is traded for lasting positional advantages, like a strong pawn structure or bishop pair"
            ]
        },
        {
            range: "1200–1400",
            tips: [
                "Build an advanced opening repertoire - Learn multiple responses against your opponent's main moves. Study the typical middlegame positions and plans",
                "Master complex endgames - Practice rook endgames with multiple pawns, minor piece endgames, and queen vs pawn endings. Focus on technique",
                "Study strategic themes - Learn about prophylaxis, piece placement, and pawn weaknesses. Practice finding long-term plans in quiet positions",
                "Analyze your games without an engine first - Try to find improvements yourself before checking with the computer to develop independent thinking"
            ]
        },
        {
            range: "1400–1600",
            tips: [
                "Develop concrete calculation skills - Practice solving complex puzzles involving sacrifices and long forcing variations. Aim for 5+ move calculations",
                "Study classical games - Analyze games from great players like Capablanca and Fischer to understand strategic concepts and planning",
                "Create a comprehensive opening system - Build a complete repertoire for both colors with main lines and sidelines. Know the key middlegame plans",
                "Practice time management - Work on decision-making in critical positions, knowing when to calculate deeply vs use intuition"
            ]
        },
        {
            range: "1600–1800",
            tips: [
                "Master complex tactical patterns - Study advanced combinations involving quiet moves, positional sacrifices, and defensive resources",
                "Analyze your losses thoroughly - Focus on identifying the critical moments where the game turned. Work on preventing similar mistakes",
                "Study typical pawn structures deeply - Learn the plans and piece placements for structures like the Carlsbad, hanging pawns, and IQP positions",
                "Practice playing against specific weaknesses - Learn how to exploit weak squares, poor piece placement, and structural weaknesses"
            ]
        },
        {
            range: "1800–2000",
            tips: [
                "Study strategic masterpieces - Analyze deep positional games where one side gradually improves their position. Focus on prophylactic thinking",
                "Perfect your calculation accuracy - Practice solving complex puzzles without moving pieces. Work on candidate moves and elimination methods",
                "Refine your opening preparation - Study recent theoretical developments in your openings. Prepare specific lines against strong players",
                "Master complex endgame techniques - Study theoretical endgames with optimal play. Practice converting small advantages in practical endgames"
            ]
        },
        {
            range: "2000+",
            tips: [
                "Develop personal opening innovations - Look for improvements in your main opening lines. Prepare surprise weapons for important games",
                "Study contemporary games - Analyze recent grandmaster games to stay current with modern playing styles and theoretical developments",
                "Master computer-like precision - Practice finding only moves and critical defensive resources in complex positions",
                "Focus on competitive psychology - Work on maintaining objectivity and finding the best moves regardless of the tournament situation"
            ]
        }
    ];

    const renderProgressPlan = () => {
        const rapidRating = playerStats.chess_rapid?.last?.rating || 0;
        const currentPlan = plans.find(plan => {
            const [min, max] = plan.range.split('–').map(Number);
            return rapidRating >= min && rapidRating <= max;
        });

        return {
            range: currentPlan?.range || "N/A",
            tips: currentPlan?.tips || []
        };
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

    const getRatingRange = (rating) => {
        if (!rating) return "N/A";
        
        for (const plan of plans) {
            const [min, max] = plan.range.split('–').map(Number);
            if (rating >= min && rating <= max) {
                return plan.range;
            }
        }

        // If rating is higher than all defined ranges, return "1400+"
        const highestPlan = plans[plans.length - 1];
        const [highestMin] = highestPlan.range.split('–').map(Number);
        if (rating >= highestMin) {
            return "1400+";
        }

        // If we get here, the rating is lower than the lowest defined range
        const lowestPlan = plans[0];
        const [_, lowestMax] = lowestPlan.range.split('–').map(Number);
        if (rating <= lowestMax) {
            return lowestPlan.range;
        }

        return "N/A";
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
                    <h4>Progress Plan</h4>
                    <h5 className="progress-subtitle">General Tips</h5>
                    <div className="general-tips">
                        <p>Consistent Practice: Playing and analyzing games is the backbone of improvement.</p>
                        <p>Balance in Study: Divide training time among tactics, endgames, middlegame strategy, and openings.</p>
                        <p>Use Chess Tools Wisely: Focus on understanding the reasoning behind moves, not just evaluations.</p>
                    </div>
                    <h5 className="progress-subtitle">Rating-Specific Tips [{getRatingRange(playerStats.chess_rapid?.last?.rating)}]</h5>
                    <ul>
                        {renderProgressPlan().tips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

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
        <div className="hero-section">
            {renderMenu()} {/* Add this line near the top of your JSX */}
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
