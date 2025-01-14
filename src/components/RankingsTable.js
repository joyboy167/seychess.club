import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import playerCompRatings from '../player-comp-ratings.json';

// Player List: Include platform, username, and hardcoded real names
const players = [
    { username: "adamo25", platform: "chesscom", realName: "Adam Furneau" },
    { username: "Mordecai_6", platform: "chesscom", realName: "Darius Hoareau" },
    { username: "MinusE1", platform: "chesscom", realName: "Rudolph Camille" },
    { username: "Jeremy_Raguain", platform: "chesscom", realName: "Jeremy Raguain" },
    { username: "Buumpliz", platform: "chesscom", realName: "Alex Jovanovic" },
    { username: "durupa", platform: "chesscom", realName: "Alexander Durup" },
    { username: "adam8991", platform: "chesscom", realName: "Adam Johnson" },
    { username: "lauvalsez", platform: "chesscom", realName: "Laura Valsez" },
    { username: "seypanda", platform: "chesscom", realName: "New Player" },
    { username: "LC9797", platform: "chesscom", realName: "New Player" },
    { username: "vidhyasahar11", platform: "chesscom", realName: "Vidhya Sahar" }, // New player added
    { username: "barnabysadler", platform: "chesscom", realName: "Barnaby Sadler" } // New player added
];

