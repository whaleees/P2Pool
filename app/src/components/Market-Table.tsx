// src/components/MarketTable.tsx
'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SupplyModal, AssetRow as SupplyRow } from './Supply-Modal'
import { BorrowModal, AssetRow as BorrowRow } from './Borrow-Modal'

type AssetRow = SupplyRow & BorrowRow

export default function MarketTable() {
  const PAGE_SIZE = 20
  const marketData: AssetRow[] = [
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
      asset: 'JLP',
      icon: '/icons/jlp.svg',
      totalSupply: '81.15M',
      totalSupplyUsd: '$367.61M',
      borrow: '-',
      borrowUsd: '-',
      ltv: '85%',
      supplyApy: '0.00%',
      borrowApy: '-',
    },
    {
      asset: 'PYUSD',
      icon: '/icons/pyusd.svg',
      totalSupply: '14.29M',
      totalSupplyUsd: '$14.28M',
      borrow: '10.47M',
      borrowUsd: '$10.47M',
      ltv: '0%',
      supplyApy: '4.93%',
      borrowApy: '12.26%',
    },
    {
      asset: 'USDT',
      icon: '/icons/usdt.svg',
      totalSupply: '11.66M',
      totalSupplyUsd: '$11.67M',
      borrow: '8.94M',
      borrowUsd: '$8.95M',
      ltv: '0%',
      supplyApy: '3.97%',
      borrowApy: '10.60%',
    },
    {
      asset: 'USDG',
      icon: '/icons/usdg.svg',
      totalSupply: '10.94M',
      totalSupplyUsd: '$10.95M',
      borrow: '9.62M',
      borrowUsd: '$9.62M',
      ltv: '0%',
      supplyApy: '9.02%',
      borrowApy: '12.34%',
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
      asset: 'BTC',
      icon: '/icons/btc.svg',
      totalSupply: '3.80M',
      totalSupplyUsd: '$100.45M',
      borrow: '1.20M',
      borrowUsd: '$31.70M',
      ltv: '70%',
      supplyApy: '2.90%',
      borrowApy: '6.50%',
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
    // ...add more items here if needed...
  ]

  const totalPages = Math.ceil(marketData.length / PAGE_SIZE)
  const [page, setPage] = useState(0)

  const start = page * PAGE_SIZE
  const end = start + PAGE_SIZE
  const displayed = marketData.slice(start, end)

  const [supplyActive, setSupplyActive] = useState<AssetRow | null>(null)
  const [borrowActive, setBorrowActive] = useState<AssetRow | null>(null)

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
          {/* Asset */}
          <div className="flex items-center gap-3 flex-1">
            <img src={item.icon} alt={item.asset} className="w-6 h-6" />
            <span className="text-white font-semibold">{item.asset}</span>
          </div>

          {/* Total Supply */}
          <div className="flex-1 text-right text-white">
            <div className="font-semibold">{item.totalSupply}</div>
            <div className="text-xs text-slate-400 mt-1">{item.totalSupplyUsd}</div>
          </div>

          {/* Total Borrow */}
          <div className="flex-1 text-right text-white">
            <div className="font-semibold">{item.borrow}</div>
            <div className="text-xs text-slate-400 mt-1">{item.borrowUsd}</div>
          </div>

          {/* LTV */}
          <div className="flex-1 text-right text-white">{item.ltv}</div>

          {/* Supply APY */}
          <div className="flex-1 text-right text-green-400 font-semibold">{item.supplyApy}</div>

          {/* Borrow APY */}
          <div className="flex-1 text-right text-orange-400 font-semibold">{item.borrowApy}</div>

          {/* Actions */}
          <div className="flex-1 flex justify-end gap-2">
            <SupplyModal
              row={item}
              open={supplyActive?.asset === item.asset}
              onOpenChange={(open) => setSupplyActive(open ? item : null)}
              onDeposit={(amt) => console.log('SUPPLY', amt, item.asset)}
            />
            <BorrowModal
              row={item}
              open={borrowActive?.asset === item.asset}
              onOpenChange={(open) => setBorrowActive(open ? item : null)}
              onBorrow={(amt, token, collAmt) => console.log('BORROW', amt, item.asset, 'with', collAmt, token)}
            />
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
            Showing {start + 1}&ndash;{Math.min(end, marketData.length)} of {marketData.length}
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
