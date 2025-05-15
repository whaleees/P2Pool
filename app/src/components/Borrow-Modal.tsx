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

export interface AssetRow {
  asset: string
  icon: string
  totalSupply: string
  totalSupplyUsd: string
  borrow: string
  borrowUsd: string
  ltv: string
  supplyApy: string
  borrowApy: string
}

interface BorrowModalProps {
  row: AssetRow
  open: boolean
  onOpenChange: (open: boolean) => void
  onBorrow: (amount: number, collateralToken: string, collateralAmt: number) => void
}

export const BorrowModal: FC<BorrowModalProps> = ({ row, open, onOpenChange, onBorrow }) => {
  const [borrowAmt, setBorrowAmt] = useState<number>(0)
  const [collateralToken, setCollateralToken] = useState<string>('USDC')
  const [collateralAmt, setCollateralAmt] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)

  const totalSupplyNum = parseFloat(row.totalSupply.replace(/[,M]/g, ''))
  const minBorrow = (totalSupplyNum * 1) / 100
  const maxBorrowPct = parseFloat(row.ltv.replace('%', '')) || 50
  const maxBorrow = (totalSupplyNum * maxBorrowPct) / 100
  const minCollateral = (borrowAmt * maxBorrowPct) / 100

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      onBorrow(borrowAmt, collateralToken, collateralAmt)
      alert('✅ Borrow request submitted.')
    } catch (error) {
      console.error('Borrow failed:', error)
      alert('❌ Borrow failed. Please try again.')
    } finally {
      setSubmitting(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm rounded-lg transition text-white"
        >
          Borrow
        </Button>
      </DialogTrigger>

      <DialogOverlay className="fixed inset-0 bg-black/60" />

      <DialogContent
        className="
          fixed left-1/2 top-1/2
          w-[90vw] max-w-md max-h-[80vh]
          -translate-x-1/2 -translate-y-1/2
          rounded-2xl bg-slate-800 p-6 shadow-xl overflow-auto
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Borrow {row.asset}</DialogTitle>
        </DialogHeader>

        {/* Stats */}
        <div className="mt-4 space-y-2 text-sm text-slate-200">
          <div>
            <span className="font-medium text-white">Market Supply:</span> {row.totalSupply} ({row.totalSupplyUsd})
          </div>
          <div>
            <span className="font-medium text-white">Total Borrowed:</span> {row.borrow} ({row.borrowUsd})
          </div>
          <div>
            <span className="font-medium text-white">Interest (APY):</span> {row.borrowApy}
          </div>
        </div>

        {/* Borrow Input */}
        <div className="mt-6">
          <Label htmlFor="borrowAmt" className="text-slate-300">
            Borrow Amount ({row.asset})
          </Label>
          <Input
            id="borrowAmt"
            type="number"
            value={borrowAmt || ''}
            onChange={(e) => setBorrowAmt(parseFloat(e.target.value))}
            placeholder={`${minBorrow.toFixed(2)} ${row.asset}`}
            className="mt-1 w-full bg-slate-700 border-slate-600 text-white placeholder-slate-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            Min: {minBorrow.toFixed(2)} {row.asset} — Max: {maxBorrow.toFixed(2)} {row.asset}
          </p>
        </div>

        {/* Collateral Inputs */}
        <div className="mt-4 flex gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <Label htmlFor="collatToken" className="text-slate-300">
              Collateral Token
            </Label>
            <Input
              id="collatToken"
              list="tokens"
              value={collateralToken}
              onChange={(e) => setCollateralToken(e.target.value)}
              className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
            <datalist id="tokens">
              <option value="USDC" />
              <option value="USDT" />
              <option value="SOL" />
              <option value="ETH" />
            </datalist>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <Label htmlFor="collatAmt" className="text-slate-300">
              Collateral Amount
            </Label>
            <Input
              id="collatAmt"
              type="number"
              value={collateralAmt || ''}
              onChange={(e) => setCollateralAmt(parseFloat(e.target.value))}
              placeholder={minCollateral.toFixed(2)}
              className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Min collateral: {minCollateral.toFixed(2)} {collateralToken}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            className="w-full rounded-lg bg-gradient-to-r from-sky-400 to-blue-600 text-white"
            onClick={handleSubmit}
            disabled={borrowAmt < minBorrow || borrowAmt > maxBorrow || collateralAmt < minCollateral || submitting}
          >
            {submitting ? 'Submitting…' : 'Request Borrow'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
