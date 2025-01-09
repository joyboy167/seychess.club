// Player List: Include platform, username, and hardcoded real names
const players = [
    { username: "adamo25", platform: "chesscom", realName: "Adam Furneau" },
    { username: "Mordecai_6", platform: "chesscom", realName: "Darius Hoareau" },
    { username: "MinusE1", platform: "chesscom", realName: "Rudolph Camille" },
    { username: "Jeremy_Raguain", platform: "chesscom", realName: "Jeremy Raguain" },
    { username: "Buumpliz", platform: "chesscom", realName: "Alex Jovanovic" },
    { username: "durupa", platform: "chesscom", realName: "Alexander Durup" },
    { username: "adam8991", platform: "chesscom", realName: "Adam Johnson" }, // New player added
    { username: "lauvalsez", platform: "chesscom", realName: "Laura Valsez" }, // New player added
    { username: "seypanda", platform: "chesscom", realName: "New Player" }, // New player added
    { username: "LC9797", platform: "chesscom", realName: "New Player" } // New player added
];

let isFirstSort = true;

// Fetch Rankings When Page Loads
window.onload = () => {
    fetchAndUpdateRankings().then(() => {
        // Set default sorting to "Average Rating" in descending order
        document.getElementById("sort-select").value = "average";
        document.getElementById("sort-order").value = "desc";
        sortTableByColumn();
    });
};

// Main Function to Fetch and Display Rankings
async function fetchAndUpdateRankings() {
    try {
        // Display loading placeholders
        displayLoadingPlaceholders();

        // Fetch current rankings
        const currentRankings = await fetchCurrentRankings();

        // Replace placeholders with actual rankings
        displayRankingsInChunks(currentRankings);

    } catch (error) {
        console.error("Error fetching or updating rankings:", error);
    }
}

// Display loading placeholders
function displayLoadingPlaceholders() {
    const tableBody = document.getElementById("rankingsBody");
    tableBody.innerHTML = ""; // Clear existing content

    for (let i = 0; i < 8; i++) { // Display 8 placeholder rows
        const placeholderRow = `
            <tr class="loading-placeholder">
                <td><div class="placeholder-text" style="width: 20px; height: 16px; background: #555; border-radius: 4px;"></div></td>
                <td class="avatar-cell">
                    <div class="placeholder-avatar" style="width: 50px; height: 50px; background: #555; border-radius: 50%;"></div>
                </td>
                <td><div class="placeholder-text" style="width: 100px; height: 16px; background: #555; border-radius: 4px;"></div></td>
                <td><div class="placeholder-text" style="width: 40px; height: 16px; background: #555; border-radius: 4px;"></div></td>
                <td><div class="placeholder-text" style="width: 40px; height: 16px; background: #555; border-radius: 4px;"></div></td>
                <td><div class="placeholder-text" style="width: 40px; height: 16px; background: #555; border-radius: 4px;"></div></td>
                <td><div class="placeholder-text" style="width: 40px; height: 16px; background: #555; border-radius: 4px;"></div></td>
                <td><div class="placeholder-text" style="width: 60px; height: 16px; background: #555; border-radius: 4px;"></div></td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", placeholderRow);
    }
}

// Fetch current rankings from Chess.com
async function fetchCurrentRankings() {
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
                    puzzle: statsData.tactics?.highest?.rating || "N/A",
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
}

function calculateSeyChessRating({ bullet, blitz, rapid, puzzle }) {
    const calculatedBullet = bullet === "N/A" ? 0 : bullet;
    const calculatedBlitz = blitz === "N/A" ? 0 : blitz;
    const calculatedRapid = rapid === "N/A" ? 0 : rapid;
    const calculatedPuzzle = puzzle === "N/A" ? 0 : puzzle;

    return (calculatedBullet * 0.1) + (calculatedBlitz * 0.3) + (calculatedRapid * 0.5) + (calculatedPuzzle * 0.1);
}

// Display rankings in the table in chunks
function displayRankingsInChunks(rankings) {
    const tableBody = document.getElementById("rankingsBody");
    tableBody.innerHTML = ""; // Clear placeholders

    const chunkSize = 4; // Number of rows to render at a time
    let currentIndex = 0;

    const bestRapid = Math.max(...rankings.map(player => player.rapid === "N/A" ? 0 : player.rapid));
    const bestBlitz = Math.max(...rankings.map(player => player.blitz === "N/A" ? 0 : player.blitz));
    const bestPuzzle = Math.max(...rankings.map(player => player.puzzle === "N/A" ? 0 : player.puzzle));
    const bestBullet = Math.max(...rankings.map(player => player.bullet === "N/A" ? 0 : player.bullet));

    function renderChunk() {
        const chunk = rankings.slice(currentIndex, currentIndex + chunkSize);
        chunk.forEach(player => {
            const seychessRating = player.seychelles === "N/A" ? "N/A" : player.seychelles.toFixed(1);

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

            const row = `
                <tr>
                    <td>#${player.rank}</td>
                    <td class="avatar-cell">
                        <img 
                            src="${player.avatar}" 
                            alt="${player.name}'s Avatar" 
                            class="avatar-img"
                            onerror="this.src='default-avatar.png';">
                    </td>
                    <td>
                        <a href="https://www.chess.com/member/${player.username}" target="_blank">${player.username}</a>
                        <span class="tooltip">${medal}<span class="tooltip-text">${medalTooltip}</span></span>
                        <span class="tooltip">${rapidIcon}<span class="tooltip-text">${rapidTooltip}</span></span>
                        <span class="tooltip">${blitzIcon}<span class="tooltip-text">${blitzTooltip}</span></span>
                        <span class="tooltip">${puzzleIcon}<span class="tooltip-text">${puzzleTooltip}</span></span>
                        <span class="tooltip">${bulletIcon}<span class="tooltip-text">${bulletTooltip}</span></span>
                    </td>
                    <td>${player.puzzle === "N/A" ? "N/A" : player.puzzle}</td>
                    <td>${player.bullet === "N/A" ? "N/A" : player.bullet}</td>
                    <td>${player.blitz === "N/A" ? "N/A" : player.blitz}</td>
                    <td>${player.rapid === "N/A" ? "N/A" : player.rapid}</td>
                    <td class="default-average">${seychessRating}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

        currentIndex += chunkSize;
        if (currentIndex < rankings.length) {
            requestAnimationFrame(renderChunk);
        }
    }

    requestAnimationFrame(renderChunk);
}

