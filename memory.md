# ShowIn — memory (handoff)

Last updated: **1 Sep 2026, ~16:00 WAT**  
Read `project_context.md` for the spec. This file is only **where we stopped**.

If you are another LLM: do not rename the product, do not add features, do not “improve” the design system unless asked. Continue the build order in section 6.

---

## 1. Locked decisions

| Decision | Value |
|---|---|
| Name | **ShowIn** (not Show-Up Bond, uSeat, Rserv, SeatLock) |
| Line | Stake NIM. ShowIn. Get it back. |
| Contest | Nimiq Mini Apps Cycle II · deadline **18 Sep 2026 23:59 UTC** |
| Prize target | 1st $10k is possible, not promised. Top 3 is the honest aim if we ship. |
| Auth | Nimiq wallet only |
| Stake asset | NIM default |
| Escrow | **Not** a smart contract in this cycle. Host holds + disclosed address. |
| Max guests | 50 |
| Event code | Public invite |
| Guest PIN | Planned, not in the running UI yet |
| Design | Dark `#0B0F14`, lime CTA `#C8F542`, tabular amounts |

Builder reference we studied: GitHub `damishafe/Lynx` and `damishafe/Guildpay` — judge-brief README style. Prompt for reuse was given to the user in chat.

---

## 2. People and machines

- Builder path on Windows: `C:\Users\Ebubechukwu\Documents\showin`
- They already ran `npm install` and `npm run dev`
- Vite was healthy:

```
Local:   http://localhost:5173/
Network: http://192.168.125.142:5173/
```

- `cd showin` failed once because they were **already** in `Documents\showin`. Do not nest folders.
- Partner exists; they were going to confirm earlier. Treat as 1–2 person team.
- Workspace copy of the scaffold: `/home/workdir/artifacts/showin` (may lag the Windows folder).

---

## 3. What is already shipped in code

Working click-through on desktop **demo mode**:

- Home, Create, Share code, Join by code, Event (host/guest), Check-in (host taps Present), Settle preview, Receipt
- localStorage store (`showin.events.v1`)
- Wallet hook: tries `@nimiq/mini-app-sdk`, falls back to `NQDEMO…` demo address
- `requestStake` returns a fake `tx_*` — **not real NIM yet**
- MIT `LICENSE`
- Judge-facing `README.md` (Lynx style)
- Tokens in `src/styles.css`
- All screens currently live in **one file**: `src/App.tsx`

This is enough to screenshot and film a first pass. It is **not** submission-ready.

---

## 4. What is not done

- [ ] Real NIM send / refund through Nimiq Pay provider
- [ ] Hosted backend so two phones share one event (localStorage is per device — **blocker for real testers**)
- [ ] Guest unique PIN after stake + PIN field on check-in
- [ ] Cap field on Create (10/20/50)
- [ ] Public HTTPS deploy (Vercel or similar)
- [ ] Confirm GitHub `git push` succeeded (`origin` URL not recorded here)
- [ ] Skool intro posted (Skool showed “Scheduled maintenance” from Nigeria; Nimiq has said that screen can be geo/cache — retry + VPN + Telegram meanwhile)
- [ ] Sip & Ship **Wed 2 Sep 16:00 WAT** — tomorrow from this memory stamp
- [ ] Demo video 45–90s
- [ ] Submission form + ≤250 words
- [ ] Distinct wallet testers

---

## 5. Open product calls (already decided if you need a default)

- Host fee: **0%**
- Nobody checked in → refund all
- Check-in = host tap; PIN is extra proof, not GPS
- Shared state: add a tiny API when leaving localStorage, do not invent Firebase-for-everything

---

## 6. Next actions (do in this order)

1. Confirm GitHub public repo exists; commit `README.md`, `project_context.md`, `memory.md`.
2. Post Skool intro (draft is in chat) + screenshots of Home and Share code.
3. Implement **real NIM payment** in `src/lib/wallet.ts` (`requestStake` + settle payouts).
4. Host a shared store (smallest possible: HTTP API + SQLite/Postgres) so guest phone sees host’s event.
5. Add guest PIN.
6. Deploy HTTPS. Open inside Nimiq Pay.
7. Attend Sip & Ship 2 Sep with the live URL if possible, else the demo.
8. Collect testers. Then video. Then submit before 18 Sep.

---

## 7. Known pitfalls

- npm package `@nimiq/mini-app-sdk@^1.0.0` **does not exist**. Use `^0.1.0`.
- Two browsers on one PC share localStorage — that can fake “two users”. Judges will use two wallets / two phones.
- Do not restart naming debates.
- Do not swap the UI to purple “crypto slop”.
- Scoring is 25/25/25/25+5. Silence in Skool can kill a working app.

---

## 8. Files an incoming LLM should open first

1. `project_context.md`
2. `memory.md`
3. `README.md`
4. `src/App.tsx`
5. `src/lib/wallet.ts`
6. `src/lib/store.ts`
7. `package.json`

Then implement the next unchecked item in section 6. Update **this file** when you finish a slice (date, what landed, what broke).
