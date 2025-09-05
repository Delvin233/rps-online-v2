'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function GamePage({ params }: { params: Promise<{ roomId: string }> }) {
  const { address, isConnected } = useAccount();
  const [room, setRoom] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [autoResetTriggered, setAutoResetTriggered] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setRoomId(resolvedParams.roomId);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (address) {
      fetch(`/api/username?address=${address}`)
        .then(res => res.json())
        .then(data => {
          if (data.username) {
            setUsername(data.username);
          }
        });
    }
  }, [address]);

  const playAgain = async () => {
    if (!address || !roomId) return;
    
    setSelectedMove(null);
    
    try {
      const response = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', roomId, address })
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoom(data.room);
      } else {
        console.error('Failed to reset game:', await response.text());
      }
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    
    const fetchRoom = async () => {
      const response = await fetch(`/api/room?roomId=${roomId}`);
      const data = await response.json();
      setRoom(data.room);
      
      // Auto-reset if tie (only once per tie)
      if (data.room?.status === 'finished' && data.room?.result?.winner === 'tie' && !autoResetTriggered && address) {
        setAutoResetTriggered(true);
        setTimeout(() => {
          if (address) {
            playAgain();
          }
        }, 3000); // 3 second delay to show tie result
      }
      
      // Reset auto-reset flag when game resets
      if (data.room?.status === 'ready') {
        setAutoResetTriggered(false);
      }
    };
    
    fetchRoom();
    
    // Poll for game updates
    const interval = setInterval(fetchRoom, 2000);
    return () => clearInterval(interval);
  }, [roomId, address, autoResetTriggered, playAgain]);

  const makeMove = async (move: 'rock' | 'paper' | 'scissors') => {
    setSelectedMove(move);
    
    const response = await fetch('/api/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'move', roomId, address, move })
    });
    
    if (response.ok) {
      const data = await response.json();
      setRoom(data.room);
    }
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const endMatch = async () => {
    const response = await fetch('/api/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end', roomId, address })
    });
    
    if (response.ok) {
      const data = await response.json();
      setRoom(data.room);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 max-w-2xl w-full text-center">
          <h1 className="text-2xl mb-4 text-white">RPS-ONCHAIN</h1>
          <p className="text-gray-300 text-sm mb-6">CONNECT WALLET TO PLAY</p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 max-w-2xl w-full text-center">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 max-w-2xl w-full text-center">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl text-white hover:text-gray-300">
              RPS-ONCHAIN
            </Link>
            <span className="text-gray-300 text-sm">
              Welcome <span className="font-bold text-white">{username || 'User'}</span>
            </span>
          </div>
          <ConnectButton showBalance={false} />
        </div>

        <div className="space-y-6 max-w-md mx-auto">
          {!gameStarted ? (
            <>
              <div className="bg-green-600 p-4 rounded">
                <h2 className="text-white text-xl font-bold mb-2">ROOM READY!</h2>
                <p className="text-white text-sm">Room ID: {roomId}</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded text-left">
                <h3 className="text-white text-sm font-bold mb-3">PLAYERS:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300 text-sm">Creator:</span>
                    <span className="text-white text-sm font-bold">{room.creatorUsername}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300 text-sm">Joiner:</span>
                    <span className="text-white text-sm font-bold">{room.joinerUsername}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 text-sm font-bold rounded"
              >
                START GAME
              </button>
            </>
          ) : room?.status === 'ended' ? (
            <>
              <div className="bg-red-600 p-4 rounded">
                <h2 className="text-white text-xl font-bold mb-2">MATCH ENDED</h2>
                <p className="text-white text-sm">One player ended the match</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded text-center">
                <p className="text-gray-300 text-sm">Thanks for playing!</p>
                <p className="text-gray-300 text-xs mt-1">Room ID: {roomId}</p>
              </div>
            </>
          ) : room?.status === 'finished' ? (
            <>
              <div className={`p-4 rounded ${
                room.result?.winner === 'tie' ? 'bg-yellow-600' :
                (room.result?.winner === 'creator' && address === room.creator) ||
                (room.result?.winner === 'joiner' && address === room.joiner)
                  ? 'bg-green-600' : 'bg-red-600'
              }`}>
                <h2 className="text-white text-xl font-bold mb-2">
                  {room.result?.winner === 'tie' ? 'TIE!' :
                   (room.result?.winner === 'creator' && address === room.creator) ||
                   (room.result?.winner === 'joiner' && address === room.joiner)
                     ? 'YOU WIN!' : 'YOU LOSE!'}
                </h2>
                {room.result?.winner === 'tie' && (
                  <p className="text-white text-sm">Auto-restarting in 3 seconds...</p>
                )}
              </div>
              
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="text-white text-sm font-bold mb-3">MOVES:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300 text-sm">{room.creatorUsername}:</span>
                    <span className="text-white text-sm font-bold uppercase">{room.result?.creatorMove}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300 text-sm">{room.joinerUsername}:</span>
                    <span className="text-white text-sm font-bold uppercase">{room.result?.joinerMove}</span>
                  </div>
                </div>
              </div>
              
              {room.result?.winner !== 'tie' && (
                <div className="space-y-2">
                  <button
                    onClick={playAgain}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 text-sm font-bold rounded"
                  >
                    PLAY AGAIN
                  </button>
                  <button
                    onClick={endMatch}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 text-sm font-bold rounded"
                  >
                    END MATCH
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-blue-600 p-4 rounded">
                <h2 className="text-white text-xl font-bold mb-2">MAKE YOUR MOVE</h2>
                <p className="text-white text-sm">Choose Rock, Paper, or Scissors</p>
              </div>
              
              {selectedMove ? (
                <div className="bg-yellow-600 p-4 rounded">
                  <p className="text-white text-sm font-bold">MOVE SELECTED: {selectedMove.toUpperCase()}</p>
                  <p className="text-white text-xs mt-1">Waiting for opponent...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {['rock', 'paper', 'scissors'].map((move) => (
                    <button
                      key={move}
                      onClick={() => makeMove(move as 'rock' | 'paper' | 'scissors')}
                      className="w-full bg-gray-600 hover:bg-gray-500 text-white py-4 px-6 text-lg font-bold rounded uppercase"
                    >
                      {move}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          
          <Link href="/play">
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 text-sm rounded">
              BACK TO LOBBY
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}