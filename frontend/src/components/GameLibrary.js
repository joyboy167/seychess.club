import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaChevronDown, FaChevronRight, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const GameLibrary = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(2025);
    const [selectedMonth, setSelectedMonth] = useState('April');
    const [selectedChallenge, setSelectedChallenge] = useState('April Challenge (Rapid - National)');
    const [expandedYear, setExpandedYear] = useState(null);
    const [expandedMonth, setExpandedMonth] = useState(null);
    const [expandedChallenge, setExpandedChallenge] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null);
    const [game] = useState(new Chess());
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [position, setPosition] = useState(game.fen());

    // Update the game data with correct moves
    const gameData = {
        board2: {
            white: "Robin Bonne",
            black: "Adam Furneau",
            moves: [
                "d4", "d5",
                "Nf3", "e6",
                "c4", "c6",
                "Nc3", "Nf6",
                "Bg5", "Be7",
                "e3", "Nbd7",
                "Be2", "Bb4",
                "O-O", "Bxc3",
                "bxc3", "h6",
                "Bh4", "Qa5",
                "Qb3", "Ne4",
                "Qb4", "Qxb4",
                "cxb4", "Ndf6",
                "Bxf6", "gxf6",
                "cxd5", "cxd5",
                "Bb5+", "Bd7",
                "Bxd7+", "Kxd7",
                "Rfc1", "b5",
                "Rc2", "Rab8",
                "Rac1", "Rb7",
                "Ne1", "Rg8",
                "Nd3", "Ke7",
                "Rc7+", "Rxc7",
                "Rxc7+", "Kd6",
                "Rxa7", "Rg7",
                "Ra6+", "Kc7",
                "Ra7+", "Kb6",
                "Rd7", "h5",
                "Nc5", "Ng5",
                "f4", "Nf3+",
                "Kf2", "Nh4",
                "g3", "Nf5",
                "Nxe6", "fxe6",
                "Rxg7", "Nxg7",
                "Ke2", "Nf5",
                "Kd3", "h4",
                "g4", "Nh6",
                "h3", "f5",
                "g5", "Nf7",
                "Kc3", "Kc6",
                "Kb3", "Kd7",
                "a4", "bxa4",
                "Kxa4", "Nd6", 
                "Ka5", "Nc4+",
                "Ka6", "Nxe3",
                "b5", "Kc7",
                "g6", "Nc4",
                "g7", "Nd6",
                "1-0"
            ]
        }
    };

    useEffect(() => {
        if (selectedGame) {
            // Reset game when a new game is selected
            game.reset();
            setPosition(game.fen());
            setCurrentMoveIndex(0);
        }
    }, [selectedGame]);

    useEffect(() => {
        // Add keyboard event listener
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedGame, currentMoveIndex]);

    const handleKeyDown = (e) => {
        if (!selectedGame) return;

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            if (e.key === 'ArrowLeft') {
                handlePreviousMove();
            } else {
                handleNextMove();
            }
        }
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

    const handleYearClick = (year) => {
        setSelectedYear(year);
    };

    const handleMonthClick = (month) => {
        setSelectedMonth(month);
    };

    const handleChallengeClick = (challenge) => {
        setSelectedChallenge(challenge);
    };

    const handleYearToggle = (year) => {
        setExpandedYear(expandedYear === year ? null : year);
    };

    const handleMonthToggle = (month) => {
        setExpandedMonth(expandedMonth === month ? null : month);
    };

    const handleChallengeToggle = (challenge) => {
        setExpandedChallenge(expandedChallenge === challenge ? null : challenge);
    };

    const handleGameSelect = (gameId) => {
        setSelectedGame(gameId);
        // Reset the game to initial position
        game.reset();
        setPosition(game.fen());
        setCurrentMoveIndex(0);
    };

    const handleNextMove = () => {
        if (selectedGame && currentMoveIndex < gameData[selectedGame].moves.length) {
            try {
                game.move(gameData[selectedGame].moves[currentMoveIndex]);
                setPosition(game.fen());
                setCurrentMoveIndex(currentMoveIndex + 1);
            } catch (error) {
                console.error("Invalid move:", error);
            }
        }
    };

    const handlePreviousMove = () => {
        if (currentMoveIndex > 0) {
            game.undo();
            setPosition(game.fen());
            setCurrentMoveIndex(currentMoveIndex - 1);
        }
    };

    const handleMoveClick = (index) => {
        game.reset();
        for (let i = 0; i <= index; i++) {
            try {
                game.move(gameData[selectedGame].moves[i]);
            } catch (error) {
                console.error("Invalid move:", error);
                break;
            }
        }
        setPosition(game.fen());
        setCurrentMoveIndex(index + 1);
    };

    return (
        <div className="game-library">
            {renderMenu()}
            <div className="game-library-container">
                {/* Left Sidebar */}
                <div className="game-library-sidebar">
                    <div className="nav-item nav-year" onClick={() => handleYearToggle(2025)}>
                        <span className="nav-icon">
                            {expandedYear === 2025 ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                        2025
                    </div>
                    
                    {expandedYear === 2025 && (
                        <div className="nav-month-container">
                            <div className="nav-item nav-month" onClick={() => handleMonthToggle('April')}>
                                <span className="nav-icon">
                                    {expandedMonth === 'April' ? <FaChevronDown /> : <FaChevronRight />}
                                </span>
                                April
                            </div>

                            {expandedMonth === 'April' && (
                                <div className="nav-challenge-container">
                                    <div className="nav-item nav-challenge" onClick={() => handleChallengeToggle('April Challenge')}>
                                        <span className="nav-icon">
                                            {expandedChallenge === 'April Challenge' ? <FaChevronDown /> : <FaChevronRight />}
                                        </span>
                                        April Challenge (Rapid - National)
                                    </div>

                                    {expandedChallenge === 'April Challenge' && (
                                        <div className="nav-game-container">
                                            <div 
                                                className={`nav-item nav-game ${selectedGame === 'board2' ? 'active' : ''}`}
                                                onClick={() => handleGameSelect('board2')}
                                            >
                                                Round 1, Board 2: Adam Furneau vs Robin Bonne
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Center - Chessboard */}
                <div className="game-library-main">
                    <div className="chessboard-container">
                        {selectedGame ? (
                            <>
                                <div className="game-info">
                                    <span className="white-player">{gameData[selectedGame].white}</span>
                                    <span className="vs">vs</span>
                                    <span className="black-player">{gameData[selectedGame].black}</span>
                                </div>
                                <div className="chessboard">
                                    <Chessboard 
                                        position={position}
                                        boardWidth={500}
                                        areArrowsAllowed={false}
                                        customBoardStyle={{
                                            borderRadius: '4px',
                                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                                        }}
                                    />
                                </div>
                                <div className="move-controls">
                                    <button 
                                        className="control-button"
                                        onClick={handlePreviousMove}
                                        disabled={currentMoveIndex === 0}
                                    >
                                        <FaArrowLeft />
                                    </button>
                                    <button 
                                        className="control-button"
                                        onClick={handleNextMove}
                                        disabled={currentMoveIndex >= gameData[selectedGame].moves.length}
                                    >
                                        <FaArrowRight />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="no-game-selected">
                                Select a game to view the board
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Moves */}
                <div className="game-library-moves">
                    <div className="moves-header">Game Moves</div>
                    {selectedGame ? (
                        <div className="moves-list">
                            {gameData[selectedGame].moves.map((move, index) => (
                                <React.Fragment key={index}>
                                    {index % 2 === 0 && (
                                        <div className="move-number">{Math.floor(index / 2) + 1}.</div>
                                    )}
                                    <div 
                                        className={`move ${index === currentMoveIndex - 1 ? 'active-move' : ''}`}
                                        onClick={() => handleMoveClick(index)}
                                    >
                                        {move}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        <div className="no-moves-message">Select a game to view moves</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameLibrary;
