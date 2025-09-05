let games: any[] = [];

export function getGames() {
  return games;
}

export function addGame(game: any) {
  games.push(game);
}

export function updateGame(matchId: string, updates: any) {
  const index = games.findIndex(g => g.matchId === matchId);
  if (index !== -1) {
    games[index] = { ...games[index], ...updates };
  }
}

export function findGame(matchId: string) {
  return games.find(g => g.matchId === matchId);
}