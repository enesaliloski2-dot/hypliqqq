#!/usr/bin/env bash
# No-JS end-to-end flow against the mock (test/mock-supabase.mjs). Run via test/run.sh. Uses the progressive-enhancement form posts Next renders.
set -u; B=http://localhost:3100; J=/tmp/jar; rm -f $J; P=0; F=0
ok(){ printf "  PASS  %s\n" "$1"; P=$((P+1)); } ; fail(){ printf "  FAIL  %s\n" "$1"; F=$((F+1)); }
# emit the hidden action fields Next renders for no-JS form posts, as a newline list of name=value
hidden(){ curl -s -b $J "$1" | python3 -c "
import sys,re,html;s=sys.stdin.read()
for m in re.finditer(r'<input([^>]*)>',s):
    a=m.group(1)
    if 'type=\"hidden\"' not in a: continue
    n=re.search(r'name=\"([^\"]+)\"',a); v=re.search(r'value=\"([^\"]*)\"',a)
    if n: print(html.unescape(n.group(1))+'='+(html.unescape(v.group(1)) if v else ''))" ; }
# hidden fields of the specific <form> that contains an input/button named $2 (pages can hold several action forms)
formof(){ curl -s -b $J "$1" | python3 -c "
import sys,re,html;s=sys.stdin.read();want=sys.argv[1]
for f in re.findall(r'<form.*?</form>',s,flags=re.S):
    if re.search(r'name=\"'+re.escape(want)+r'\"',f) or (want.startswith('text:') and want[5:] in f):
        for m in re.finditer(r'<input([^>]*)>',f):
            a=m.group(1)
            if 'type=\"hidden\"' not in a: continue
            n=re.search(r'name=\"([^\"]+)\"',a); v=re.search(r'value=\"([^\"]*)\"',a)
            if n: print(html.unescape(n.group(1))+'='+(html.unescape(v.group(1)) if v else ''))
        break" "$2" ; }
# post multipart form: $1 url, $2 hidden list (newline separated), rest: field=value pairs
post(){ local url=$1 hid=$2; shift 2; local args=(); while IFS= read -r line; do [ -n "$line" ] && args+=(-F "$line"); done <<< "$hid"; for kv in "$@"; do args+=(-F "$kv"); done; curl -s -b $J -c $J -o /tmp/resp -w "%{http_code} %{redirect_url}" -X POST "$url" "${args[@]}" ; }
if [ "${MOCK_CONFIRM:-0}" != "1" ]; then
echo "signup (valid)"; H=$(hidden $B/signup); R=$(post $B/signup "$H" "fullName=Ada Lovelace" "email=ada@example.com" "password=Noryx12345A" "confirm=Noryx12345A" "terms=on"); echo "$R" | grep -q "303.*/dashboard" && ok "redirects to /dashboard with session cookie" || fail "signup: $R"
echo "dashboard"; C=$(curl -s -b $J -w "%{http_code}" $B/dashboard | sed "s/<!-- -->//g" > /tmp/d; tail -c 3 /tmp/d); sed -i "$ s/...$//" /tmp/d; grep -q "Welcome back, ADA" /tmp/d && [ "$C" = 200 ] && ok "renders the signed-in customer's own name" || fail "dashboard $C"
grep -q "Your wallet. Your control." /tmp/d && ok "wallet empty state" || fail "wallet empty state"; grep -q "Card availability: Coming soon" /tmp/d && ok "card availability label" || fail "card label"
grep -q "Welcome, Ada" /tmp/d && ok "topbar welcome uses saved first name" || fail "topbar"
for r in /dashboard/card /dashboard/wallets /dashboard/transactions /dashboard/settings /dashboard/support; do C=$(curl -s -b $J -o /dev/null -w "%{http_code}" $B$r); [ "$C" = 200 ] && ok "$r opens" || fail "$r -> $C"; done
R=$(curl -s -b $J -o /dev/null -w "%{http_code} %{redirect_url}" $B/login); echo "$R" | grep -q "307.*/dashboard" && ok "logged-in visit to /login redirects to /dashboard" || fail "login redirect: $R"
curl -s -b $J $B/ | grep -q 'href="/dashboard" data-app="dashboard">Dashboard' && ok "homepage shows Dashboard link when signed in" || fail "home auth-aware"
echo "settings"; H=$(formof $B/dashboard/settings fullName); R=$(post $B/dashboard/settings "$H" "fullName=Ada Byron"); curl -s -b $J $B/dashboard | sed "s/<!-- -->//g" | grep -q "Welcome back, ADA" && curl -s -b $J $B/dashboard/settings | grep -q 'value="Ada Byron"' && ok "profile edit persists through backend" || fail "profile save ($R)"
echo "admin"; R=$(curl -s -b $J -o /dev/null -w "%{http_code} %{redirect_url}" $B/admin); R2=$(curl -s -b $J -o /dev/null -w "%{http_code} %{redirect_url}" $B/admin/design-review); echo "$R2" | grep -q "307.*denied=1" && ok "customer is denied /admin/design-review (originals stay owner-only)" || fail "design-review gate: $R2"; R3=$(curl -s -b $J -o /dev/null -w "%{http_code} %{redirect_url}" $B/preview); echo "$R3" | grep -q "307.*denied=1" && ok "customer is denied /preview" || fail "preview gate: $R3"; R4=$(curl -s -b $J -o /dev/null -w "%{http_code}" $B/api/concept/front.png); [ "$R4" = 403 ] && ok "customer gets 403 on the concept image API" || fail "concept api gate: $R4"; R5=$(curl -s -o /dev/null -w "%{http_code}" $B/api/concept/front.png); [ "$R5" = 403 ] && ok "anonymous gets 403 on the concept image API" || fail "anon concept api: $R5"; echo "$R" | grep -q "307.*denied=1" && ok "customer is denied /admin (server-side)" || fail "admin denial: $R"
curl -s "http://localhost:54321/__mock/promote?email=ada@example.com" >/dev/null; C=$(curl -s -b $J -o /tmp/a -w "%{http_code}" $B/admin); grep -q "Registered users" /tmp/a && [ "$C" = 200 ] && ok "admin role (set in DB) opens /admin" || fail "admin $C"
for r in /admin/users /admin/applications /admin/wallets /admin/support /admin/promotions /admin/settings /admin/audit /admin/design-review; do C=$(curl -s -b $J -o /tmp/a -w "%{http_code}" $B$r); [ "$C" = 200 ] && ok "$r opens" || fail "$r -> $C"; done
curl -s -b $J $B/admin/users | grep -q "ada@example.com" && ok "admin customers table shows real record" || fail "admin table"
R6=$(curl -s -b $J -o /tmp/img -w "%{http_code} %{content_type}" $B/api/concept/front.png); echo "$R6" | grep -q "200 image/png" && cmp -s /tmp/img private/card-concept/front.png && ok "admin receives the byte-identical original via the API" || fail "admin concept api: $R6"
C=$(curl -s -b $J -o /tmp/pv -w "%{http_code}" $B/preview); grep -q "/api/concept/front.png" /tmp/pv && grep -q "Design preview" /tmp/pv && [ "$C" = 200 ] && ok "/preview renders originals with the preview ribbon for the owner" || fail "preview $C"
echo "logout"; H=$(formof $B/dashboard/settings "text:Sign out of this session"); R=$(post $B/dashboard/settings "$H"); echo "$R" | grep -q "303" && ok "logout posts and redirects" || fail "logout: $R"
R=$(curl -s -b $J -o /dev/null -w "%{http_code} %{redirect_url}" $B/dashboard); echo "$R" | grep -q "307.*/login" && ok "session cleared: /dashboard redirects to /login" || fail "post-logout: $R"
echo "login"; H=$(hidden $B/login); R=$(post $B/login "$H" "email=ada@example.com" "password=wrongpass"); grep -q "Email or password is incorrect" /tmp/resp && ok "invalid credentials rejected" || fail "invalid login: $R"
R=$(post $B/login "$H" "email=ada@example.com" "password=Noryx12345A"); echo "$R" | grep -q "303.*/dashboard" && ok "valid login redirects to /dashboard" || fail "login: $R"
curl -s -b $J $B/dashboard | sed "s/<!-- -->//g" | grep -q "Welcome back, ADA" && ok "returning customer lands on own dashboard" || fail "returning"
echo "duplicate + validation"; rm -f $J; H=$(hidden $B/signup); post $B/signup "$H" "fullName=X Y" "email=ada@example.com" "password=Noryx12345A" "confirm=Noryx12345A" "terms=on" >/dev/null; grep -q "already exists" /tmp/resp && ok "duplicate email handled" || fail "duplicate"
post $B/signup "$H" "fullName=A" "email=bad" "password=short" "confirm=x" >/dev/null; grep -q "valid email" /tmp/resp && grep -q "at least 10" /tmp/resp && ok "server-side validation errors rendered" || fail "validation"
echo "password reset"; H=$(hidden $B/forgot-password); post $B/forgot-password "$H" "email=ada@example.com" >/dev/null; grep -q "reset link is on its way" /tmp/resp && ok "reset request accepted" || fail "reset"

fi
if [ "${MOCK_CONFIRM:-0}" = "1" ]; then
echo "verification required"; rm -f $J; H=$(hidden $B/signup); R=$(post $B/signup "$H" "fullName=Grace Hopper" "email=grace@example.com" "password=Noryx12345A" "confirm=Noryx12345A" "terms=on")
grep -q "One last step." /tmp/resp && grep -q "grace@example.com" /tmp/resp && ok "signup shows verification screen with the address" || fail "verify screen: $R"
H=$(formof $B/signup "text:One last step"); H2=$(cat /tmp/resp | python3 -c "
import sys,re,html;s=sys.stdin.read()
for f in re.findall(r'<form.*?</form>',s,flags=re.S):
    if 'Resend' in f:
        for m in re.finditer(r'<input([^>]*)>',f):
            a=m.group(1)
            if 'type=\"hidden\"' not in a: continue
            n=re.search(r'name=\"([^\"]+)\"',a); v=re.search(r'value=\"([^\"]*)\"',a)
            if n: print(html.unescape(n.group(1))+'='+(html.unescape(v.group(1)) if v else ''))")
R=$(post $B/signup "$H2"); grep -q "Verification email sent again" /tmp/resp && ok "resend verification works" || fail "resend: $R"
H=$(hidden $B/login); R=$(post $B/login "$H" "email=grace@example.com" "password=Noryx12345A"); grep -q "One last step." /tmp/resp && ok "unverified login shows verification screen instead of dashboard" || fail "unverified login: $R"
curl -s "http://localhost:54321/__mock/confirm?email=grace@example.com" >/dev/null; R=$(post $B/login "$H" "email=grace@example.com" "password=Noryx12345A"); echo "$R" | grep -q "303.*/dashboard" && ok "after verification, login reaches dashboard" || fail "verified login: $R"
fi
echo; echo "$P passed, $F failed"
