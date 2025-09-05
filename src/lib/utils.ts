import { keccak256, encodePacked } from 'viem';

export function generateCommitment(move: number, salt: bigint): `0x${string}` {
  return keccak256(encodePacked(['uint8', 'uint256'], [move, salt]));
}

export function generateSalt(): bigint {
  return BigInt(Math.floor(Math.random() * 1000000000));
}

export const MOVES = {
  ROCK: 1,
  PAPER: 2,
  SCISSORS: 3
} as const;