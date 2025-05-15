'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface LendRow {
  id: number
  date: string
  status: string
  token: string
  amount: number
  usdtValue: number
  wallet: string
}

export default function LendedTable() {
  const [wallet, setWallet] = useState<string | null>(null)
  const [data, setData] = useState<LendRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('wallet')
    if (!stored) return setLoading(false)
    setWallet(stored)

    fetch(`/api/portfolio/lended?wallet=${stored}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.transactions) setData(json.transactions)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center mt-6 text-slate-400">Loading Lended data…</div>
  if (!wallet) return <div className="text-center mt-6 text-slate-400">Connect your wallet to see Lended data.</div>
  if (data.length === 0) return <div className="text-center mt-6 text-slate-400">No Lended transactions found.</div>

  return (
    <div className="mt-6 w-full">
      <div className="flex font-semibold text-sm bg-slate-900 text-white px-4 py-3 rounded-t-2xl">
        <div className="flex-1">Date</div>
        <div className="flex-1 text-right">Status</div>
        <div className="flex-1 text-right">Token</div>
        <div className="flex-1 text-right">Amount</div>
        <div className="flex-1 text-right">≈ USDT</div>
        <div className="flex-1 text-right">Borrower Wallet</div>
        <div className="flex-1 text-right">Action</div>
      </div>

      {data.map((row) => (
        <div
          key={row.id}
          className="flex items-center text-sm bg-slate-800 text-white p-4 mt-2 rounded-b-2xl hover:bg-slate-700 transition"
        >
          <div className="flex-1">{row.date}</div>
          <div className="flex-1 text-right">
            {row.status === 'Pending' && <span className="text-yellow-400">Pending</span>}
            {row.status === 'Success' && <span className="text-green-400">Active</span>}
            {row.status !== 'Pending' && row.status !== 'Success' && (
              <span className="text-slate-400">{row.status}</span>
            )}
          </div>
          <div className="flex-1 text-right">{row.token}</div>
          <div className="flex-1 text-right">{row.amount}</div>
          <div className="flex-1 text-right">{row.usdtValue} USDT</div>
          <div className="flex-1 text-right">{row.wallet || 'N/A'}</div>
          <div className="flex-1 text-right">
            {row.status === 'Success' && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={() => alert(`Withdraw logic for tx ${row.id}`)}
              >
                Withdraw
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
