'use client'

import { FC, useState, useEffect } from 'react'
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

interface SupplyModalProps {
  row: AssetRow
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeposit: (amount: number) => void
}

export const SupplyModal: FC<SupplyModalProps> = ({ row, open, onOpenChange, onDeposit }) => {
  const [depositAmt, setDepositAmt] = useState<number>(0)
  const [wallet, setWallet] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const minCollateralPct = 50
  const usdValue = parseFloat(row.totalSupplyUsd.replace(/[$,M]/g, '')) || 0
  const minCollateral = (depositAmt * minCollateralPct) / 100
  const minCollateralUsd = (minCollateral * usdValue) / (parseFloat(row.totalSupply.replace(/[^\d.]/g, '')) || 1)

  useEffect(() => {
    const stored = localStorage.getItem('wallet')
    if (stored) setWallet(stored)
  }, [])

  const handleDeposit = async () => {
    if (!wallet) {
      alert('Please connect your wallet first.')
      return
    }
    if (!depositAmt || depositAmt <= 0) {
      alert('Please enter a valid amount to deposit.')
      return
    }

    setSubmitting(true)
    try {
      // Simulate successful deposit action
      onDeposit(depositAmt)
      alert('✅ Deposit successful!')
      onOpenChange(false)
      setDepositAmt(0)
    } catch (err) {
      console.error('Deposit failed:', err)
      alert('❌ Failed to deposit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm rounded-lg transition"
          variant="ghost"
        >
          Supply
        </Button>
      </DialogTrigger>

      <DialogOverlay className="fixed inset-0 bg-black/60" />

      <DialogContent
        className="
          fixed left-1/2 top-1/2
          w-[90vw] max-w-md
          max-h-[80vh]
          -translate-x-1/2 -translate-y-1/2
          rounded-2xl bg-slate-800 p-6 shadow-xl overflow-auto
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Supply {row.asset}</DialogTitle>
        </DialogHeader>

        {/* Stats */}
        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
          <div>
            <span className="font-medium text-white">Market Supply:</span> {row.totalSupply} ({row.totalSupplyUsd})
          </div>
          <div>
            <span className="font-medium text-white">Total Borrowed:</span> {row.borrow} ({row.borrowUsd})
          </div>
          <div>
            <span className="font-medium text-white">Supply APY:</span> {row.supplyApy}
          </div>
        </div>

        {/* Input */}
        <div className="mt-6 flex flex-col gap-1">
          <Label htmlFor="deposit" className="text-slate-300">
            Deposit Amount
          </Label>
          <Input
            id="deposit"
            type="number"
            value={depositAmt}
            onChange={(e) => setDepositAmt(parseFloat(e.target.value))}
            placeholder="0.0"
            className="w-full bg-slate-700 border-slate-600 text-white placeholder-slate-500"
          />
          <p className="text-xs text-slate-400">
            Min collateral: {minCollateralPct}% ({isNaN(minCollateralUsd) ? '–' : `$${minCollateralUsd.toFixed(2)}`}{' '}
            USD)
          </p>
        </div>

        <DialogFooter className="mt-6">
          <Button
            className="w-full rounded-lg bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold hover:opacity-90 transition"
            onClick={handleDeposit}
            disabled={depositAmt <= 0 || submitting}
          >
            {submitting ? 'Submitting…' : 'Deposit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
