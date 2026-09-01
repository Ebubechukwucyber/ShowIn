# ShowIn — project context

Read this first if you are a human or an LLM continuing the build.
Pair with `memory.md` (where work stopped) and `README.md` (judge-facing).

---

## 1. What this is

**ShowIn** is a Mini App for the **Nimiq Mini Apps Competition, Cycle II**.

- Live inside **Nimiq Pay** (WebView), not a standalone store app.
- Job: attendance bonds.
- Line: **Stake NIM. Show up. Get it back.**
- Repo license: **MIT** (required).
- Repo must stay **public**.

Official sites:

- https://miniappscompetition.com
- https://miniappscompetition.com/scoring
- https://miniappscompetition.com/rules
- Docs: https://www.nimiq.com/developers/mini-apps/overview
- Tutorial: https://www.nimiq.com/developers/mini-apps/mini-app-tutorial
- Skool: https://www.skool.com/miniappscompetition
- Telegram: https://t.me/Nimiq
- Discord: https://discord.gg/Nimiq

---

## 2. Competition constraints (do not ignore)

| Item | Value |
|---|---|
| Cycle II window | 24 Aug 2026 – **18 Sep 2026, 23:59 UTC** |
| Prize (1st / 2nd / 3rd) | $10,000 / $5,000 / $2,000 USDT |
| Payout | 3 equal installments (after announcement, +30d, +60d) if app stays live |
| Entry | Free. Nigeria is allowed (not OFAC-blocked). |
| Team | Up to 5. One lead for payouts. |
| AI / vibe-coding | Allowed. |
| Scoring | 105 points, Community Council |

### Rubric

| Category | Pts | Bar |
|---|---|---|
| Design & UX | 25 | Professional on a phone, 0 → using it in **under 60 seconds** |
| Functionality | 25 | Promised flow works; wallet + payments |
| Usefulness & originality | 25 | Real problem; not a Cycle 1 clone (Space / Jump / Quest) |
| Marketing & distribution | 25 | Story, testers, Skool, Sip & Ship — not build-and-ghost |
| Bonus | 5 | Meaningful **NIM** use |

Scale per category: Outstanding / Strong / Competent / Developing / Insufficient / Not demonstrated.

Sip & Ship calls: **Wed 2 Sep, 9 Sep, 16 Sep** (11:00 ET / 16:00 WAT). Show the live product, not slides.

---

## 3. Product definition

### Problem

RSVP is free, so people flake. Hosts waste food, seats, and time.

### Promise

Guest stakes NIM to take a seat. Show up → full refund. No-show → stake is split among people who came.

### Users

- **Host:** meetup, class, dinner, study group, community call.
- **Guest:** someone who wants the seat enough to lock NIM.

### Non-goals (Cycle II)

Do not build: chat, maps, games, savings pots, ticket marketplace, GPS/NFC/face check-in, full on-chain escrow, AI assistant on home.

---

## 4. Identity, codes, caps

**No email login.** Nimiq wallet = account.

| Thing | Role |
|---|---|
| Host | Wallet that created the event. Sees Check-in + Settle. |
| Event code (`ABC123`) | **Public invite.** Seeing it early is fine. Join still requires stake. |
| Guest PIN | Created after stake. Door proof. Host confirms Present. |
| Max guests | **50** per event. Host may set a lower cap (10 / 20 / 50). |

Check-in authority = **host** (restaurant-deposit model). Not a trustless proof of presence in v1.

---

## 5. Money and trust

### On-chain (must happen for Functionality + 5-pt bonus)

- `init()` from `@nimiq/mini-app-sdk`
- `listAccounts()`
- Stake = real **NIM payment** to the address shown on Join
- Refund / forfeit payouts at settle
- Store `txRef`

Published SDK versions on npm: `0.0.1`, `0.0.2`, **`0.1.0`** (use `^0.1.0`, not `^1.0.0`).

### Off-chain

Event metadata, participant list, PINs, Present flags, settle math, receipts.

### Trust model (disclose in UI before pay)

v1 is **not** an autonomous escrow contract.

- Stake goes to **host address**, shown before Join.
- Host marks Present.
- Host / app sends payouts per receipt.
- Default host fee: **0%**. If a fee exists later, max 10% and shown before Join.

If nobody is checked in at settle → **refund everyone**.

