const transactionData = [
  {
    date: '2025-05-14 14:20 UTC',
    mode: 'p2p',
    action: 'borrow',
    token: 'BTC',
    amount: '0.75',
    usdtValue: '47,250',
    wallet: '0x7acb72a802',
  },
  {
    date: '2025-05-14 13:00 UTC',
    mode: 'pool',
    action: 'lend',
    token: 'USDT',
    amount: '12,000',
    usdtValue: '12,000',
    wallet: '-',
  },
  {
    date: '2025-05-13 18:50 UTC',
    mode: 'p2p',
    action: 'lend',
    token: 'XRP',
    amount: '5,000',
    usdtValue: '10,000',
    wallet: '0x2193182903',
  },
]

export default function TransactionLog() {
  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white font-semibold rounded-t-2xl px-4 py-3 text-sm">
        <div className="flex-1">Date</div>
        <div className="flex-1 text-right">Mode</div>
        <div className="flex-1 text-right">Action</div>
        <div className="flex-1 text-right">Token</div>
        <div className="flex-1 text-right">Amount</div>
        <div className="flex-1 text-right">≈ USDT</div>
        <div className="flex-1 text-right">Wallet</div>
      </div>

      {/* Rows */}
      {transactionData.map((tx, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-b-2xl p-4 mt-2 transition text-sm text-white"
        >
          <div className="flex-1">{tx.date}</div>
          <div className="flex-1 text-right capitalize">{tx.mode}</div>
          <div className="flex-1 text-right capitalize">{tx.action}</div>
          <div className="flex-1 text-right">{tx.token}</div>
          <div className="flex-1 text-right">{tx.amount}</div>
          <div className="flex-1 text-right">{tx.usdtValue} USDT</div>
          <div className="flex-1 text-right">{tx.wallet}</div>
        </div>
      ))}
    </div>
  )
}
