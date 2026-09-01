# ShowIn

**Stake NIM. Show up. Get it back.**

ShowIn is a Nimiq Pay Mini App for attendance bonds. A host creates an event and sets a NIM stake. Guests join by paying that stake. At the door the host checks people in. On settle, everyone who showed is refunded. No-show stakes are split among the people who came.

Built for the [Nimiq Mini Apps Competition](https://miniappscompetition.com/) · Cycle II.

**[ Judge it in 60 seconds ](#judge-showin-in-60-seconds)** · **[ The money flow ](#the-money-flow)** · **[ Honesty ](#honesty-what-is-real)** · **[ Run locally ](#run-it-locally)**

---

## Table of contents

- [The problem I set out to solve](#the-problem-i-set-out-to-solve)
- [What I built](#what-i-built)
- [Judge ShowIn in 60 seconds](#judge-showin-in-60-seconds)
- [The money flow](#the-money-flow)
- [Architecture](#architecture)
- [Who holds the NIM](#who-holds-the-nim)
- [Codes](#codes)
- [Engineering decisions](#engineering-decisions)
- [Honesty: what is real](#honesty-what-is-real)
- [Tech stack](#tech-stack)
- [Project layout](#project-layout)
- [Run it locally](#run-it-locally)
- [License](#license)

---

## The problem I set out to solve

RSVP is free, so it is cheap to flake. Hosts over-order food, hold seats, and start late. "I'll be there" is a social promise with no cost.

Crypto already knows how to attach money to a promise. What it does not usually do is the boring room problem: **a small group, a time, a door, a refund if you showed up.**

I did not want another savings pot, another leaderboard game, or another social room that happens to have a wallet button. I wanted a Mini App a host can explain in one sentence while standing at a table:

> Pay this NIM to take the seat. Walk in, get it back. Don't walk in, it goes to the people who did.

---

## What I built

One Mini App, four verbs:

1. **Create** — host sets title, time, place or link, stake in NIM, optional cap (max 50).
2. **Join** — guest opens the event code, reads the rule, sends NIM, status becomes **Bonded**.
3. **Check-in** — host marks Present from the bonded list (guest also holds a personal PIN after they pay).
4. **Settle** — refund every Present; split no-show stakes among people who came; write a receipt.

The wallet is the account. There is no email login. The host is the wallet that created the event.

---

## Judge ShowIn in 60 seconds

1. Open the Mini App on a phone (Nimiq Pay or demo mode).
2. Create **Friday dinner** · stake **50 NIM** · copy the event code.
3. Join from a second wallet. Confirm the rule is visible *before* pay.
4. Host: Start check-in → Present.
5. Settle. Read the receipt: who was refunded, who forfeited.

If those five steps work, the product works. Everything else is polish.

---

## The money flow

```
Guest wallet  --stake NIM-->  event address (host, disclosed)
                                      |
                                      |  check-in list
                                      v
                         Present  -->  refund NIM
                         Bonded   -->  forfeit, split to Present
```

Default settle rule:

- All checked in → everyone refunded.
- Mix of show / no-show → no-show pot split equally among Present.
- Nobody checked in by settle time → refund everyone (do not punish a dead check-in).
- Optional host fee: max 10%, shown before join. Default for the contest: **0%**.

---

## Architecture

```
ShowIn UI  (Vite + React + TS)
   runs inside Nimiq Pay WebView
              |
              |  @nimiq/mini-app-sdk
              |  init() · listAccounts() · pay
              v
Event state
   local now · API + DB when hosted
   events · participants · receipts
```

Cycle II ships the UI + wallet path first. Events persist in `localStorage` so the full flow is demoable without a backend. A hosted API is the next slice, not the pitch.

---

## Who holds the NIM

This is not a silent escrow contract in v1.

- Stake is a **NIM payment** to the **host address shown on the Join screen**.
- Check-in is **host authority** (same model as a restaurant deposit).
- Settle is a **receipt plus payouts**, not an autonomous on-chain split.

The UI says this before anyone pays. Hidden custody is a disqualifier. A real escrow contract is v2, after the cycle.

---

## Codes

| Code | Who sees it | Job |
|---|---|---|
| Event code (`ABC123`) | Public | Find and join the event. Seeing it early is fine — they still pay. |
| Guest PIN | Only that guest + host at the door | Prove this bonded wallet is in the room. |
| Host | Their Nimiq wallet | Create, check-in, settle. No second login. |

Max guests per event: **50**.

---

## Engineering decisions

**Wallet = identity.** Matches how Mini Apps actually work inside Pay. A custom auth stack would fight the platform.

**NIM as the default stake.** The bonus category is 5 points. More important: the product is a payment, not a skin.

**Host-as-referee for check-in.** GPS, NFC, and face scan do not ship in 17 days and they fail in bad rooms. A PIN + host tap is honest and demoable.

**One job per screen.** Judges score 0 to useful in under 60 seconds. Extra features dilute that.

**Demo mode when Pay is missing.** `init()` times out in a normal browser. The flow still runs so we can film and test without a device tether.

---

## Honesty: what is real

| Piece | Status |
|---|---|
| Create / join / check-in / settle UI | Real |
| Wallet connect via Mini App SDK | Real inside Nimiq Pay; demo address in browser |
| NIM send / refund | Next slice — provider pay, then live URL |
| Shared event state across two phones | Needs hosted API (localStorage is per device) |
| On-chain escrow contract | Not in this cycle |
| 50-person production load | Not claimed |

What we will not pretend: a localhost demo is not 100 unique wallets. Marketing points come from Skool, Sip & Ship, and a public URL.

---

## Tech stack

- Vite 7 · React 19 · TypeScript
- `@nimiq/mini-app-sdk`
- Nimiq Pay WebView
- MIT license

---

## Project layout

```
src/
  App.tsx            screens: home → create → share → join → event → check-in → settle → receipt
  styles.css         tokens (dark canvas, lime CTA, tabular NIM)
  lib/types.ts       Event · Participant · Screen
  lib/store.ts       local event store
  lib/wallet.ts      SDK init + demo fallback
```

---

## Run it locally

```bash
npm install
npm run dev
```

- Desktop: http://localhost:5173 — demo mode.
- Phone on the same Wi-Fi: the Network URL Vite prints — open it **inside Nimiq Pay**.

```bash
npm run build
```

---

## License

MIT
