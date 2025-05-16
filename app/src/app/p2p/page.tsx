'use client'

import LenderForm from '@/components/Lender-Form'
import P2PTable from '@/components/P2P-Table'

export default function Page() {
  return (
    <div className="w-[70vw] mx-auto mt-10">
      <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
        P2P Lending Market
      </h1>
      <p className="text-center text-slate-400 mb-6">Provide offers or borrow from peers</p>

      {/* Lender Form */}
      <LenderForm />

      {/* P2P Offers Table */}
      <P2PTable />
    </div>
  )
}