const RankingsTable = ({ loggedInUsername }) => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'seychelles', direction: 'desc' });

    useEffect(() => {
        fetchAndUpdateRankings();
    }, []);

    useEffect(() => {
        if (rankings.length > 0) {
            sortRankings(sortConfig.key, sortConfig.direction);
        }
    }, [sortConfig]);

    useEffect(() => {
        if (!loading) {
            document.getElementById("rankings-table").scrollIntoView({ behavior: 'smooth' });
        }
    }, [loading]);

    const fetchAndUpdateRankings = async () => {
        try {
            setLoading(true);
            const currentRankings = await fetchCurrentRankings();
            setRankings(currentRankings);
        } catch (error) {
            console.error("Error fetching or updating rankings:", error);
            setRankings([]); // Fallback to an empty array on error
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentRankings = async () => {
        const rankings = await Promise.all(players.map(async (player) => {
            try {
                let ratingData = { rapid: "N/A", blitz: "N/A", bullet: "N/A", puzzle: "N/A", seychelles: "N/A" };
                let avatar = "default-avatar.png"; // Fallback for missing avatars
                let realName = player.realName;

                // Fetch data from Chess.com
                if (player.platform === "chesscom") {
                    const [profileRes, statsRes] = await Promise.all([
                        fetch(`https://api.chess.com/pub/player/${player.username}`),
                        fetch(`https://api.chess.com/pub/player/${player.username}/stats`)
                    ]);

                    if (!profileRes.ok || !statsRes.ok) throw new Error(`Failed to fetch data for ${player.username}`);

                    const profileData = await profileRes.json();
                    const statsData = await statsRes.json();

                    avatar = profileData.avatar || "default-avatar.png";

                    ratingData = {
                        puzzle: statsData.tactics?.highest?.rating || "N/A", // Fetch highest puzzle rating ever
                        bullet: statsData.chess_bullet?.last?.rating || "N/A",
                        blitz: statsData.chess_blitz?.last?.rating || "N/A",
                        rapid: statsData.chess_rapid?.last?.rating || "N/A"
                    };
                }

                // Calculate the SEYCHESS rating
                const seyChessRating = calculateSeyChessRating(ratingData);

                return {
                    name: realName,
                    username: player.username,
                    rank: 0,
                    platform: "Chess.com",
                    avatar,
                    ...ratingData,
                    seychelles: seyChessRating
                };
            } catch (error) {
                console.error(`Error processing ${player.username}:`, error);
                return null; // Handle failure gracefully
            }
        }));

        // Sort rankings and assign ranks
        return rankings.filter(Boolean).sort((a, b) => b.seychelles - a.seychelles).map((player, index) => ({
            ...player,
            rank: index + 1
        }));
    };

    const calculateSeyChessRating = ({ bullet, blitz, rapid, puzzle }) => {
        const calculatedBullet = bullet === "N/A" ? 0 : bullet;
        const calculatedBlitz = blitz === "N/A" ? 0 : blitz;
        const calculatedRapid = rapid === "N/A" ? 0 : rapid;
        const calculatedPuzzle = puzzle === "N/A" ? 0 : puzzle;

        return (calculatedBullet * 0.1) + (calculatedBlitz * 0.3) + (calculatedRapid * 0.5) + (calculatedPuzzle * 0.1);
    };

    const sortRankings = (key, direction) => {
        const sortedRankings = [...rankings].sort((a, b) => {
            const aValue = a[key] === "N/A" ? 0 : a[key];
            const bValue = b[key] === "N/A" ? 0 : b[key];
            if (direction === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });
        setRankings(sortedRankings);
    };

    const handleSort = (key) => {
        setSortConfig((prevConfig) => {
            const newDirection = prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc';
            document.getElementById("sort-order").value = newDirection;
            return { key, direction: newDirection };
        });
        highlightSortedColumn(key);
    };

    const handleHeaderClick = (key, event) => {
        if (!event.target.classList.contains('tooltip-btn')) {
            handleSort(key);
        }
    };

    const highlightSortedColumn = (key) => {
        const columnIndex = {
            'rank': 0,
            'avatar': 1,
            'username': 2,
            'puzzle': 3,
            'bullet': 4,
            'blitz': 5,
            'rapid': 6,
            'seychelles': 7
        }[key];

        const headers = document.querySelectorAll(".rankings-table th");
        const rows = document.querySelectorAll(".rankings-table tbody tr");

        headers.forEach(header => header.classList.remove("sorted-column"));
        rows.forEach(row => {
            Array.from(row.cells).forEach(cell => cell.classList.remove("sorted-column"));
        });

        headers[columnIndex].classList.add("sorted-column");
        rows.forEach(row => {
            row.cells[columnIndex].classList.add("sorted-column");
        });

        if (document.querySelectorAll(".sorted-column").length > 1) {
            removeDefaultStyling();
        }
    };

    const removeDefaultStyling = () => {
        const averageColumnHeader = document.querySelector(".rankings-table th:nth-child(8)");
        const averageColumnCells = document.querySelectorAll(".rankings-table td:nth-child(8)");

        averageColumnHeader.classList.remove("default-average");
        averageColumnCells.forEach(cell => cell.classList.remove("default-average"));
    };

    const getChangeIndicator = (currentValue, previousValue, isRank = false, decimalPlaces = 0, duration = 2.13) => {
        if (previousValue === "N/A" || currentValue === "N/A") return null;
        const change = currentValue - previousValue;
        if (change === 0) return null;
        const arrow = (isRank ? change < 0 : change > 0) ? '▲' : '▼';
        const color = (isRank ? change < 0 : change > 0) ? 'green' : 'red';
        return (
            <span className={`change-indicator ${change > 0 ? 'increase' : 'decrease'}`} style={{ color, fontWeight: 'bold' }}>
                {arrow} <CountUp start={0} end={Math.abs(change)} duration={duration} decimals={decimalPlaces} />
            </span>
        );
    };

    const getPreviousRating = (username, key) => {
        const player = playerCompRatings.players.find(p => p.username === username);
        return player ? player[key] : "N/A";
    };

    return (
        <section className="rankings-section" id="rankings-table">
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <div className="sort-box">
                        <label htmlFor="sort-select">Sort by:</label>
                        <select id="sort-select" onChange={(e) => handleSort(e.target.value)}>
                            <option value="puzzle">Puzzle</option>
                            <option value="bullet">Bullet</option>
                            <option value="blitz">Blitz</option>
                            <option value="rapid">Rapid</option>
                            <option value="seychelles" selected>Average Rating</option>
                        </select>
                        <select id="sort-order" onChange={(e) => setSortConfig({ ...sortConfig, direction: e.target.value })}>
                            <option value="asc">Ascending</option>
                            <option value="desc" selected>Descending</option>
                        </select>
                    </div>
                    <table className="rankings-table">
                        <thead>
                            <tr>
                                <th>RANK</th>
                                <th>AVATAR</th>
                                <th>USERNAME</th>
                                <th onClick={(e) => handleHeaderClick('puzzle', e)}>
                                    PUZZLE
                                    <button className="tooltip-btn" onClick={() => handleSort('puzzle')}>
                                        <span className="tooltip-text">Highest ever puzzle rating (10% of AVG).</span>
                                        ?
                                    </button>
                                </th>
                                <th onClick={(e) => handleHeaderClick('bullet', e)}>
                                    BULLET
                                    <button className="tooltip-btn" onClick={() => handleSort('bullet')}>
                                        <span className="tooltip-text">Rating for fast-paced games under 3 minutes (10% of AVG).</span>
                                        ?
                                    </button>
                                </th>
                                <th onClick={(e) => handleHeaderClick('blitz', e)}>
                                    BLITZ
                                    <button className="tooltip-btn" onClick={() => handleSort('blitz')}>
                                        <span className="tooltip-text">Rating for games lasting 3–10 minutes (30% of AVG).</span>
                                        ?
                                    </button>
                                </th>
                                <th onClick={(e) => handleHeaderClick('rapid', e)}>
                                    RAPID
                                    <button className="tooltip-btn" onClick={() => handleSort('rapid')}>
                                        <span className="tooltip-text">Rating for games lasting 10+ minutes (50% of AVG).</span>
                                        ?
                                    </button>
                                </th>
                                <th className="default-average" onClick={(e) => handleHeaderClick('seychelles', e)}>
                                    AVG. RATING
                                    <button className="tooltip-btn" onClick={() => handleSort('seychelles')}>
                                        <span className="tooltip-text">Average rating calculated using a weighted formula.</span>
                                        ?
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankings.length > 0 ? (
                                rankings.map((player, index) => {
                                    const seychessRating = player.seychelles === "N/A" ? "N/A" : player.seychelles.toFixed(1);
                                    const duration = 2.13; // Increase speed by 25%

                                    let medal = '', medalTooltip = '';
                                    if (player.rank === 1) {
                                        medal = '🥇';
                                        medalTooltip = 'Best Overall';
                                    } else if (player.rank === 2) {
                                        medal = '🥈';
                                        medalTooltip = '2nd Overall';
                                    } else if (player.rank === 3) {
                                        medal = '🥉';
                                        medalTooltip = '3rd Overall';
                                    }

                                    const bestRapid = Math.max(...rankings.map(p => p.rapid === "N/A" ? 0 : p.rapid));
                                    const bestBlitz = Math.max(...rankings.map(p => p.blitz === "N/A" ? 0 : p.blitz));
                                    const bestPuzzle = Math.max(...rankings.map(p => p.puzzle === "N/A" ? 0 : p.puzzle));
                                    const bestBullet = Math.max(...rankings.map(p => p.bullet === "N/A" ? 0 : p.bullet));

                                    let rapidIcon = '', blitzIcon = '', puzzleIcon = '', bulletIcon = '';
                                    let rapidTooltip = '', blitzTooltip = '', puzzleTooltip = '', bulletTooltip = '';
                                    if (player.rapid == bestRapid) {
                                        rapidIcon = '⏱️';
                                        rapidTooltip = 'Best Rapid';
                                    }
                                    if (player.blitz == bestBlitz) {
                                        blitzIcon = '⚡';
                                        blitzTooltip = 'Best Blitz';
                                    }
                                    if (player.puzzle == bestPuzzle) {
                                        puzzleIcon = '🧩';
                                        puzzleTooltip = 'Best Puzzle';
                                    }
                                    if (player.bullet == bestBullet) {
                                        bulletIcon = '🚀';
                                        bulletTooltip = 'Best Bullet';
                                    }

                                    const previousRank = getPreviousRating(player.username, 'rank');
                                    const previousPuzzle = getPreviousRating(player.username, 'puzzle');
                                    const previousBullet = getPreviousRating(player.username, 'bullet');
                                    const previousBlitz = getPreviousRating(player.username, 'blitz');
                                    const previousRapid = getPreviousRating(player.username, 'rapid');
                                    const previousAvgRating = getPreviousRating(player.username, 'avgRating');

                                    return (
                                        <tr key={index} className={player.username === loggedInUsername ? 'highlighted-row' : ''}>
                                            <td>
                                                #{player.rank}
                                                {getChangeIndicator(player.rank, previousRank, true, 0, duration)}
                                            </td>
                                            <td className="avatar-cell">
                                                <img src={player.avatar} alt={`${player.name}'s Avatar`} className="avatar-img" onError={(e) => e.target.src = 'default-avatar.png'} />
                                            </td>
                                            <td>
                                                <a href={`https://www.chess.com/member/${player.username}`} target="_blank" rel="noopener noreferrer">{player.username}</a>
                                                <span className="tooltip">{medal}<span className="tooltip-text">{medalTooltip}</span></span>
                                                <span className="tooltip">{rapidIcon}<span className="tooltip-text">{rapidTooltip}</span></span>
                                                <span className="tooltip">{blitzIcon}<span className="tooltip-text">{blitzTooltip}</span></span>
                                                <span className="tooltip">{puzzleIcon}<span className="tooltip-text">{puzzleTooltip}</span></span>
                                                <span className="tooltip">{bulletIcon}<span className="tooltip-text">{bulletTooltip}</span></span>
                                            </td>
                                            <td>
                                                {player.puzzle === "N/A" ? "N/A" : <CountUp start={0} end={player.puzzle} duration={duration} />}
                                                {getChangeIndicator(player.puzzle, previousPuzzle, false, 0, duration)}
                                            </td>
                                            <td>
                                                {player.bullet === "N/A" ? "N/A" : <CountUp start={0} end={player.bullet} duration={duration} />}
                                                {getChangeIndicator(player.bullet, previousBullet, false, 0, duration)}
                                            </td>
                                            <td>
                                                {player.blitz === "N/A" ? "N/A" : <CountUp start={0} end={player.blitz} duration={duration} />}
                                                {getChangeIndicator(player.blitz, previousBlitz, false, 0, duration)}
                                            </td>
                                            <td>
                                                {player.rapid === "N/A" ? "N/A" : <CountUp start={0} end={player.rapid} duration={duration} />}
                                                {getChangeIndicator(player.rapid, previousRapid, false, 0, duration)}
                                            </td>
                                            <td className="default-average">
                                                {seychessRating === "N/A" ? "N/A" : <CountUp start={0} end={parseFloat(seychessRating)} duration={duration} decimals={1} />}
                                                {getChangeIndicator(seychessRating, previousAvgRating, false, 1, duration)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8">No rankings available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className="change-indicator-note" style={{ textAlign: 'right' }}>
                        <span className="change-indicator increase" style={{ color: 'green' }}>▲</span> <span className="change-indicator decrease" style={{ color: 'red' }}>▼</span> indicate weekly change.
                    </div>
                </div>
            )}
        </section>
    );
};

export default RankingsTable;
