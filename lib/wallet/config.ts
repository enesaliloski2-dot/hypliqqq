"use client";
import { http, createConfig } from "wagmi";
import { mainnet, base, polygon } from "wagmi/chains";
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors";

const wcId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
export const wagmiConfig = createConfig({
  chains: [mainnet, base, polygon],
  connectors: [
    injected({ shimDisconnect: true }),                       // MetaMask and other injected EVM wallets
    coinbaseWallet({ appName: "Hyperliquid Card" }),
    ...(wcId ? [walletConnect({ projectId: wcId, showQrModal: true })] : []),
  ],
  transports: { [mainnet.id]: http(), [base.id]: http(), [polygon.id]: http() },
  ssr: true,
});
declare module "wagmi" { interface Register { config: typeof wagmiConfig } }
