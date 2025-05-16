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

  // Get wallet from localStorage
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

  // Display message if wallet not found
  if (!wallet) {
    return <div className="mt-6 text-center text-slate-400">🔌 Connect your wallet to lend.</div>
  }

  // Registration form if wallet has no username
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
            const res = await fetch('/api/P2P_Post_Offer', {
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

  // Get mock token prices
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
    // 1. Validation: ensure all fields are filled
    if (!form.token || !form.total_supply || !form.collateral_token || !form.collateral_amount || !form.duration) {
      alert('Please fill in all fields')
      return
    }

    // 2. Get token price in USDT (for calculating value)
    const usdtRate = await getTokenPrice(form.token) // e.g., 25 for SOL

    // 3. Build payload
    const payload = {
      user_wallet: wallet, // From localStorage
      token: form.token.toUpperCase(), // Normalize input
      total_supply: parseFloat(form.total_supply),
      collateral_token: form.collateral_token.toUpperCase(),
      collateral_amount: parseFloat(form.collateral_amount),
      usdt_value: parseFloat(form.total_supply) * usdtRate, // Supply x price
      duration: parseInt(form.duration),
    }

    // 4. POST to /api/p2p-offers
    const res = await fetch('/api/p2p-offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // 5. Show result
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
