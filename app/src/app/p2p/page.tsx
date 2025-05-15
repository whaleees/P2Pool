'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { BorrowRequestModal, P2PRow } from '@/components/Borrow-Request-Modal'

interface ApiResult {
  offers: P2PRow[]
  total: number
  page: number
  pageSize: number
}

export default function P2PTable() {
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [offers, setOffers] = useState<P2PRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState<P2PRow | null>(null)
  const [wallet, setWallet] = useState<string | null>(null)

  const totalPages = Math.ceil(total / pageSize)

  const fetchOffers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/p2p-offers?page=${page}`)
      const { offers, total }: ApiResult = await res.json()
      setOffers(offers)
      setTotal(total)
    } catch (err) {
      console.error('Failed to fetch offers:', err)
      setOffers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('wallet')
    if (stored) setWallet(stored)
    fetchOffers()
  }, [page])

  const handleRequest = (amount: number, collateralAmt: number, row: P2PRow) => {
    if (!wallet) {
      alert('Please connect your wallet before submitting a request.')
      return
    }
    console.log('✅ REQUEST BORROW:', row.lender, amount, collateralAmt)
    alert('Borrow request submitted!')
  }

  return (
    <div className="w-[70vw] mt-10 mx-auto">
      {/* Header Row */}
      <div className="flex justify-between items-center px-6 pb-2 text-slate-400 text-xs font-semibold uppercase">
        <div className="flex-1">Lender</div>
        <div className="flex-1 text-right">Lending Offer</div>
        <div className="flex-1 text-right">Collateral Required</div>
        <div className="flex-1 text-right">Duration</div>
        <div className="flex-1 text-right flex justify-end gap-2">
          <span>Action</span>
          <button
            title="Refresh offers"
            onClick={fetchOffers}
            className="p-1 text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="text-center py-8 text-slate-400">Loading offers…</div>}

      {/* Empty state */}
      {!loading && offers.length === 0 && (
        <div className="text-center py-8 text-slate-400">No P2P offers available at the moment.</div>
      )}

      {/* Offers List */}
      {!loading &&
        offers.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-2xl p-4 mt-2 transition"
          >
            {/* Lender Info */}
            <div className="flex-1 text-white">
              <div className="font-semibold">{row.lender}</div>
              <div className="text-xs text-slate-400 mt-1">
                {row.total_orders} orders | {row.completion} completion
              </div>
            </div>

            {/* Offer */}
            <div className="flex-1 text-right text-white">
              <div className="font-semibold">
                {row.offer_amount} {row.offer_token}
              </div>
              <div className="text-xs text-slate-400 mt-1">≈ {row.offer_usdt} USDT</div>
            </div>

            {/* Collateral */}
            <div className="flex-1 text-right text-white">
              <div className="font-semibold">{row.collateral_token}</div>
              <div className="text-xs text-slate-400 mt-1">
                Min: {row.collateral_min} ≈ {row.collateral_usdt} USDT
              </div>
            </div>

            {/* Duration */}
            <div className="flex-1 text-right text-white font-semibold">{row.duration} days</div>

            {/* Borrow Action */}
            <div className="flex-1 flex justify-end">
              <BorrowRequestModal
                row={row}
                open={active?.id === row.id}
                onOpenChange={(o) => setActive(o ? row : null)}
                onRequest={(amt, collAmt) => handleRequest(amt, collAmt, row)}
              />
            </div>
          </div>
        ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="p-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-full"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>

          <span className="text-slate-400 text-sm">
            Page {page + 1} of {totalPages}
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
