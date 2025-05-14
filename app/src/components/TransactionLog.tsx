// src/components/TransactionLog.tsx
'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Transaction {
  date: string
  mode: 'p2p' | 'pool'
  action: 'borrow' | 'lend'
  status: 'Success' | 'Failed' | 'Pending'
  token: string
  amount: string
  usdtValue: string
  wallet: string
}

export default function TransactionLog() {
  const PAGE_SIZE = 20
  const tokens = ['BTC', 'USDT', 'XRP', 'ETH', 'SOL']
  const modes: Transaction['mode'][] = ['p2p', 'pool']
  const actions: Transaction['action'][] = ['borrow', 'lend']
  const statuses: Transaction['status'][] = ['Success', 'Failed', 'Pending']

  // generate 30 dummy entries
  const allData: Transaction[] = Array.from({ length: 30 }, (_, i) => {
    const day = 14 - (i % 5)
    const hour = (14 - (i % 24)).toString().padStart(2, '0')
    const minute = ((i * 7) % 60).toString().padStart(2, '0')
    const date = `2025-05-${String(day).padStart(2, '0')} ${hour}:${minute} UTC`
    const mode = modes[i % modes.length]
    const action = actions[i % actions.length]
    const status = statuses[i % statuses.length]
    const token = tokens[i % tokens.length]
    const amount = (Math.random() * 1000 + 1).toFixed(2)
    const usdtValue = (parseFloat(amount) * (Math.random() * 50000 + 1)).toFixed(0)
    const wallet = mode === 'p2p' ? `0x${Math.floor(Math.random() * 1e12).toString(16)}` : '-'

    return { date, mode, action, status, token, amount, usdtValue, wallet }
  })

  const totalPages = Math.ceil(allData.length / PAGE_SIZE)
  const [page, setPage] = useState(0)

  const start = page * PAGE_SIZE
  const end = start + PAGE_SIZE
  const displayed = allData.slice(start, end)

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white font-semibold rounded-t-2xl px-4 py-3 text-sm">
        <div className="flex-1">Date</div>
        <div className="flex-1 text-right">Mode</div>
        <div className="flex-1 text-right">Action</div>
        <div className="flex-1 text-right">Status</div>
        <div className="flex-1 text-right">Token</div>
        <div className="flex-1 text-right">Amount</div>
        <div className="flex-1 text-right">≈ USDT</div>
        <div className="flex-1 text-right">Wallet</div>
      </div>

      {/* Rows */}
      {displayed.map((tx, idx) => (
        <div
          key={start + idx}
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-b-2xl p-4 mt-2 transition text-sm"
        >
          <div className="flex-1 text-white">{tx.date}</div>
          <div className="flex-1 text-right capitalize text-white">{tx.mode}</div>
          <div className="flex-1 text-right capitalize text-white">{tx.action}</div>
          <div className="flex-1 text-right">
            {tx.status === 'Success' && <span className="text-green-400">{tx.status}</span>}
            {tx.status === 'Failed' && <span className="text-red-400">{tx.status}</span>}
            {tx.status === 'Pending' && <span className="text-yellow-400">{tx.status}</span>}
          </div>
          <div className="flex-1 text-right text-white">{tx.token}</div>
          <div className="flex-1 text-right text-white">{tx.amount}</div>
          <div className="flex-1 text-right text-white">{tx.usdtValue} USDT</div>
          <div className="flex-1 text-right text-white">{tx.wallet}</div>
        </div>
      ))}

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="p-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
        <span className="text-slate-400 text-sm">
          Showing {start + 1}–{Math.min(end, allData.length)} of {allData.length}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={page >= totalPages - 1}
          className="p-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </div>
  )
}
