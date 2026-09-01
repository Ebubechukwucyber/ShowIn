import type { Participant, ShowEvent } from './types'

const KEY = 'showin.events.v1'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function code() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

export function loadEvents(): ShowEvent[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveEvents(events: ShowEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(events))
}

export function createEvent(input: {
  title: string
  place: string
  startsAt: string
  stakeNim: number
  hostAddress: string
}): ShowEvent {
  const events = loadEvents()
  const ev: ShowEvent = {
    id: uid(),
    code: code(),
    title: input.title.trim(),
    place: input.place.trim(),
    startsAt: input.startsAt,
    stakeNim: input.stakeNim,
    hostAddress: input.hostAddress,
    status: 'open',
    participants: [],
  }
  events.unshift(ev)
  saveEvents(events)
  return ev
}

export function getEvent(id: string) {
  return loadEvents().find((e) => e.id === id)
}

export function getEventByCode(c: string) {
  return loadEvents().find((e) => e.code.toLowerCase() === c.trim().toLowerCase())
}

export function updateEvent(id: string, patch: (ev: ShowEvent) => ShowEvent) {
  const events = loadEvents().map((e) => (e.id === id ? patch(e) : e))
  saveEvents(events)
  return events.find((e) => e.id === id)
}

export function joinEvent(id: string, address: string, txRef?: string) {
  return updateEvent(id, (ev) => {
    if (ev.participants.some((p) => p.address === address)) return ev
    const p: Participant = {
      id: uid(),
      address,
      amount: ev.stakeNim,
      status: 'joined',
      txRef,
    }
    return { ...ev, participants: [...ev.participants, p] }
  })
}

export function markPresent(id: string, address: string) {
  return updateEvent(id, (ev) => ({
    ...ev,
    status: ev.status === 'open' ? 'live' : ev.status,
    participants: ev.participants.map((p) =>
      p.address === address ? { ...p, status: 'checked_in' } : p,
    ),
  }))
}

export function settleEvent(id: string) {
  return updateEvent(id, (ev) => {
    const inCount = ev.participants.filter((p) => p.status === 'checked_in').length
    const participants = ev.participants.map((p) => {
      if (p.status === 'checked_in') return { ...p, status: 'refunded' as const }
      if (inCount === 0) return { ...p, status: 'refunded' as const }
      return { ...p, status: 'forfeited' as const }
    })
    return { ...ev, status: 'settled', participants }
  })
}

export function shortAddr(a: string) {
  if (!a) return 'not connected'
  if (a.length < 12) return a
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}
