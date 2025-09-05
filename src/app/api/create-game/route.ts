import { NextResponse } from 'next/server';
import { addGame } from '@/lib/gameStore';

export async function POST() {
  const matchId = Math.random().toString(36).substring(2, 8);
  
  const newGame = {
    matchId,
    player1: true,
    player2: false,
    moves: {},
    result: null
  };
  
  addGame(newGame);
  
  return NextResponse.json({ matchId });
}