'use client'

import { useEffect, useState } from 'react'

export default function LenderForm() {
  const [wallet, setWallet] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [usernameInput, setUsernameInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    token: '',
    total_supply: '',
    collateral_token: '',
    collateral_amount: '',
    duration: '',
  })

  // Fetch wallet on mount
  useEffect(() => {
    const storedWallet = localStorage.getItem('wallet')
    if (storedWallet) setWallet(storedWallet)
  }, [])

  // Check if wallet is registered
  useEffect(() => {
    if (wallet) {
      fetch(`/api/lender?wallet=${encodeURIComponent(wallet)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.name) setUsername(d.name)
        })
    }
  }, [wallet])

  // If wallet connected but no username
  if (wallet && !username) {
    return (
      <div className="mt-6 max-w-sm mx-auto flex flex-col gap-2 bg-slate-800 p-4 rounded">
        <p className="text-slate-200">
          Wallet <code>{wallet}</code> isn’t registered. Pick a one-time username:
        </p>
        <input
          type="text"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
          placeholder="YourUsername"
        />
        <p className="text-xs text-slate-500">This username is permanent and tied to your wallet.</p>
        <button
          disabled={!usernameInput.trim()}
          onClick={async () => {
            setLoading(true)
            const res = await fetch('/api/lender', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wallet, name: usernameInput.trim() }),
            })
            const data = await res.json()
            if (data.name) {
              setUsername(data.name)
              localStorage.setItem('wallet', wallet)
            }
            setLoading(false)
          }}
          className="mt-2 px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-600 rounded text-white disabled:opacity-50"
        >
          {loading ? 'Registering…' : 'Register as Lender'}
        </button>
      </div>
    )
  }

  // Calculate dynamic USDT value
  const getTokenPrice = async (token: string): Promise<number> => {
    const mockPrices: Record<string, number> = {
      SOL: 25,
      ETH: 2000,
      USDC: 1,
      USDT: 1,
      BTC: 30000,
    }
    return mockPrices[token.toUpperCase()] || 1
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.token || !form.total_supply || !form.collateral_token || !form.collateral_amount || !form.duration) {
      alert('Please fill in all fields')
      return
    }

    const usdtRate = await getTokenPrice(form.token)
    const payload = {
      user_wallet: wallet,
      token: form.token,
      total_supply: parseFloat(form.total_supply),
      collateral_token: form.collateral_token,
      collateral_amount: parseFloat(form.collateral_amount),
      usdt_value: parseFloat(form.total_supply) * usdtRate,
      duration: parseInt(form.duration),
    }

    const res = await fetch('/api/p2p-offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      alert('✅ Offer posted to the market')
      setForm({
        token: '',
        total_supply: '',
        collateral_token: '',
        collateral_amount: '',
        duration: '',
      })
    } else {
      alert('❌ Error posting offer')
    }
  }

  if (wallet && username) {
    return (
      <div className="mt-6 max-w-md mx-auto bg-slate-800 p-6 rounded-lg text-white">
        <div className="mb-4">
          <p className="text-sm text-slate-400">
            Wallet: <code>{wallet}</code>
          </p>
          <p className="text-sm text-slate-400">
            Username: <strong>{username}</strong>
          </p>
        </div>

        <div className="space-y-3">
          <input
            name="token"
            placeholder="Token (e.g. SOL)"
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600"
            value={form.token}
            onChange={handleChange}
          />
          <input
            name="total_supply"
            placeholder="Supply Amount"
            type="number"
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600"
            value={form.total_supply}
            onChange={handleChange}
          />
          <input
            name="collateral_token"
            placeholder="Collateral Token (e.g. USDC)"
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600"
            value={form.collateral_token}
            onChange={handleChange}
          />
          <input
            name="collateral_amount"
            placeholder="Collateral Amount"
            type="number"
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600"
            value={form.collateral_amount}
            onChange={handleChange}
          />
          <input
            name="duration"
            placeholder="Duration (days)"
            type="number"
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600"
            value={form.duration}
            onChange={handleChange}
          />
          <button
            onClick={handleSubmit}
            className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-600 rounded"
          >
            Post Offer to Market
          </button>
        </div>
      </div>
    )
  }

  return <div className="mt-6 text-center text-slate-400">Loading wallet info…</div>
}
