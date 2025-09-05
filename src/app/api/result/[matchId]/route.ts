import { NextResponse } from 'next/server';
import { findGame } from '@/lib/gameStore';

export async function GET(request: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  
  const game = findGame(matchId);
  
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  
  return NextResponse.json(game);
}