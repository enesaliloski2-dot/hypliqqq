"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, Unplug } from "lucide-react";
import { useBalance } from "wagmi";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect } from "react";
import { removeWalletConnection } from "@/lib/wallet/actions";
import { useToast } from "@/components/ui/Toast";

export type WalletRow = { id: string; chain: "evm" | "solana"; provider: string; address: string; network: string; is_active: boolean; last_connected_at: string };
const short = (a: string) => a.slice(0, 6) + "…" + a.slice(-4);
const explorer = (w: WalletRow) => w.chain === "solana" ? `https://solscan.io/account/${w.address}` : w.network === "Base" ? `https://basescan.org/address/${w.address}` : w.network === "Polygon" ? `https://polygonscan.com/address/${w.address}` : `https://etherscan.io/address/${w.address}`;

export function WalletCard({ w }: { w: WalletRow }) {
  const toast = useToast(); const router = useRouter();
  const copy = async () => { try { await navigator.clipboard.writeText(w.address); toast("Address copied", "ok"); } catch { toast("Couldn't copy", "err"); } };
  const remove = async () => { const r = await removeWalletConnection(w.id); if (r?.error) toast(r.error, "err"); else { toast("Wallet disconnected", "ok"); router.refresh(); } };
  return (
    <div className="panel" style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div><div style={{ fontWeight: 500 }}>{w.provider}</div><div className="faint">{w.network}</div></div>
        <span className={`pill ${w.is_active ? "ok" : ""}`}>{w.is_active ? "Connected" : "Inactive"}</span>
      </div>
      <div className="mono" style={{ fontSize: 13.5 }} title={w.address}>{short(w.address)}</div>
      {w.chain === "evm" ? <EvmBalance address={w.address as `0x${string}`} network={w.network} /> : <SolBalance address={w.address} />}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button className="btn btn-secondary btn-sm" onClick={copy}><Copy size={14} /> Copy</button>
        <a className="btn btn-secondary btn-sm" href={explorer(w)} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Explorer</a>
        <button className="btn btn-danger btn-sm" onClick={remove}><Unplug size={14} /> Disconnect</button>
      </div>
    </div>
  );
}
function EvmBalance({ address, network }: { address: `0x${string}`; network: string }) {
  const chainId = network === "Base" ? 8453 : network === "Polygon" ? 137 : 1;
  const { data, isLoading, isError } = useBalance({ address, chainId });
  if (isLoading) return <div className="skeleton" style={{ height: 22, width: 140 }} />;
  if (isError || !data) return <div className="faint">Balance unavailable right now.</div>;
  return <div className="num" style={{ fontSize: 18, fontWeight: 600 }}>{Number(data.formatted).toLocaleString(undefined, { maximumFractionDigits: 5 })} <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>{data.symbol} · verified on-chain</span></div>;
}
function SolBalance({ address }: { address: string }) {
  const { connection } = useConnection(); const [v, setV] = useState<number | null | undefined>(undefined);
  useEffect(() => { let on = true; connection.getBalance(new PublicKey(address)).then(l => on && setV(l / 1e9)).catch(() => on && setV(null)); return () => { on = false; }; }, [address, connection]);
  if (v === undefined) return <div className="skeleton" style={{ height: 22, width: 140 }} />;
  if (v === null) return <div className="faint">Balance unavailable right now.</div>;
  return <div className="num" style={{ fontSize: 18, fontWeight: 600 }}>{v.toLocaleString(undefined, { maximumFractionDigits: 5 })} <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>SOL · verified on-chain</span></div>;
}
