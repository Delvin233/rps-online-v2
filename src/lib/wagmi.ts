import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RPS Online',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'test-project-id-for-wallet-connect'
  chains: [baseSepolia],
  ssr: true,
});