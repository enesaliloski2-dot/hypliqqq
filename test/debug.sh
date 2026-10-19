cd "$(dirname "$0")/.."
node test/mock-supabase.mjs > /tmp/mock.log 2>&1 & M=$!
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=anon NEXT_PUBLIC_SITE_URL=http://localhost:3100 npx next start -p 3100 > /tmp/next.log 2>&1 & N=$!
for i in $(seq 1 30); do curl -s -o /dev/null --max-time 2 http://localhost:3100/login && break; sleep 1; done
J=/tmp/j3; rm -f $J
{
H=$(curl -s http://localhost:3100/signup | python3 -c "
import sys,re,html;s=sys.stdin.read()
for m in re.finditer(r'<input([^>]*)>',s):
    a=m.group(1)
    if 'type=\"hidden\"' not in a: continue
    n=re.search(r'name=\"([^\"]+)\"',a); v=re.search(r'value=\"([^\"]*)\"',a)
    if n: print(html.unescape(n.group(1))+'='+(html.unescape(v.group(1)) if v else ''))")
args=(); while IFS= read -r l; do args+=(-F "$l"); done <<< "$H"
curl -s -c $J -o /dev/null -X POST http://localhost:3100/signup "${args[@]}" -F "fullName=Ada Lovelace" -F "email=ada@example.com" -F "password=Noryx12345A" -F "confirm=Noryx12345A" -F "terms=on"
curl -s -b $J http://localhost:3100/dashboard/settings | python3 -c "
import sys,re;s=sys.stdin.read()
for f in re.findall(r'<form.*?</form>',s,flags=re.S):
    print('FORM', re.findall(r'<input[^>]*type=\"hidden\"[^>]*>',f)[:4], '...', 'Sign out' in f, 'fullName' in f)"
} > /tmp/debug.log 2>&1
kill $N $M 2>/dev/null; pkill -f next-server 2>/dev/null
