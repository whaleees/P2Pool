// src/components/LenderForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LenderForm() {
  const [showForm, setShowForm] = useState(false)
  const [wallet, setWallet] = useState('')
  const [username, setUsername] = useState<string | null>(null)
  const [token, setToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  const [collateralToken, setCollateralToken] = useState('BTC')
  const [collateralAmt, setCollateralAmt] = useState('')

  // mock “lookup” username when wallet changes
  useEffect(() => {
    if (wallet.trim()) {
      setUsername('John Doe') // pretend this came from your DB
    } else {
      setUsername(null)
    }
  }, [wallet])

  const rates: Record<string, number> = {
    USDC: 1,
    USDT: 1,
    BTC: 50000,
    ETH: 4000,
    SOL: 100,
  }

  const parsedAmt = parseFloat(amount) || 0
  const eq = (parsedAmt * (rates[token] || 0)).toFixed(2)

  const parsedColl = parseFloat(collateralAmt) || 0
  const collEq = (parsedColl * (rates[collateralToken] || 0)).toFixed(2)

  return (
    <div className="mt-6">
      <Button
        variant="outline"
        className="text-slate-300 border-slate-600 hover:border-slate-500 hover:text-white"
        onClick={() => setShowForm((s) => !s)}
      >
        Become a Lender
      </Button>

      {showForm && (
        <div className="bg-slate-800 rounded-2xl p-6 mt-4 space-y-5 max-w-md">
          {/* Wallet */}
          <div>
            <Label htmlFor="wallet" className="text-slate-300">
              Wallet Address
            </Label>
            <Input
              id="wallet"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0xABC…"
              className="mt-1 bg-slate-700 border-slate-600 text-white"
            />
            {username && (
              <p className="mt-1 text-sm text-slate-400">
                Username: <span className="text-white">{username}</span>
              </p>
            )}
          </div>

          {/* Token & Amount */}
          <div>
            <Label htmlFor="token" className="text-slate-300">
              Token
            </Label>
            <Input
              id="token"
              list="token-list"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1 bg-slate-700 border-slate-600 text-white"
            />
            <datalist id="token-list">
              {Object.keys(rates).map((t) => (
                <option value={t} key={t} />
              ))}
            </datalist>

            <Label htmlFor="amount" className="text-slate-300 mt-4">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="mt-1 bg-slate-700 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-400 mt-1">≈ ${eq} USDT</p>
          </div>

          {/* Collateral */}
          <div>
            <Label htmlFor="collateralToken" className="text-slate-300">
              Collateral Token
            </Label>
            <Input
              id="collateralToken"
              list="token-list"
              value={collateralToken}
              onChange={(e) => setCollateralToken(e.target.value)}
              className="mt-1 bg-slate-700 border-slate-600 text-white"
            />

            <Label htmlFor="collateralAmt" className="text-slate-300 mt-4">
              Collateral Amount
            </Label>
            <Input
              id="collateralAmt"
              type="number"
              value={collateralAmt}
              onChange={(e) => setCollateralAmt(e.target.value)}
              placeholder="0.0"
              className="mt-1 bg-slate-700 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-400 mt-1">≈ ${collEq} USDT</p>
          </div>

          <Button
            onClick={() => {
              console.log('MARKET with', { wallet, token, amount, collateralToken, collateralAmt })
              // TODO: call your marketplace API
            }}
            className="w-full bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-lg hover:opacity-90 mt-2"
          >
            Market
          </Button>
        </div>
      )}
    </div>
  )
}
