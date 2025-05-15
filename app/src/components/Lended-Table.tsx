'use client'

import { useEffect, useState } from 'react'

interface LendingRow {
  date: string
  type: 'p2p' | 'pool'
  token: string
  amount: string
  usdtEquivalent: string
  wallet: string
}

const MAX_DISPLAY = 20

export default function LendedTable() {
  const [wallet, setWallet] = useState<string | null>(null)
  const [lendingData, setLendingData] = useState<LendingRow[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('wallet')
    if (stored) setWallet(stored)

    // Simulated API response
    const dummyData: LendingRow[] = [
      {
        date: '2025-05-14',
        type: 'p2p',
        token: 'XRP',
        amount: '5,000 XRP',
        usdtEquivalent: '10,000 USDT',
        wallet: '0x2193182903',
      },
      {
        date: '2025-05-13',
        type: 'p2p',
        token: 'BTC',
        amount: '0.75 BTC',
        usdtEquivalent: '47,250 USDT',
        wallet: '0x7acb72a802',
      },
      {
        date: '2025-05-13',
        type: 'p2p',
        token: 'USDT',
        amount: '12,000 USDT',
        usdtEquivalent: '12,000 USDT',
        wallet: '0x332b9d20ef',
      },
      {
        date: '2025-05-12',
        type: 'pool',
        token: 'DOGE',
        amount: '150,000 DOGE',
        usdtEquivalent: '12,000 USDT',
        wallet: '0',
      },
      {
        date: '2025-05-11',
        type: 'pool',
        token: 'ETH',
        amount: '8 ETH',
        usdtEquivalent: '20,000 USDT',
        wallet: '0',
      },
    ]

    // Optionally filter by current user wallet
    setLendingData(dummyData)
  }, [])

  if (!wallet) {
    return (
      <div className="w-full mt-6 text-center text-slate-400">
        Please connect your wallet to view your lending activity.
      </div>
    )
  }

  const displayed = lendingData.slice(0, MAX_DISPLAY)

  return (
    <div className="w-full mt-10">
      {/* Table Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white font-semibold rounded-t-2xl px-4 py-3 text-sm">
        <div className="flex-1">Date</div>
        <div className="flex-1 text-right">Type</div>
        <div className="flex-1 text-right">Token</div>
        <div className="flex-1 text-right">Amount</div>
        <div className="flex-1 text-right">≈ USDT</div>
        <div className="flex-1 text-right">Wallet</div>
      </div>

      {/* Lending Data Rows */}
      {displayed.map((row, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-b-2xl p-4 mt-2 transition text-sm"
        >
          <div className="flex-1 text-white">{row.date}</div>
          <div className="flex-1 text-right capitalize text-white">{row.type}</div>

          <div className="flex-1 text-right text-white">{row.token}</div>

          <div className="flex-1 text-right text-white">{row.amount}</div>

          <div className="flex-1 text-right text-white">{row.usdtEquivalent}</div>

          <div className="flex-1 text-right text-white">{row.type === 'pool' ? 'N/A' : row.wallet}</div>
        </div>
      ))}

      {lendingData.length > MAX_DISPLAY && (
        <div className="text-center text-slate-400 text-sm mt-4">
          Showing {MAX_DISPLAY} of {lendingData.length} entries
        </div>
      )}
    </div>
  )
}
