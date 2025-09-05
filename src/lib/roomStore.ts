interface Room {
  id: string;
  creator: string;
  creatorUsername: string;
  joiner?: string;
  joinerUsername?: string;
  status: 'waiting' | 'ready' | 'playing' | 'finished' | 'ended';
  createdAt: number;
  moves?: {
    creator?: 'rock' | 'paper' | 'scissors';
    joiner?: 'rock' | 'paper' | 'scissors';
  };
  result?: {
    winner: 'creator' | 'joiner' | 'tie';
    creatorMove: string;
    joinerMove: string;
  };
}

const rooms = new Map<string, Room>();

export function createRoom(id: string, creator: string, creatorUsername: string): Room {
  const room: Room = {
    id,
    creator,
    creatorUsername,
    status: 'waiting',
    createdAt: Date.now()
  };
  rooms.set(id, room);
  return room;
}

export function joinRoom(id: string, joiner: string, joinerUsername: string): Room | null {
  const room = rooms.get(id);
  if (!room || room.status !== 'waiting') return null;
  
  room.joiner = joiner;
  room.joinerUsername = joinerUsername;
  room.status = 'ready';
  return room;
}

export function getRoom(id: string): Room | null {
  return rooms.get(id) || null;
}

export function getAllRooms(): Room[] {
  return Array.from(rooms.values());
}

export function resetGame(roomId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.status === 'ended') return null;
  
  room.moves = {};
  room.result = undefined;
  room.status = 'ready';
  return room;
}

export function endMatch(roomId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  
  room.status = 'ended';
  return room;
}

export function makeMove(roomId: string, player: string, move: 'rock' | 'paper' | 'scissors'): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.status !== 'ready') return null;
  
  if (!room.moves) room.moves = {};
  
  if (player === room.creator) {
    room.moves.creator = move;
  } else if (player === room.joiner) {
    room.moves.joiner = move;
  } else {
    return null;
  }
  
  // Check if both players made moves
  if (room.moves.creator && room.moves.joiner) {
    room.result = calculateWinner(room.moves.creator, room.moves.joiner);
    room.status = 'finished';
  }
  
  return room;
}

function calculateWinner(creatorMove: string, joinerMove: string) {
  if (creatorMove === joinerMove) {
    return { winner: 'tie' as const, creatorMove, joinerMove };
  }
  
  const winConditions = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };
  
  if (winConditions[creatorMove as keyof typeof winConditions] === joinerMove) {
    return { winner: 'creator' as const, creatorMove, joinerMove };
  } else {
    return { winner: 'joiner' as const, creatorMove, joinerMove };
  }
}