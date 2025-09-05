import { NextResponse } from 'next/server';
import { findGame, updateGame } from '@/lib/gameStore';

function calculateWinner(move1: string, move2: string) {
  if (move1 === move2) return 'tie';
  if (
    (move1 === 'rock' && move2 === 'scissors') ||
    (move1 === 'paper' && move2 === 'rock') ||
    (move1 === 'scissors' && move2 === 'paper')
  ) return 'player1';
  return 'player2';
}

export async function POST(request: Request) {
  const { matchId, player, move } = await request.json();
  
  const game = findGame(matchId);
  
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  
  const newMoves = { ...game.moves, [player]: move };
  let result = game.result;
  
  if (newMoves.player1 && newMoves.player2) {
    result = calculateWinner(newMoves.player1, newMoves.player2);
  }
  
  updateGame(matchId, { moves: newMoves, result });
  
  return NextResponse.json({ success: true });
}