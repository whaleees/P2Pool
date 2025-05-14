// src/components/LendedTable.tsx
'use client'

const lendingData = [
  {
    date: '2025-05-14',
    type: 'p2p',
    token: 'XRP',
    amount: '5,000 XRP',
    usdtEquivalent: '10,000 USDT',
    wallet: '0x2193182903',
  },
  {
    date: '2025-05-13',
    type: 'p2p',
    token: 'BTC',
    amount: '0.75 BTC',
    usdtEquivalent: '47,250 USDT',
    wallet: '0x7acb72a802',
  },
  {
    date: '2025-05-13',
    type: 'p2p',
    token: 'USDT',
    amount: '12,000 USDT',
    usdtEquivalent: '12,000 USDT',
    wallet: '0x332b9d20ef',
  },
  {
    date: '2025-05-12',
    type: 'pool',
    token: 'DOGE',
    amount: '150,000 DOGE',
    usdtEquivalent: '12,000 USDT',
    wallet: '0',
  },
  // ...more entries if needed
]

const MAX_DISPLAY = 20

export default function LendedTable() {
  const displayed = lendingData.slice(0, MAX_DISPLAY)

  return (
    <div className="w-full mt-10">
      {/* Table Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white font-semibold rounded-t-2xl px-4 py-3">
        <div className="flex-1">Date</div>
        <div className="flex-1 text-right">Type</div>
        <div className="flex-1 text-right">Token</div>
        <div className="flex-1 text-right">Wallet Address</div>
      </div>

      {/* Lending Data Rows */}
      {displayed.map((row, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-b-2xl p-4 mt-2 transition"
        >
          {/* Date */}
          <div className="flex-1 text-white">{row.date}</div>

          {/* Type */}
          <div className="flex-1 text-right text-white capitalize">{row.type}</div>

          {/* Token + Amount & Equivalent */}
          <div className="flex-1 text-right text-white">
            <div className="font-semibold">{row.token}</div>
            <div className="text-xs text-slate-400 mt-1">
              {row.amount} ≈ {row.usdtEquivalent}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="flex-1 text-right text-white">
            <div className="text-xs text-slate-400 mt-1">{row.type === 'pool' ? '-' : row.wallet}</div>
          </div>
        </div>
      ))}

      {lendingData.length > MAX_DISPLAY && (
        <div className="text-center text-slate-400 text-sm mt-4">
          Showing {MAX_DISPLAY} of {lendingData.length} entries
        </div>
      )}
    </div>
  )
}
