'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import LendedTable from '@/components/Lended-Table'
import BorrowTable from '@/components/Borrow-Table'
import TransactionLog from '@/components/TransactionLog'
import P2PRequests from '@/components/P2P-Requests'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'lended' | 'borrowed' | 'log' | 'pending'>('lended')

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

      {/* Summary Boxes */}
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

      <div className="border-t border-slate-700 mt-5"></div>

      {/* Tab Switcher */}
      <div className="my-3 flex text-white bg-slate-800 w-fit rounded-md">
        {[
          { key: 'lended', label: 'Lended' },
          { key: 'borrowed', label: 'Borrowed' },
          { key: 'log', label: 'Transaction Log' },
          { key: 'pending', label: 'Pending' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`p-2 px-5 transition rounded-md ${
              activeTab === tab.key ? 'bg-slate-600' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="border-t border-slate-700 mt-5"></div>

      {/* Render Active Tab */}
      <div className="mt-4">
        {activeTab === 'lended' && <LendedTable />}
        {activeTab === 'borrowed' && <BorrowTable />}
        {activeTab === 'log' && <TransactionLog />}
        {activeTab === 'pending' && <P2PRequests />}
      </div>
    </div>
  )
}
