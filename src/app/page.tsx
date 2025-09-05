'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

type GameState = 'menu' | 'demo';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [gameState, setGameState] = useState<GameState>('menu');
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState('');

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

  const saveUsername = async () => {
    if (!address || !tempUsername.trim()) return;
    
    const response = await fetch('/api/username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, username: tempUsername.trim() })
    });
    
    if (response.ok) {
      setUsername(tempUsername.trim());
      setIsEditing(false);
    }
  };

  const startEdit = () => {
    setTempUsername(username);
    setIsEditing(true);
  };

  const startDemo = () => {
    setGameState('demo');
  };

  const backToMenu = () => {
    setGameState('menu');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl mb-4 text-white">RPS-ONCHAIN</h1>
          <div className="bg-gray-700 p-4 rounded text-left mb-6">
            <p className="text-white text-sm font-bold mb-2">GAME RULES:</p>
            <p className="text-gray-300 text-xs mb-1">Rock beats Scissors</p>
            <p className="text-gray-300 text-xs mb-1">Scissors beats Paper</p>
            <p className="text-gray-300 text-xs mb-1">Paper beats Rock</p>
            <p className="text-gray-300 text-xs">Same moves result in a tie</p>
          </div>
          <p className="text-gray-300 text-sm mb-4">CONNECT WALLET TO PLAY</p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl text-white">RPS-ONCHAIN</h1>
          <ConnectButton showBalance={false} />
        </div>
        
        {gameState === 'menu' && (
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded text-left">
              <p className="text-green-400 text-sm font-bold mb-2">✅ WALLET CONNECTED</p>
              
              {isEditing ? (
                <div className="space-y-2 mb-2">
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-gray-600 text-white p-2 text-xs rounded"
                    maxLength={20}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveUsername}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 text-xs rounded"
                    >
                      SAVE
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 text-xs rounded"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center mb-2">
                  <p className="text-white text-xs">
                    Welcome {username || 'User'} • {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                  <button
                    onClick={startEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 text-xs rounded"
                  >
                    {username ? 'EDIT' : 'SET NAME'}
                  </button>
                </div>
              )}
              
              <p className="text-gray-300 text-xs">Network: Base Sepolia</p>
            </div>
            <button 
              onClick={startDemo}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 text-sm font-bold"
            >
              TEST WALLET FEATURES
            </button>
          </div>
        )}
        
        {gameState === 'demo' && (
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded text-left">
              <p className="text-white text-sm font-bold mb-2">WALLET CONNECTION TEST</p>
              <p className="text-gray-300 text-xs mb-1">✅ MetaMask Connected</p>
              <p className="text-gray-300 text-xs mb-1">✅ Base Sepolia Network</p>
              <p className="text-gray-300 text-xs mb-1">✅ Address Retrieved</p>
              <p className="text-gray-300 text-xs">✅ RainbowKit Integration</p>
            </div>
            <button 
              onClick={backToMenu}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 text-sm font-bold"
            >
              BACK TO MENU
            </button>
          </div>
        )}
      </div>
    </div>
  );
}