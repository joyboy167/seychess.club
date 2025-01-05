// Player List: Include platform, username, and hardcoded real names
const players = [
    { username: "adamo25", platform: "chesscom", realName: "Adam Furneau" },
    { username: "Mordecai_6", platform: "chesscom", realName: "Darius Hoareau" },
    { username: "MinusE1", platform: "chesscom", realName: "Rudolph Camille" },
    { username: "Jeremy_Raguain", platform: "chesscom", realName: "Jeremy Raguain" },
    { username: "Buumpliz", platform: "chesscom", realName: "Alex Jovanovic" },
    { username: "durupa", platform: "chesscom", realName: "Alexander Durup" },
    { username: "adam8991", platform: "chesscom", realName: "Adam Johnson" }, // New player added
    { username: "lauvalsez", platform: "chesscom", realName: "Laura Valsez" }  // New player added
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
    const rankings = [];

    for (let player of players) {
        try {
            let ratingData = { rapid: "N/A", blitz: "N/A", bullet: "N/A", puzzle: "N/A", seychelles: "N/A" };
            let avatar = "default-avatar.png"; // Fallback for missing avatars
            let realName = player.realName;

            // Fetch data from Chess.com
            if (player.platform === "chesscom") {
                const profileRes = await fetch(`https://api.chess.com/pub/player/${player.username}`);
                if (!profileRes.ok) throw new Error(`Failed to fetch profile for ${player.username}`);
                const profileData = await profileRes.json();

                avatar = profileData.avatar || "default-avatar.png";

                const statsRes = await fetch(`https://api.chess.com/pub/player/${player.username}/stats`);
                if (!statsRes.ok) throw new Error(`Failed to fetch stats for ${player.username}`);
                const statsData = await statsRes.json();

                ratingData = {
                    rapid: statsData.chess_rapid?.last?.rating || "N/A",
                    blitz: statsData.chess_blitz?.last?.rating || "N/A",
                    bullet: statsData.chess_bullet?.last?.rating || "N/A",
                    puzzle: statsData.tactics?.highest?.rating || "N/A"
                };
            }

            // Use 0 for calculation if value is N/A
            const calculatedBullet = ratingData.bullet === "N/A" ? 0 : ratingData.bullet;
            const calculatedBlitz = ratingData.blitz === "N/A" ? 0 : ratingData.blitz;
            const calculatedRapid = ratingData.rapid === "N/A" ? 0 : ratingData.rapid;

            // Calculate the SEYCHESS rating with the updated weighted formula
            const seyChessRating = (calculatedBullet * 0.05) + (calculatedBlitz * 0.25) + (calculatedRapid * 0.7);

            // Push the processed data
            rankings.push({
                name: realName,
                username: player.username,
                rank: 0,
                platform: "Chess.com",
                avatar: avatar,
                bullet: ratingData.bullet,
                blitz: ratingData.blitz,
                rapid: ratingData.rapid,
                puzzle: ratingData.puzzle,
                seychelles: seyChessRating
            });
        } catch (error) {
            console.error(`Error processing ${player.username}:`, error);
        }
    }

    rankings.sort((a, b) => b.seychelles - a.seychelles); // Sort by SEYCHESS rating
    rankings.forEach((player, index) => (player.rank = index + 1));

    return rankings;
}

// Display rankings in the table in chunks
function displayRankingsInChunks(rankings) {
    const tableBody = document.getElementById("rankingsBody");
    tableBody.innerHTML = ""; // Clear placeholders

    const chunkSize = 4; // Number of rows to render at a time
    let currentIndex = 0;

    function renderChunk() {
        const chunk = rankings.slice(currentIndex, currentIndex + chunkSize);
        chunk.forEach(player => {
            // Format SeyChess rating to 1 decimal place unless it's "N/A"
            const seychessRating = player.seychelles === "N/A" ? "N/A" : player.seychelles.toFixed(1);

            const row = `
                <tr>
                    <td>${player.rank}</td>
                    <td class="avatar-cell">
                        <img 
                            src="${player.avatar}" 
                            alt="${player.name}'s Avatar" 
                            class="avatar-img"
                            onerror="this.src='default-avatar.png';">
                    </td>
                    <td><a href="https://www.chess.com/member/${player.username}" target="_blank">${player.username}</a></td>
                    <td>${player.bullet === "N/A" ? "N/A" : player.bullet}</td>
                    <td>${player.blitz === "N/A" ? "N/A" : player.blitz}</td>
                    <td>${player.rapid === "N/A" ? "N/A" : player.rapid}</td>
                    <td>${player.puzzle === "N/A" ? "N/A" : player.puzzle}</td>
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
    const sortSelect = document.getElementById("sort-select");
    const sortOrder = document.getElementById("sort-order").value;
    const sortValue = sortSelect.value;
    let columnIndex;

    switch (sortValue) {
        case "bullet":
            columnIndex = 3;
            break;
        case "blitz":
            columnIndex = 4;
            break;
        case "rapid":
            columnIndex = 5;
            break;
        case "puzzle":
            columnIndex = 6;
            break;
        case "average":
            columnIndex = 7;
            break;
        default:
            return;
    }

    sortTable(columnIndex, "number", sortOrder);
    highlightSortedColumn(columnIndex);

    if (isFirstSort) {
        isFirstSort = false;
    }
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

    // Append sorted rows back to the table
    sortedRows.forEach(row => table.appendChild(row));
}

// Highlight the sorted column
function highlightSortedColumn(columnIndex) {
    const headers = document.querySelectorAll(".rankings-table th");
    const rows = document.querySelectorAll(".rankings-table tbody tr");

    // Remove the sorted-column class from all headers and cells
    headers.forEach(header => header.classList.remove("sorted-column"));
    rows.forEach(row => {
        Array.from(row.cells).forEach(cell => cell.classList.remove("sorted-column"));
    });

    // Add the sorted-column class to the sorted header and cells
    headers[columnIndex].classList.add("sorted-column");
    rows.forEach(row => {
        row.cells[columnIndex].classList.add("sorted-column");
    });

    // Ensure only one column is highlighted at a time
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

document.addEventListener("DOMContentLoaded", () => {
    const navbarItems = document.querySelectorAll(".navbar-item");
    const navbarContents = document.querySelectorAll(".navbar-content");

    // Hide all navbar contents initially
    navbarContents.forEach(content => content.classList.remove("active"));

    navbarItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            const isActive = navbarItems[index].classList.contains("active");
            navbarItems.forEach(navItem => navItem.classList.remove("active"));
            navbarContents.forEach(content => content.classList.remove("active"));

            if (!isActive) {
                navbarItems[index].classList.add("active");
                navbarContents[index].classList.add("active");
            }
        });
    });
});
