async function fetchPlayerGames(username) {
    const now = new Date();
    const last7Days = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // Calculate 7 days before the current date
    const year = last7Days.getFullYear();
    const month = ('0' + (last7Days.getMonth() + 1)).slice(-2);

    const response = await fetch(`https://api.chess.com/pub/player/${username}/games/${year}/${month}`);
    const data = await response.json();
    return data.games;
}

function tallyWinsLosses(games, username) {
    const tally = {
        rapid: { wins: 0, losses: 0 },
        blitz: { wins: 0, losses: 0 },
        bullet: { wins: 0, losses: 0 }
    };

    games.forEach(game => {
        const { time_class, white, black } = game;
        if (['rapid', 'blitz', 'bullet'].includes(time_class)) {
            const result = white.username === username ? white.result : black.result;
            if (result === 'win') {
                tally[time_class].wins += 1;
            } else if (result === 'checkmated' || result === 'timeout' || result === 'resigned') {
                tally[time_class].losses += 1;
            }
        }
    });

    return tally;
}

async function getPlayerStats(username) {
    const games = await fetchPlayerGames(username);
    return tallyWinsLosses(games, username);
}

async function fetchGameStats(username) {
    const response = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
    const data = await response.json();
    const latestArchiveUrl = data.archives[data.archives.length - 1];
    const latestGamesResponse = await fetch(latestArchiveUrl);
    const latestGamesData = await latestGamesResponse.json();
    return latestGamesData.games.filter(game => game.time_class === 'rapid').slice(-10);
}

async function fetchPlayerStats(username) {
    const response = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
    return await response.json();
}

export { getPlayerStats, fetchGameStats, fetchPlayerStats };
