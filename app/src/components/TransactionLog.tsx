'use client'

import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

interface Transaction {
  id: number
  date: string
  mode: 'p2p' | 'pool'
  action: string
  status: string
  token: string
  amount: number
  usdt_value: number
  borrower_wallet: string
  user_wallet: string
}

export default function TransactionLog() {
  const PAGE_SIZE = 20
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [page, setPage] = useState(0)
  const [wallet, setWallet] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE)
  const start = page * PAGE_SIZE
  const end = start + PAGE_SIZE
  const displayed = transactions.slice(start, end)

  const fetchTransactions = async () => {
    if (!wallet) return
    setLoading(true)
    try {
      const res = await fetch(`/api/transactions?wallet=${wallet}`)
      const data = await res.json()
      setTransactions(data.transactions || [])
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('wallet')
    if (stored) {
      setWallet(stored)
    }
  }, [])

  useEffect(() => {
    if (wallet) {
      fetchTransactions()
    }
  }, [wallet])

  if (!wallet) {
    return (
      <div className="w-full mt-6 text-center text-slate-400">
        Please connect your wallet to view your transaction history.
      </div>
    )
  }

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
        <div className="flex-1 text-right flex justify-end items-center gap-2">
          Borrower Wallet
          <button onClick={fetchTransactions} title="Refresh transactions">
            <RotateCcw className="w-4 h-4 text-slate-400 hover:text-white transition" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="text-center text-slate-400 mt-4">Loading transactions…</div>}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <div className="text-center text-slate-400 mt-4">No transactions found.</div>
      )}

      {/* Transaction Rows */}
      {displayed.map((tx, idx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-b-2xl p-4 mt-2 transition text-sm"
        >
          <div className="flex-1 text-white">{tx.date}</div>
          <div className="flex-1 text-right capitalize text-white">{tx.mode}</div>
          <div className="flex-1 text-right capitalize text-white">{tx.action}</div>
          <div className="flex-1 text-right">
            {tx.status.toLowerCase() === 'success' && <span className="text-green-400">Success</span>}
            {tx.status.toLowerCase() === 'failed' && <span className="text-red-400">Failed</span>}
            {tx.status.toLowerCase() === 'pending' && <span className="text-yellow-400">Pending</span>}
            {!['success', 'failed', 'pending'].includes(tx.status.toLowerCase()) && (
              <span className="text-slate-400">{tx.status}</span>
            )}
          </div>
          <div className="flex-1 text-right text-white">{tx.token}</div>
          <div className="flex-1 text-right text-white">{tx.amount}</div>
          <div className="flex-1 text-right text-white">{tx.usdt_value} USDT</div>
          <div className="flex-1 text-right text-white">{tx.borrower_wallet}</div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="p-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-full"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="text-slate-400 text-sm">
            Showing {start + 1}–{Math.min(end, transactions.length)} of {transactions.length}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
            className="p-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-full"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  )
}