// Sorting function based on selected column and order
function sortTableByColumn() {
    const table = document.querySelector('.rankings-table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const sortSelect = document.getElementById('sort-select');
    const sortOrder = document.getElementById('sort-order').value;
    const column = sortSelect.value;

    const columnIndex = {
        'puzzle': 3,
        'bullet': 4,
        'blitz': 5,
        'rapid': 6,
        'average': 7
    }[column];

    const sortedRows = rows.sort((a, b) => {
        const aText = a.children[columnIndex].textContent;
        const bText = b.children[columnIndex].textContent;
        const aValue = parseInt(aText, 10);
        const bValue = parseInt(bText, 10);

        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    tbody.innerHTML = '';
    sortedRows.forEach(row => tbody.appendChild(row));

    highlightSortedColumn(columnIndex);
}

// Highlight the sorted column
function highlightSortedColumn(columnIndex) {
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
}

// Remove the default styling for the average rating column
function removeDefaultStyling() {
    const averageColumnHeader = document.querySelector(".rankings-table th:nth-child(8)");
    const averageColumnCells = document.querySelectorAll(".rankings-table td:nth-child(8)");

    averageColumnHeader.classList.remove("default-average");
    averageColumnCells.forEach(cell => cell.classList.remove("default-average"));
}

// Sorting function
function sortTable(columnIndex, type, order) {
    const table = document.querySelector(".rankings-table tbody");
    const rows = Array.from(table.rows);

    const sortedRows = rows.sort((a, b) => {
        const aText = a.cells[columnIndex].innerText;
        const bText = b.cells[columnIndex].innerText;

        if (type === "number") {
            return order === "asc" ? parseFloat(aText) - parseFloat(bText) : parseFloat(bText) - parseFloat(aText);
        } else if (type === "string") {
            return order === "asc" ? aText.localeCompare(bText) : bText.localeCompare(aText);
        }
    });

    sortedRows.forEach(row => table.appendChild(row));
}

// Navbar functionality
document.addEventListener("DOMContentLoaded", () => {
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
});
