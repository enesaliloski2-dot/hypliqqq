import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Hyperliquid Card — Your Crypto. In Motion.",
  description: "Hyperliquid Card is an independent crypto-card concept designed for users of the Hyperliquid ecosystem. Not affiliated with or endorsed by Hyperliquid Labs or any card network.",
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#050A09", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
