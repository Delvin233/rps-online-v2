interface Game {
  matchId: string;
  player1?: string;
  player2?: string;
  status?: string;
  moves?: Record<string, string>;
  result?: string | null;
}

const games: Game[] = [];

export function getGames() {
  return games;
}

export function addGame(game: Game) {
  games.push(game);
}

export function updateGame(matchId: string, updates: Partial<Game>) {
  const index = games.findIndex(g => g.matchId === matchId);
  if (index !== -1) {
    games[index] = { ...games[index], ...updates };
  }
}

export function findGame(matchId: string) {
  return games.find(g => g.matchId === matchId);
}