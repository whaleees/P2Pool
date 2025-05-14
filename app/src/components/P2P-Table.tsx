'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BorrowRequestModal, P2PRow } from './Borrow-Request-Modal'

interface ApiResult {
  offers: P2PRow[]
  total: number
  page: number
  pageSize: number
}

export default function P2PTable() {
  const [page, setPage] = useState(0)
  const [offers, setOffers] = useState<P2PRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState<P2PRow | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(`/api/p2p-offers?page=${page}`)
      .then((res) => res.json() as Promise<ApiResult>)
      .then(({ offers, total }) => {
        if (!cancelled) {
          setOffers(offers)
          setTotal(total)
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page])

  const pageSize = 10
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="w-full mt-10">
      {/* Header */}
      <div className="flex justify-between px-6 py-3 text-slate-400 text-xs font-semibold uppercase">
        <div className="flex-1">Lender</div>
        <div className="flex-1 text-right">Lending Offer</div>
        <div className="flex-1 text-right">Collateral Required</div>
        <div className="flex-1 text-right">Action</div>
      </div>

      {/* Loading */}
      {loading && <div className="text-center py-8 text-slate-400">Loading…</div>}

      {/* Rows */}
      {!loading &&
        offers.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-2xl p-4 mt-2 transition"
          >
            <div className="flex-1 text-white">
              <div className="font-semibold">{row.lender}</div>
              <div className="text-xs text-slate-400 mt-1">
                {row.total_orders} orders | {row.completion} completion
              </div>
              <div className="text-xs text-green-400">👍{row.like_rate}</div>
            </div>

            <div className="flex-1 text-right text-white">
              <div className="font-semibold">
                {row.offer_amount} {row.offer_token}
              </div>
              <div className="text-xs text-slate-400 mt-1">≈ {row.offer_usdt} USDT</div>
            </div>

            <div className="flex-1 text-right text-white">
              <div className="font-semibold">{row.collateral_token}</div>
              <div className="text-xs text-slate-400 mt-1">
                Min: {row.collateral_min} ≈ {row.collateral_usdt} USDT
              </div>
            </div>

            <div className="flex-1 flex justify-end">
              <BorrowRequestModal
                row={row}
                open={active?.id === row.id}
                onOpenChange={(o) => setActive(o ? row : null)}
                onRequest={(amt, coll) => console.log('REQUEST BORROW', row.lender, amt, coll)}
              />
            </div>
          </div>
        ))}

      {/* Pagination */}
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
    </div>
  )
}
