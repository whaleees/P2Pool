'use client'

import { useState } from 'react'
import LendedTable from '@/components/Lended-Table'
import BorrowTable from '@/components/Borrow-Table'
import TransactionLog from '@/components/TransactionLog'

function Page() {
  const [activeTab, setActiveTab] = useState<'lended' | 'borrowed' | 'log'>('lended')

  return (
    <div className="w-[70vw] mx-auto mt-10">
      {/* Header */}
      <div>
        <div className="flex flex-col gap-y-3 mb-5">
          <div className="flex gap-x-3 text-white items-center">
            <button className="bg-slate-600 p-3 rounded-md">Back</button>
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
            <h1 className="text-slate-600">Net Value</h1>
            <h1 className="text-2xl">$0.00</h1>
            <h1 className="text-slate-600">0 SOL</h1>
          </div>
        </div>
      </div>

      <div className="border-t-1 mt-5 border-slate-700"></div>

      {/* Tab Switcher */}
      <span className="my-3 flex text-white bg-slate-800 w-fit rounded-md">
        <button
          onClick={() => setActiveTab('lended')}
          className={`p-2 px-5 rounded-md transition ${activeTab === 'lended' ? 'bg-slate-600' : 'bg-slate-800'}`}
        >
          Lended
        </button>
        <button
          onClick={() => setActiveTab('borrowed')}
          className={`p-2 px-5 rounded-md transition ${activeTab === 'borrowed' ? 'bg-slate-600' : 'bg-slate-800'}`}
        >
          Borrowed
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`p-2 px-5 rounded-md transition ${activeTab === 'log' ? 'bg-slate-600' : 'bg-slate-800'}`}
        >
          Transaction Log
        </button>
      </span>

      <div className="border-t-1 mt-5 border-slate-700"></div>

      {/* Render Active Tab Content */}
      <div className="mt-4">
        {activeTab === 'lended' && <LendedTable />}
        {activeTab === 'borrowed' && <BorrowTable />}
        {activeTab === 'log' && <TransactionLog />}
      </div>
    </div>
  )
}

export default Page
