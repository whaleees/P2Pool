'use client'

import React, { useEffect, useState } from 'react'
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

export default function PendingRequests() {
  const [wallet, setWallet] = useState<string | null>(null)
  const [requests, setRequests] = useState<PendingRequest[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('wallet')
    if (stored) {
      setWallet(stored)

      fetch(`/api/portfolio/pending?wallet=${stored}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.requests) {
            const parsed = res.requests.map((r: any) => ({
              wallet: r.user_wallet,
              orders: 0, // optional, or fetch separately from user table
              completion: '—',
              success: r.status === 'Success',
              token: r.token,
              amount: r.token_amount.toLocaleString(),
              usdtValue: r.usdt_token_value.toLocaleString(),
              collateralCoin: r.collateral_token,
              collateralAmt: r.collateral_amount.toLocaleString(),
              collateralUSDT: r.usdt_collateral_value.toLocaleString(),
            }))
            setRequests(parsed)
          }
        })
    }
  }, [])

  const handleAction = (type: 'accept' | 'reject', req: PendingRequest) => {
    if (!wallet) {
      alert('Please connect your wallet first.')
      return
    }

    // Simulated backend action
    alert(`${type === 'accept' ? '✅ Accepted' : '❌ Rejected'} borrow request from ${req.wallet}`)
    console.log(`${type.toUpperCase()} REQUEST:`, req)
  }

  if (!wallet) {
    return <div className="text-center text-slate-400 mt-6">Please connect your wallet to view incoming requests.</div>
  }

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white font-semibold rounded-t-2xl px-4 py-3 text-sm">
        <div className="flex-1">Borrower</div>
        <div className="flex-1 text-right">Token</div>
        <div className="flex-1 text-right">Amount</div>
        <div className="flex-1 text-right">Collateral</div>
        <div className="flex-1 text-right">Status</div>
        <div className="flex-1 text-right">Action</div>
      </div>

      {/* Rows */}
      {requests.length === 0 ? (
        <div className="text-center text-slate-400 mt-6">No pending requests.</div>
      ) : (
        requests.map((req, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-b-2xl p-4 mt-2 transition text-sm"
          >
            {/* Borrower */}
            <div className="flex-1">
              <div className="text-white">{req.wallet}</div>
              <div className="text-xs text-slate-400 mt-1">
                {req.orders} orders | {req.completion} completion
              </div>
            </div>

            {/* Token */}
            <div className="flex-1 text-right text-white">{req.token}</div>

            {/* Amount */}
            <div className="flex-1 text-right">
              <div className="text-white">{req.amount}</div>
              <div className="text-xs text-slate-400 mt-1">≈ {req.usdtValue} USDT</div>
            </div>

            {/* Collateral */}
            <div className="flex-1 text-right">
              <div className="text-white">{req.collateralCoin}</div>
              <div className="text-xs text-slate-400 mt-1">
                {req.collateralAmt} ≈ {req.collateralUSDT} USDT
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

            {/* Action */}
            <div className="flex-1 flex justify-end gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-500 text-white"
                onClick={() => handleAction('accept', req)}
              >
                Accept
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-500 text-white"
                onClick={() => handleAction('reject', req)}
              >
                Reject
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
