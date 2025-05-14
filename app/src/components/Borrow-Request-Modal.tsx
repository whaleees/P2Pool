// src/components/BorrowRequestModal.tsx
'use client'

import { FC, useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// matches your p2p_offers table
export interface P2PRow {
  id: number
  lender: string
  total_orders: number
  completion: string
  like_rate: string
  offer_token: string
  offer_amount: number
  offer_usdt: number
  collateral_token: string
  collateral_min: number
  collateral_usdt: number
  created_at: string
}

interface BorrowRequestModalProps {
  row: P2PRow
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequest: (amount: number, collateralAmt: number) => void
}

export const BorrowRequestModal: FC<BorrowRequestModalProps> = ({ row, open, onOpenChange, onRequest }) => {
  const [amount, setAmount] = useState<number>(0)
  const [collAmt, setCollAmt] = useState<number>(0)

  // example business rules
  const minBorrow = row.offer_amount * 0.1
  const usdtPerCollateralUnit = row.collateral_usdt / row.collateral_min

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-white bg-slate-700 hover:bg-slate-600">
          Borrow
        </Button>
      </DialogTrigger>

      <DialogOverlay className="fixed inset-0 bg-black/60" />

      {/* Center via left-1/2/top-1/2 + translate */}
      <DialogContent
        className="
        fixed
        left-1/2 top-1/2
        w-[90vw] max-w-md max-h-[80vh]
        -translate-x-1/2 -translate-y-1/2
        rounded-2xl bg-slate-800 p-6 shadow-xl overflow-auto
      "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Borrow {row.offer_token}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-2 text-sm text-slate-200">
          <div>
            <span className="font-medium text-white">Offered Amount:</span> {row.offer_amount} {row.offer_token} (~
            {row.offer_usdt} USDT)
          </div>
          <div>
            <span className="font-medium text-white">Collateral Required:</span> {row.collateral_token} (min{' '}
            {row.collateral_min})
          </div>
        </div>

        {/* Borrow Amount */}
        <div className="mt-6">
          <Label htmlFor="borrowAmt" className="text-slate-300">
            Borrow Amount ({row.offer_token})
          </Label>
          <Input
            id="borrowAmt"
            type="number"
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            placeholder={`${minBorrow.toFixed(2)}`}
            className="mt-1 w-full bg-slate-700 border-slate-600 text-white"
          />
          <p className="text-xs text-slate-400 mt-1">
            Min: {minBorrow.toFixed(2)} {row.offer_token}
          </p>
        </div>

        {/* Collateral Amount */}
        <div className="mt-4">
          <Label htmlFor="collAmt" className="text-slate-300">
            Collateral Amount ({row.collateral_token})
          </Label>
          <Input
            id="collAmt"
            type="number"
            value={collAmt || ''}
            onChange={(e) => setCollAmt(parseFloat(e.target.value))}
            placeholder={`${row.collateral_min}`}
            className="mt-1 w-full bg-slate-700 border-slate-600 text-white"
          />
          <p className="text-xs text-slate-400 mt-1">
            Min: {row.collateral_min} {row.collateral_token}
          </p>
          <p className="text-xs text-slate-400">≈ {(collAmt * usdtPerCollateralUnit).toFixed(2)} USDT</p>
        </div>

        <DialogFooter className="mt-6">
          <Button
            className="w-full rounded-lg bg-gradient-to-r from-sky-400 to-blue-600"
            onClick={() => {
              onRequest(amount, collAmt)
              onOpenChange(false)
            }}
            disabled={amount < minBorrow || collAmt < row.collateral_min}
          >
            Request Borrow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
