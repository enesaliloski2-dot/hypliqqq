#!/usr/bin/env bash
cd "$(dirname "$0")/.."
MOCK_CONFIRM=${MOCK_CONFIRM:-0} node test/mock-supabase.mjs > /tmp/mock.log 2>&1 & M=$!
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=anon NEXT_PUBLIC_SITE_URL=http://localhost:3100 npx next start -p 3100 > /tmp/next.log 2>&1 & N=$!
for i in $(seq 1 30); do curl -s -o /dev/null --max-time 2 http://localhost:3100/login && break; sleep 1; done
MOCK_CONFIRM=${MOCK_CONFIRM:-0} timeout 120 bash test/flow.sh > /tmp/flow.log 2>&1
kill $N $M 2>/dev/null; pkill -f "next-server" 2>/dev/null; wait 2>/dev/null
