// src/components/PendingRequests.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface PendingRequest {
  wallet: string
  orders: number
  completion: string
  success: boolean
  token: string
  amount: string
  usdtValue: string
  collateralCoin: string
  collateralAmt: string
  collateralUSDT: string
}

const pendingData: PendingRequest[] = [
  {
    wallet: '0x7acb72a802',
    orders: 12,
    completion: '—',
    success: false,
    token: 'BTC',
    amount: '0.75',
    usdtValue: '47,250',
    collateralCoin: 'USDC',
    collateralAmt: '1,000',
    collateralUSDT: '1,000',
  },
  {
    wallet: '0x2193182903',
    orders: 8,
    completion: '—',
    success: false,
    token: 'XRP',
    amount: '5,000',
    usdtValue: '10,000',
    collateralCoin: 'SOL',
    collateralAmt: '200',
    collateralUSDT: '20,000',
  },
  {
    wallet: '0x332b9d20ef',
    orders: 15,
    completion: '—',
    success: false,
    token: 'USDT',
    amount: '12,000',
    usdtValue: '12,000',
    collateralCoin: 'ETH',
    collateralAmt: '2.5',
    collateralUSDT: '10,000',
  },
]

export default function PendingRequests() {
  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white font-semibold rounded-t-2xl px-4 py-3 text-sm">
        <div className="flex-1">Wallet Address</div>
        <div className="flex-1 text-right">Status</div>
        <div className="flex-1 text-right">Token</div>
        <div className="flex-1 text-right">Amount</div>
        <div className="flex-1 text-right">Collateral Token</div>
        <div className="flex-1 text-right">Collateral Amount</div>
        <div className="flex-1 text-right">Actions</div>
      </div>

      {/* Rows */}
      {pendingData.map((req, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-b-2xl p-4 mt-2 transition text-sm"
        >
          {/* Wallet + orders|completion */}
          <div className="flex-1">
            <div className="text-white">{req.wallet}</div>
            <div className="text-xs text-slate-400 mt-1">
              {req.orders} orders | {req.completion} completion
            </div>
          </div>

          {/* Status */}
          <div className="flex-1 text-right">
            {req.success ? (
              <span className="text-green-400">Success</span>
            ) : (
              <span className="text-yellow-400">Pending</span>
            )}
          </div>

          {/* Token */}
          <div className="flex-1 text-right text-white">{req.token}</div>

          {/* Amount + USDT equivalent */}
          <div className="flex-1 text-right">
            <div className="text-white">{req.amount}</div>
            <div className="text-xs text-slate-400 mt-1">≈ {req.usdtValue} USDT</div>
          </div>

          {/* Collateral Token */}
          <div className="flex-1 text-right text-white">{req.collateralCoin}</div>

          {/* Collateral Amount + USDT equivalent */}
          <div className="flex-1 text-right">
            <div className="text-white">{req.collateralAmt}</div>
            <div className="text-xs text-slate-400 mt-1">≈ {req.collateralUSDT} USDT</div>
          </div>

          {/* Actions */}
          <div className="flex-1 flex justify-end gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-500 text-white"
              onClick={() => console.log('Accept', req)}
            >
              Accept
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-500 text-white"
              onClick={() => console.log('Reject', req)}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
