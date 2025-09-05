import { NextResponse } from 'next/server';
import { findGame, updateGame } from '@/lib/gameStore';

export async function POST(request: Request) {
  const { matchId } = await request.json();
  
  const game = findGame(matchId);
  
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  
  if (game.player2) {
    return NextResponse.json({ error: 'Game full' }, { status: 400 });
  }
  
  updateGame(matchId, { player2: true });
  
  return NextResponse.json({ success: true });
}