Honesty table belongs in README. Do not pretend localhost is 100 unique wallets.

---

## 6. Screens (only these)

1. Home — Create / Join / list of my events  
2. Create — title, when, where/link, stake stepper (10 / 50 / 100 / 200), optional cap  
3. Share — big event code, copy  
4. Join with code  
5. Event (guest) — stake amount, rule box, host address, Stake CTA / Bonded state  
6. Event (host) — pot stats, Start check-in, Settle  
7. Check-in — search, Present tap, PIN match later  
8. Settle — preview refunds / forfeits, confirm  
9. Receipt — numbers + share  

One primary CTA per screen. Thumb-zone buttons (height 56).

---

## 7. Design system (do not regress to slop)

Dark-first (Pay WebView).

| Token | Hex | Use |
|---|---|---|
| bg | `#0B0F14` | canvas |
| surface | `#151B22` | cards |
| surface-2 | `#1C242E` | inputs |
| line | `#2A3440` | hairlines |
| text | `#F4F1EA` | body |
| dim | `#8B939C` | labels |
| accent | `#C8F542` | primary CTA |
| accent-ink | `#0B0F14` | text on CTA |
| mint | `#3DDC97` | present / refunded |
| amber | `#F5C14A` | bonded / pending |
| danger | `#FF5A4F` | no-show / error |

Type: Inter / system-ui. Amounts: **40px**, `tabular-nums`, `NIM` muted.

Refuse: purple mesh gradients, glass blobs, 3D coins, AI chat bubble on home, 5-tab bar.

Color means **state**, not decoration.

Microcopy examples:

- CTA join: `Stake 120 NIM`
- After pay: `You’re in. Show up, get it back.`
- Settle: `Refund who showed. Split the rest.`

---

## 8. Technical architecture

```
ShowIn UI (Vite + React + TS)
  inside Nimiq Pay
       |
       | @nimiq/mini-app-sdk
       v
Event store
  localStorage now
  hosted API + DB next (needed for two phones)
```

Vite must use `server.host: true`, port `5173`. Optional `VITE_HMR_HOST` for phone HMR.

### Data

**Event:** id, code, title, place, startsAt, stakeNim, hostAddress, status (`open|live|settled`), participants[], optional maxGuests.

**Participant:** id, address, amount, status (`joined|checked_in|no_show|refunded|forfeited`), txRef?, pin?

### Current code map

```
src/App.tsx        all screens (client-side router)
src/styles.css     tokens
src/lib/types.ts
src/lib/store.ts   localStorage
src/lib/wallet.ts  SDK init + demo fallback
```

`wallet.ts`: try `init({ timeout: 4000 })` + `listAccounts()`. On failure, demo address in localStorage (`showin.demo.addr`). `requestStake` currently returns a local `tx_*` id — **replace with real Pay send**.

Demo mode is intentional so desktop browsers still click through.

---

## 9. Marketing requirements

Judges score presence, not a single “gm”.

Cadence:

- Intro post in Skool (General or Promote Your Work)
- Weekly screenshot + what works
- Sip & Ship 2 / 9 / 16 Sep — show the live app
- Early-access link + ask for distinct wallets
- 45–90s demo video before 18 Sep
- Help at least one other builder in Technical Support

Draft intro already written in chat (ShowIn problem / product / what’s live / ask for testers).

---

## 10. README style

Judge-brief voice (Lynx / GuildPay / damishafe):

- One job in the first line
- “Judge it in 60 seconds”
- Problem I set out to solve
- Honesty table
- No emoji salad

Reusable LLM prompt lives in the conversation; keep README updated when status changes.

---

## 11. Definition of done (submission)

A stranger in Nimiq Pay can:

1. Open ShowIn  
2. Create or join in under 60 seconds  
3. Move **NIM**  
4. See a settlement receipt  

Plus: public GitHub MIT, live HTTPS URL, ≤250 word submission blurb, demo video.

---

## 12. Build order (do not reshuffle)

1. UI flow (done enough to demo)  
2. Public GitHub + this context + memory  
3. Real NIM pay + refund  
4. Hosted API so two phones share one event  
5. Guest PIN on check-in  
6. Vercel/HTTPS URL  
7. Skool + Sip & Ship + testers  
8. Polish + video + submit before 18 Sep 23:59 UTC  

If a change is not Create / Join / Check-in / Settle, do not add it.
