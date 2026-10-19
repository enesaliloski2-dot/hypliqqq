cd "$(dirname "$0")/.."
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=anon npx next start -p 3100 > /tmp/next.log 2>&1 & N=$!
for i in $(seq 1 30); do curl -s -o /dev/null --max-time 2 http://localhost:3100/login && break; sleep 1; done
{ for p in / /login /signup /favicon.svg /home.js /hyperliquid/cards/card-front.webp /hyperliquid/cards/card-back.webp /hyperliquid/backgrounds/cosmic-horizon.webp /hyperliquid/backgrounds/metal-curves.webp /hyperliquid/backgrounds/metal-ribbed.webp; do printf "%-48s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3100$p)"; done
  echo "NORYX on rendered pages: $(for p in / /login /signup; do curl -s http://localhost:3100$p; done | grep -ci noryx)"
  echo "independent disclosure on home: $(curl -s http://localhost:3100/ | grep -c 'not affiliated with or endorsed by Hyperliquid Labs')"; } > /tmp/assets.log 2>&1
kill $N; pkill -f next-server 2>/dev/null
