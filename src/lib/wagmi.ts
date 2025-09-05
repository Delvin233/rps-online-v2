import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RPS Online',
  projectId: 'test-project-id-for-wallet-connect', // Replace with your actual WalletConnect project ID
  chains: [baseSepolia],
  ssr: true,
});