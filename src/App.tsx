import { useEffect, useMemo, useState } from 'react'
import type { Screen, ShowEvent } from './lib/types'
import { connectWallet, requestStake, type WalletState } from './lib/wallet'
import {
  createEvent,
  getEvent,
  getEventByCode,
  joinEvent,
  loadEvents,
  markPresent,
  settleEvent,
  shortAddr,
} from './lib/store'

export default function App() {
  const [wallet, setWallet] = useState<WalletState>({
    ready: false,
    demo: true,
    address: null,
    error: null,
  })
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [tick, setTick] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const events = useMemo(() => loadEvents(), [tick])

  useEffect(() => {
    connectWallet().then(setWallet)
  }, [])

  function refresh() {
    setTick((n) => n + 1)
  }
  function flash(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const address = wallet.address ?? 'guest'

  return (
    <div className="app">
      {screen.name === 'home' && (
        <Home
          wallet={wallet}
          events={events}
          address={address}
          onCreate={() => setScreen({ name: 'create' })}
          onJoin={() => setScreen({ name: 'join' })}
          onOpen={(id) => setScreen({ name: 'event', id })}
        />
      )}
      {screen.name === 'create' && (
        <Create
          address={address}
          onBack={() => setScreen({ name: 'home' })}
          onDone={(id) => {
            refresh()
            setScreen({ name: 'share', id })
          }}
        />
      )}
      {screen.name === 'share' && (
        <Share
          ev={getEvent(screen.id)}
          onOpen={() => setScreen({ name: 'event', id: screen.id })}
          onHome={() => setScreen({ name: 'home' })}
          flash={flash}
        />
      )}
      {screen.name === 'join' && (
        <JoinCode
          onBack={() => setScreen({ name: 'home' })}
          onFound={(id) => setScreen({ name: 'event', id })}
        />
      )}
      {screen.name === 'event' && (
        <EventView
          ev={getEvent(screen.id)}
          address={address}
          onBack={() => {
            refresh()
            setScreen({ name: 'home' })
          }}
          onJoin={async () => {
            const ev = getEvent(screen.id)
            if (!ev) return
            const tx = await requestStake(ev.stakeNim, ev.hostAddress)
            joinEvent(ev.id, address, tx)
            refresh()
            flash('You’re in. Show up, get it back.')
          }}
          onCheckin={() => setScreen({ name: 'checkin', id: screen.id })}
          onSettle={() => setScreen({ name: 'settle', id: screen.id })}
        />
      )}
      {screen.name === 'checkin' && (
        <Checkin
          ev={getEvent(screen.id)}
          onBack={() => {
            refresh()
            setScreen({ name: 'event', id: screen.id })
          }}
          onPresent={(addr) => {
            markPresent(screen.id, addr)
            refresh()
          }}
        />
      )}
      {screen.name === 'settle' && (
        <Settle
          ev={getEvent(screen.id)}
          onBack={() => setScreen({ name: 'event', id: screen.id })}
          onConfirm={() => {
            settleEvent(screen.id)
            refresh()
            setScreen({ name: 'receipt', id: screen.id })
          }}
        />
      )}
      {screen.name === 'receipt' && (
        <Receipt
          ev={getEvent(screen.id)}
          address={address}
          onHome={() => setScreen({ name: 'home' })}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function Home({
  wallet,
  events,
  address,
  onCreate,
  onJoin,
  onOpen,
}: {
  wallet: WalletState
  events: ShowEvent[]
  address: string
  onCreate: () => void
  onJoin: () => void
  onOpen: (id: string) => void
}) {
  const mine = events.filter((e) => e.hostAddress === address || e.participants.some((p) => p.address === address))
  return (
    <>
      <div className="topbar">
        <div className="brand">
          Show<span>In</span>
        </div>
        <div className="pill">{wallet.demo ? 'demo · ' : ''}{shortAddr(wallet.address ?? '')}</div>
      </div>
      <h1>Stake NIM. Show up. Get it back.</h1>
      <p className="lead">Make a seat worth showing up for.</p>
      <div className="actions">
        <button className="btn primary" onClick={onCreate}>Create event</button>
        <button className="btn ghost" onClick={onJoin}>Join with code</button>
      </div>
      <div className="grow" style={{ marginTop: 28 }}>
        <div className="label">Your events</div>
        {mine.length === 0 && <p className="muted">Nothing yet. Create or join one.</p>}
        <div className="stack">
          {mine.map((e) => (
            <button key={e.id} className="card" style={{ textAlign: 'left' }} onClick={() => onOpen(e.id)}>
              <div className="row" style={{ paddingTop: 0 }}>
                <strong>{e.title}</strong>
                <span className={`chip ${e.status === 'settled' ? 'mint' : e.status === 'live' ? 'amber' : ''}`}>
                  {e.status}
                </span>
              </div>
              <div className="muted">{e.stakeNim} NIM · {e.code} · {e.participants.length} in</div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function Create({
  address,
  onBack,
  onDone,
}: {
  address: string
  onBack: () => void
  onDone: (id: string) => void
}) {
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [stake, setStake] = useState(50)
  return (
    <>
      <button className="back" onClick={onBack}>← Home</button>
      <h1>Create event</h1>
      <p className="lead">Guests stake NIM to RSVP.</p>
      <div style={{ marginTop: 20 }}>
        <div className="field">
          <div className="label">Title</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Friday dinner" />
        </div>
        <div className="field">
          <div className="label">Where / link</div>
          <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Lekki or meet.google.com/…" />
        </div>
        <div className="field">
          <div className="label">When</div>
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </div>
        <div className="field">
          <div className="label">Stake</div>
          <div className="amount">{stake}<small>NIM</small></div>
          <div className="stepper">
            {[10, 50, 100, 200].map((n) => (
              <button key={n} className={stake === n ? 'on' : ''} onClick={() => setStake(n)}>{n}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="actions">
        <button
          className="btn primary"
          disabled={!title.trim() || !stake}
          onClick={() => {
            const ev = createEvent({ title, place, startsAt, stakeNim: stake, hostAddress: address })
            onDone(ev.id)
          }}
        >
          Create & get link
        </button>
      </div>
    </>
  )
}

function Share({
  ev,
  onOpen,
  onHome,
  flash,
}: {
  ev?: ShowEvent
  onOpen: () => void
  onHome: () => void
  flash: (s: string) => void
}) {
  if (!ev) return null
  return (
    <>
      <button className="back" onClick={onHome}>← Home</button>
      <h1>Share this seat</h1>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="muted">Code</div>
        <div className="code">{ev.code}</div>
        <p className="muted" style={{ textAlign: 'center' }}>{ev.title} · {ev.stakeNim} NIM</p>
      </div>
      <div className="actions">
        <button
          className="btn primary"
          onClick={() => {
            navigator.clipboard?.writeText(ev.code)
            flash('Code copied')
          }}
        >
          Copy code
        </button>
        <button className="btn ghost" onClick={onOpen}>Open event</button>
      </div>
    </>
  )
}

function JoinCode({ onBack, onFound }: { onBack: () => void; onFound: (id: string) => void }) {
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  return (
    <>
      <button className="back" onClick={onBack}>← Home</button>
      <h1>Join with code</h1>
      <div style={{ marginTop: 20 }}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          style={{ textTransform: 'uppercase', letterSpacing: '0.16em', textAlign: 'center', fontSize: 22 }}
        />
        {err && <p className="muted" style={{ color: 'var(--danger)', marginTop: 8 }}>{err}</p>}
      </div>
      <div className="actions">
        <button
          className="btn primary"
          onClick={() => {
            const ev = getEventByCode(code)
            if (!ev) setErr('No event with that code.')
            else onFound(ev.id)
          }}
        >
          Find event
        </button>
      </div>
    </>
  )
}

function EventView({
  ev,
  address,
  onBack,
  onJoin,
  onCheckin,
  onSettle,
}: {
  ev?: ShowEvent
  address: string
  onBack: () => void
  onJoin: () => void
  onCheckin: () => void
  onSettle: () => void
}) {
  if (!ev) return null
  const isHost = ev.hostAddress === address
  const me = ev.participants.find((p) => p.address === address)
  const bonded = ev.participants.length
  const present = ev.participants.filter((p) => p.status === 'checked_in' || p.status === 'refunded').length
  return (
    <>
      <button className="back" onClick={onBack}>← Home</button>
      <div className="chip amber">{ev.code}</div>
      <h1 style={{ marginTop: 10 }}>{ev.title}</h1>
      <p className="lead">{ev.place || 'No place set'}{ev.startsAt ? ` · ${ev.startsAt.replace('T', ' ')}` : ''}</p>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="label">Stake</div>
        <div className="amount">{ev.stakeNim}<small>NIM</small></div>
      </div>
      <div className="rule" style={{ marginTop: 12 }}>
        Show up → full refund. Miss it → stake is split among people who came.
        Host holds funds at {shortAddr(ev.hostAddress)} until settle.
      </div>
      <p className="muted" style={{ marginTop: 14 }}>{bonded} bonded · {present} in</p>
      <div className="actions">
        {!isHost && !me && ev.status !== 'settled' && (
          <button className="btn primary" onClick={onJoin}>Stake {ev.stakeNim} NIM</button>
        )}
        {!isHost && me && <button className="btn ghost" disabled>{me.status === 'joined' ? 'Bonded — show up' : me.status}</button>}
        {isHost && ev.status !== 'settled' && (
          <>
            <button className="btn primary" onClick={onCheckin}>Start check-in</button>
            <button className="btn ghost" onClick={onSettle}>Settle</button>
          </>
        )}
        {ev.status === 'settled' && <button className="btn ghost" disabled>Settled</button>}
      </div>
    </>
  )
}

function Checkin({
  ev,
  onBack,
  onPresent,
}: {
  ev?: ShowEvent
  onBack: () => void
  onPresent: (address: string) => void
}) {
  const [q, setQ] = useState('')
  if (!ev) return null
  const list = ev.participants.filter((p) => shortAddr(p.address).toLowerCase().includes(q.toLowerCase()) || p.address.toLowerCase().includes(q.toLowerCase()))
  const inCount = ev.participants.filter((p) => p.status === 'checked_in' || p.status === 'refunded').length
  return (
    <>
      <button className="back" onClick={onBack}>← Event</button>
      <h1>Check-in</h1>
      <p className="lead">{inCount} / {ev.participants.length} in</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" style={{ margin: '16px 0' }} />
      {list.length === 0 && <p className="muted">No guests yet. Share the code {ev.code}.</p>}
      {list.map((p) => (
        <div className="row" key={p.id}>
          <div>
            <div>{shortAddr(p.address)}</div>
            <div className="muted">{p.amount} NIM</div>
          </div>
          {p.status === 'checked_in' || p.status === 'refunded' ? (
            <span className="chip mint">Present</span>
          ) : (
            <button className="btn primary" style={{ width: 'auto', height: 40, padding: '0 14px' }} onClick={() => onPresent(p.address)}>
              Present
            </button>
          )}
        </div>
      ))}
      <div className="actions">
        <button className="btn ghost" onClick={onBack}>Done</button>
      </div>
    </>
  )
}

function Settle({ ev, onBack, onConfirm }: { ev?: ShowEvent; onBack: () => void; onConfirm: () => void }) {
  if (!ev) return null
  const present = ev.participants.filter((p) => p.status === 'checked_in')
  const missing = ev.participants.filter((p) => p.status === 'joined')
  const pot = missing.reduce((s, p) => s + p.amount, 0)
  const share = present.length ? pot / present.length : 0
  return (
    <>
      <button className="back" onClick={onBack}>← Event</button>
      <h1>Settle</h1>
      <p className="lead">Refund who showed. Split the rest.</p>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="row"><span>Present</span><strong>{present.length}</strong></div>
        <div className="row"><span>No-show</span><strong>{missing.length}</strong></div>
        <div className="row"><span>Forfeit pot</span><strong>{pot} NIM</strong></div>
        <div className="row"><span>Each attendee extra</span><strong>{share.toFixed(2)} NIM</strong></div>
      </div>
      <div className="actions">
        <button className="btn primary" onClick={onConfirm}>Settle now</button>
      </div>
    </>
  )
}

function Receipt({ ev, address, onHome }: { ev?: ShowEvent; address: string; onHome: () => void }) {
  if (!ev) return null
  const me = ev.participants.find((p) => p.address === address)
  const forfeited = ev.participants.filter((p) => p.status === 'forfeited').reduce((s, p) => s + p.amount, 0)
  const refunded = ev.participants.filter((p) => p.status === 'refunded').reduce((s, p) => s + p.amount, 0)
  return (
    <>
      <div className="topbar">
        <div className="brand">Show<span>In</span></div>
        <span className="chip mint">Settled</span>
      </div>
      <h1>{ev.title}</h1>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="label">Your result</div>
        <div className="amount">{me ? me.status : 'host'}<small /></div>
        <div className="row"><span>Refunded</span><span>{refunded} NIM</span></div>
        <div className="row"><span>Forfeited</span><span>{forfeited} NIM</span></div>
      </div>
      <div className="actions">
        <button className="btn primary" onClick={onHome}>Home</button>
      </div>
    </>
  )
}
