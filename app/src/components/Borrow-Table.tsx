// src/components/BorrowTable.tsx
'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BorrowRow {
  date: string
  type: 'p2p' | 'pool'
  token: string
  amount: string
  usdtEquivalent: string
  wallet: string
}

export default function BorrowTable() {
  const PAGE_SIZE = 20
  const tokens = ['BTC', 'USDT', 'XRP', 'ETH', 'SOL']
  const modes: BorrowRow['type'][] = ['p2p', 'pool']

  // generate 30 dummy rows
  const allData: BorrowRow[] = Array.from({ length: 30 }, (_, i) => {
    const day = (i % 30) + 1
    const date = `2025-05-${String(day).padStart(2, '0')}`
    const type = modes[i % modes.length]
    const token = tokens[i % tokens.length]
    const base = i + 1
    const amount = `${(base * 10).toLocaleString()} ${token}`
    const usdtEquivalent = `${(base * 10 * 100).toLocaleString()} USDT`
    const wallet = type === 'p2p' ? `0x${Math.floor(Math.random() * 1e12).toString(16)}` : '-'

    return { date, type, token, amount, usdtEquivalent, wallet }
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
        <div className="flex-1 text-right">Type</div>
        <div className="flex-1 text-right">Token</div>
        <div className="flex-1 text-right">Amount</div>
        <div className="flex-1 text-right">≈ USDT</div>
        <div className="flex-1 text-right">Wallet Address</div>
        <div className="flex-1 text-right">Action</div>
      </div>

      {/* Rows */}
      {displayed.map((row, idx) => (
        <div
          key={start + idx}
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-b-2xl p-4 mt-2 transition text-sm"
        >
          {/* Date */}
          <div className="flex-1 text-white">{row.date}</div>

          {/* Type */}
          <div className="flex-1 text-right text-white capitalize">{row.type}</div>

          {/* Token */}
          <div className="flex-1 text-right text-white">{row.token}</div>

          {/* Amount + Equivalent */}
          <div className="flex-1 text-right">
            <div className="text-white">{row.amount}</div>
            <div className="text-xs text-slate-400 mt-1">≈ {row.usdtEquivalent}</div>
          </div>

          {/* Wallet Address */}
          <div className="flex-1 text-right text-white">{row.wallet}</div>

          {/* Action */}
          <div className="flex-1 flex justify-end">
            <Button
              size="sm"
              className="bg-slate-700 hover:bg-slate-600 text-white"
              onClick={async () => {
                const res = await fetch('/api/transaction', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    mode: row.type, // 'p2p' or 'pool'
                    action: 'repay',
                    status: 'success',
                    token: row.token,
                    amount: parseFloat(row.amount.replace(/[,A-Z ]/g, '')),
                    usdt_value: parseFloat(row.usdtEquivalent.replace(/[,A-Z ]/g, '')),
                    wallet: row.wallet,
                  }),
                })

                if (!res.ok) {
                  console.error('Failed to log repay', await res.json())
                } else {
                  console.log('Repay logged')
                  // Optionally refresh the TransactionLog tab or show a toast
                }
              }}
            >
              Repay
            </Button>
          </div>
        </div>
      ))}

      {/* Pagination Controls */}
      {totalPages > 1 && (
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
      )}
    </div>
  )
}
