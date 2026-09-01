export type WalletState = {
  ready: boolean
  demo: boolean
  address: string | null
  error: string | null
}

export async function connectWallet(): Promise<WalletState> {
  try {
    const mod = await import('@nimiq/mini-app-sdk')
    const nimiq = await mod.init({ timeout: 4000 })
    const accounts = await nimiq.listAccounts()
    const first = Array.isArray(accounts) ? accounts[0] : null
    const address =
      typeof first === 'string'
        ? first
        : first && typeof first === 'object'
          ? String((first as { address?: string }).address ?? first)
          : null
    if (!address) {
      return { ready: true, demo: true, address: demoAddress(), error: null }
    }
    return { ready: true, demo: false, address, error: null }
  } catch {
    return { ready: true, demo: true, address: demoAddress(), error: null }
  }
}

function demoAddress() {
  const existing = localStorage.getItem('showin.demo.addr')
  if (existing) return existing
  const addr = `NQDEMO${Math.random().toString(36).slice(2, 10).toUpperCase()}`
  localStorage.setItem('showin.demo.addr', addr)
  return addr
}

export async function requestStake(amount: number, to: string): Promise<string> {
  // Inside Nimiq Pay, hook real send when provider methods are confirmed.
  // Demo / fallback: local receipt id so the product flow is testable now.
  void amount
  void to
  return `tx_${Date.now().toString(36)}`
}
