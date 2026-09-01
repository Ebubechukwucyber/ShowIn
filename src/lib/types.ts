export type EventStatus = 'open' | 'live' | 'settled'
export type PartStatus = 'joined' | 'checked_in' | 'no_show' | 'refunded' | 'forfeited'

export type Participant = {
  id: string
  address: string
  amount: number
  status: PartStatus
  txRef?: string
}

export type ShowEvent = {
  id: string
  code: string
  title: string
  place: string
  startsAt: string
  stakeNim: number
  hostAddress: string
  status: EventStatus
  participants: Participant[]
}

export type Screen =
  | { name: 'home' }
  | { name: 'create' }
  | { name: 'share'; id: string }
  | { name: 'join' }
  | { name: 'event'; id: string }
  | { name: 'checkin'; id: string }
  | { name: 'settle'; id: string }
  | { name: 'receipt'; id: string }
