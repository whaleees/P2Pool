'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SupplyModal, AssetRow as SupplyRow } from './Supply-Modal'
import { BorrowModal, AssetRow as BorrowRow } from './Borrow-Modal'

type AssetRow = SupplyRow & BorrowRow

export default function MarketTable() {
  const PAGE_SIZE = 20
  const [marketData, setMarketData] = useState<AssetRow[]>([])
  const [page, setPage] = useState(0)
  const [wallet, setWallet] = useState<string | null>(null)

  const [supplyActive, setSupplyActive] = useState<AssetRow | null>(null)
  const [borrowActive, setBorrowActive] = useState<AssetRow | null>(null)

  useEffect(() => {
    // Fetch wallet from localStorage
    const stored = localStorage.getItem('wallet')
    if (stored) setWallet(stored)

    // Simulated market data fetch
    setMarketData([
      {
        asset: 'USDC',
        icon: '/icons/usdc.svg',
        totalSupply: '214.60M',
        totalSupplyUsd: '$214.61M',
        borrow: '146.64M',
        borrowUsd: '$146.64M',
        ltv: '0%',
        supplyApy: '4.27%',
        borrowApy: '11.76%',
      },
      {
        asset: 'ETH',
        icon: '/icons/eth.svg',
        totalSupply: '5.20M',
        totalSupplyUsd: '$15.30M',
        borrow: '2.80M',
        borrowUsd: '$8.24M',
        ltv: '75%',
        supplyApy: '3.50%',
        borrowApy: '7.80%',
      },
      {
        asset: 'SOL',
        icon: '/icons/sol.svg',
        totalSupply: '8.45M',
        totalSupplyUsd: '$20.10M',
        borrow: '4.30M',
        borrowUsd: '$10.25M',
        ltv: '80%',
        supplyApy: '5.10%',
        borrowApy: '9.25%',
      },
    ])
  }, [])

  const totalPages = Math.ceil(marketData.length / PAGE_SIZE)
  const start = page * PAGE_SIZE
  const end = start + PAGE_SIZE
  const displayed = marketData.slice(start, end)

  const handleSupply = (amt: number, asset: string) => {
    if (!wallet) return alert('Please connect your wallet first.')
    console.log('SUPPLY', amt, asset)
  }

  const handleBorrow = (amt: number, asset: string, collAmt: number, collToken: string) => {
    if (!wallet) return alert('Please connect your wallet first.')
    console.log('BORROW', amt, asset, 'with', collAmt, collToken)
  }

  return (
    <div className="w-full mt-10">
      {/* Table Header */}
      <div className="flex justify-between px-6 py-3 text-slate-400 text-xs font-semibold uppercase">
        <div className="flex-1">Asset</div>
        <div className="flex-1 text-right">Total Supply</div>
        <div className="flex-1 text-right">Total Borrow</div>
        <div className="flex-1 text-right">Liquidation LTV</div>
        <div className="flex-1 text-right">Supply APY</div>
        <div className="flex-1 text-right">Borrow APY</div>
        <div className="flex-1 text-right">Actions</div>
      </div>

      {/* Table Rows */}
      {displayed.map((item) => (
        <div
          key={item.asset}
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-2xl p-4 mt-2 transition"
        >
          <div className="flex items-center gap-3 flex-1">
            <img src={item.icon} alt={item.asset} className="w-6 h-6" />
            <span className="text-white font-semibold">{item.asset}</span>
          </div>
          <div className="flex-1 text-right text-white">
            <div className="font-semibold">{item.totalSupply}</div>
            <div className="text-xs text-slate-400 mt-1">{item.totalSupplyUsd}</div>
          </div>
          <div className="flex-1 text-right text-white">
            <div className="font-semibold">{item.borrow}</div>
            <div className="text-xs text-slate-400 mt-1">{item.borrowUsd}</div>
          </div>
          <div className="flex-1 text-right text-white">{item.ltv}</div>
          <div className="flex-1 text-right text-green-400 font-semibold">{item.supplyApy}</div>
          <div className="flex-1 text-right text-orange-400 font-semibold">{item.borrowApy}</div>

          <div className="flex-1 flex justify-end gap-2">
            <SupplyModal
              row={item}
              open={supplyActive?.asset === item.asset}
              onOpenChange={(open) => setSupplyActive(open ? item : null)}
              onDeposit={(amt) => handleSupply(amt, item.asset)}
            />
            <BorrowModal
              row={item}
              open={borrowActive?.asset === item.asset}
              onOpenChange={(open) => setBorrowActive(open ? item : null)}
              onBorrow={(amt, collToken, collAmt) => handleBorrow(amt, item.asset, collAmt, collToken)}
            />
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="p-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-full transition"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="text-slate-400 text-sm">
            Showing {start + 1}–{Math.min(end, marketData.length)} of {marketData.length}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
            className="p-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-full transition"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  )
}
