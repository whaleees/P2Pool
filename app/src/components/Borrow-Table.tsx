'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BorrowRow {
  id: number
  date: string
  mode: 'p2p' | 'pool'
  status: 'Pending' | 'Borrowing' | 'Failed' | 'Paid'
  token: string
  amount: number
  usdt_value: number
  borrower_wallet: string
  user_wallet: string // lender's wallet
}

export default function BorrowTable() {
  const PAGE_SIZE = 20
  const [wallet, setWallet] = useState<string | null>(null)
  const [data, setData] = useState<BorrowRow[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wallet')
    if (stored) {
      setWallet(stored)
      fetch(`/api/portfolio/borrowed?wallet=${stored}`)
        .then((res) => res.json())
        .then((json) => {
          if (json?.transactions) {
            setData(json.transactions)
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const totalPages = Math.ceil(data.length / PAGE_SIZE)
  const start = page * PAGE_SIZE
  const end = start + PAGE_SIZE
  const displayed = data.slice(start, end)

  const handleRepay = async (row: BorrowRow) => {
    setSubmittingId(row.id)
    try {
      const res = await fetch('/api/transaction/repay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: row.id, status: 'paid' }),
      })

      if (res.ok) {
        alert('✅ Repayment successful.')
        setData((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'paid' } : r)))
      } else {
        alert('❌ Repayment failed.')
      }
    } catch (err) {
      console.error(err)
      alert('❌ Unexpected error.')
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) return <div className="text-center text-slate-400 mt-6">Loading borrowed transactions…</div>
  if (!wallet) return <div className="text-center text-slate-400 mt-6">Connect your wallet to continue.</div>
  if (data.length === 0) return <div className="text-center text-slate-400 mt-6">No borrowed transactions found.</div>

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white font-semibold rounded-t-2xl px-4 py-3 text-sm">
        <div className="flex-1">Date</div>
        <div className="flex-1 text-right">Type</div>
        <div className="flex-1 text-right">Token</div>
        <div className="flex-1 text-right">Amount</div>
        <div className="flex-1 text-right">≈ USDT</div>
        <div className="flex-1 text-right">Lender Wallet</div>
        <div className="flex-1 text-right">Status</div>
        <div className="flex-1 text-right">Action</div>
      </div>

      {/* Rows */}
      {displayed.map((row) => (
        <div
          key={row.id}
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-b-2xl p-4 mt-2 transition text-sm"
        >
          <div className="flex-1 text-white">{row.date}</div>
          <div className="flex-1 text-right capitalize text-white">{row.mode}</div>
          <div className="flex-1 text-right text-white">{row.token}</div>
          <div className="flex-1 text-right text-white">{row.amount}</div>
          <div className="flex-1 text-right text-white">{row.usdt_value} USDT</div>
          <div className="flex-1 text-right text-white">{row.user_wallet}</div>
          <div className="flex-1 text-right">
            <div className="flex-1 text-right text-white">
              {row.status.toLowerCase() === 'borrowing' && <span className="text-yellow-400">Borrowing</span>}
              {row.status.toLowerCase() === 'pending' && <span className="text-slate-400">Pending</span>}
              {row.status.toLowerCase() === 'paid' && <span className="text-green-400">Paid</span>}
              {row.status.toLowerCase() === 'failed' && <span className="text-red-400">Failed</span>}
            </div>
          </div>
          <div className="flex-1 flex justify-end">
            {row.status.toLowerCase() === 'borrowing' && (
              <Button
                size="sm"
                className="bg-slate-700 hover:bg-slate-600 text-white"
                onClick={() => handleRepay(row)}
                disabled={submittingId === row.id}
              >
                {submittingId === row.id ? 'Repaying…' : 'Repay'}
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="p-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-full"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="text-slate-400 text-sm">
            Showing {start + 1}–{Math.min(end, data.length)} of {data.length}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
            className="p-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-full"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  )
}
