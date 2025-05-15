'use client'

import { useEffect, useState } from 'react'
import LendedTable from '@/components/Lended-Table'
import BorrowTable from '@/components/Borrow-Table'
import TransactionLog from '@/components/TransactionLog'
import P2PRequests from '@/components/P2P-Requests'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PortfolioPage() {
  const [wallet, setWallet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'lended' | 'borrowed' | 'log' | 'pending'>('lended')
  const router = useRouter()

  useEffect(() => {
    const checkWallet = () => {
      const stored = localStorage.getItem('wallet')
      setWallet(stored)
      setLoading(false)
    }

    checkWallet()

    const handleChange = () => checkWallet()
    window.addEventListener('storage', handleChange)
    window.addEventListener('visibilitychange', handleChange)
    window.addEventListener('wallet-change', handleChange) // Custom manual dispatch

    return () => {
      window.removeEventListener('storage', handleChange)
      window.removeEventListener('visibilitychange', handleChange)
      window.removeEventListener('wallet-change', handleChange)
    }
  }, [])

  if (loading) {
    return <div className="w-[70vw] mx-auto mt-10 text-center text-slate-400">Loading wallet info...</div>
  }

  if (!wallet) {
    return (
      <div className="w-[70vw] mx-auto mt-10 text-center text-slate-400">
        <h1 className="text-2xl mb-4">Portfolio</h1>
        <p>Please connect your wallet to view your portfolio.</p>
      </div>
    )
  }

  return (
    <div className="w-[70vw] mx-auto mt-10">
      {/* Header */}
      <div className="flex flex-col gap-y-3 mb-5">
        <div className="flex gap-x-3 text-white items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-slate-600 p-3 rounded-md hover:bg-slate-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl">Dashboard</h1>
        </div>
        <h1 className="text-slate-400">Track all your positions in one place</h1>
      </div>

      {/* Stats */}
      <div className="flex gap-x-3 text-white">
        <div className="bg-slate-800 p-5 flex flex-col gap-y-2 w-1/3 rounded-md">
          <h1 className="text-slate-600">Net Value</h1>
          <h1 className="text-2xl">$0.00</h1>
          <h1 className="text-slate-600">0 SOL</h1>
        </div>
        <div className="bg-slate-800 p-5 flex flex-col gap-y-2 w-1/3 rounded-md">
          <h1 className="text-slate-600">Interest | 6.7% avg</h1>
          <h1 className="text-2xl">$0.00</h1>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="my-3 flex text-white bg-slate-800 w-fit rounded-md mt-5">
        {['lended', 'borrowed', 'log', 'pending'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`p-2 px-5 transition rounded-md ${
              activeTab === tab ? 'bg-slate-600' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Conditional Tab Content */}
      <div className="mt-4">
        {activeTab === 'lended' && <LendedTable />}
        {activeTab === 'borrowed' && <BorrowTable />}
        {activeTab === 'log' && <TransactionLog />}
        {activeTab === 'pending' && <P2PRequests />}
      </div>
    </div>
  )
}
