"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Wallet as WalletIcon } from "lucide-react";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { saveWalletConnection } from "@/lib/wallet/actions";
import { useToast } from "@/components/ui/Toast";

/* Connection only: the user approves in their own wallet, we receive a public address.
   No signatures, no approvals, no allowances are ever requested here. */
export function ConnectWalletButton({ className = "btn btn-primary btn-sm", label = "Connect Wallet" }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return <><button type="button" className={className} onClick={() => setOpen(true)}><WalletIcon size={15} /> {label}</button>{open && <ConnectModal onClose={() => setOpen(false)} />}</>;
}

function ConnectModal({ onClose }: { onClose: () => void }) {
  const toast = useToast(); const router = useRouter();
  const { connectors, connectAsync, isPending } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const chainId = useChainId();
  const { address, connector } = useAccount();
  const sol = useWallet();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [onClose]);

  const chainName: Record<number, string> = { 1: "Ethereum", 8453: "Base", 137: "Polygon" };
  const persist = async (chain: "evm" | "solana", provider: string, addr: string, network: string) => {
    const r = await saveWalletConnection({ chain, provider, address: addr, network });
    if (r?.error) { toast(r.error, "err"); return; }
    toast(`${provider} connected`, "ok"); router.refresh(); onClose();
  };
  const connectEvm = async (id: string) => {
    const c = connectors.find(x => x.id === id || x.uid === id); if (!c) return;
    setBusy(c.name); setErr(null);
    try {
      if (address && connector) await disconnectAsync();
      const res = await connectAsync({ connector: c });
      const addr = res.accounts[0]; const net = chainName[res.chainId] ?? `Chain ${res.chainId}`;
      if (!chainName[res.chainId]) { setErr(`Unsupported network (${res.chainId}). Switch to Ethereum, Base or Polygon and try again.`); await disconnectAsync(); return; }
      await persist("evm", c.name, addr, net);
    } catch (e) {
      const m = String((e as Error)?.message ?? "");
      setErr(/rejected|denied/i.test(m) ? "Connection request was rejected in your wallet." : /not installed|provider/i.test(m) ? `${c.name} isn't available in this browser.` : "Couldn't connect. Try again.");
    } finally { setBusy(null); }
  };
  const connectSolana = async () => {
    setBusy("Phantom"); setErr(null);
    try {
      const w = sol.wallets.find(x => x.adapter.name === "Phantom");
      if (!w || w.readyState === "NotDetected" || w.readyState === "Unsupported") { setErr("Phantom isn't installed in this browser."); return; }
      sol.select(w.adapter.name);
      await w.adapter.connect();
      const pk = w.adapter.publicKey?.toBase58(); if (!pk) throw new Error("No public key");
      await persist("solana", "Phantom", pk, "Solana mainnet");
    } catch (e) {
      const m = String((e as Error)?.message ?? "");
      setErr(/rejected|denied|User/i.test(m) ? "Connection request was rejected in Phantom." : "Couldn't connect to Phantom. Try again.");
    } finally { setBusy(null); }
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="cw-h">
        <button className="btn btn-ghost btn-sm close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        <h2 id="cw-h" className="t-display">Connect your wallet</h2>
        <p className="muted" style={{ fontSize: 14 }}>Connect a supported wallet to view your digital assets. We only read your public address and balance; We never ask for seed phrases or private keys, and connecting is not permission to spend.</p>
        <div style={{ display: "grid", gap: 8 }}>
          {connectors.map(c => (
            <button key={c.uid} className="wallet-opt" onClick={() => connectEvm(c.uid)} disabled={!!busy || isPending}>
              <span className="i">{c.name.slice(0, 2).toUpperCase()}</span><span><div className="n">{c.name}</div><div className="s">Ethereum · Base · Polygon</div></span>
              {busy === c.name && <span className="faint" style={{ marginLeft: "auto" }}>Waiting for approval…</span>}
            </button>))}
          <button className="wallet-opt" onClick={connectSolana} disabled={!!busy}>
            <span className="i">PH</span><span><div className="n">Phantom</div><div className="s">Solana</div></span>
            {busy === "Phantom" && <span className="faint" style={{ marginLeft: "auto" }}>Waiting for approval…</span>}
          </button>
        </div>
        {err && <div className="err" role="alert">{err}</div>}
        <p className="faint">Available options depend on the wallets installed in your browser{process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? " or reachable through WalletConnect" : ""}.</p>
      </div>
    </div>
  );
}
