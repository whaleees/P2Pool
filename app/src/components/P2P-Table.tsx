'use client'

const lendingData = [
  {
    lender: 'LendMasterX',
    orders: 128,
    completion: '100%',
    likeRate: '98.5%',
    offerAmount: '5,000 XRP',
    offerUSDT: '10,000 USDT',
    collateralCoin: 'BTC',
    collateralMin: '0.16 BTC',
    collateralUSDT: '10,240 USDT',
  },
  {
    lender: 'FastLoanBTC',
    orders: 250,
    completion: '99.8%',
    likeRate: '100%',
    offerAmount: '0.75 BTC',
    offerUSDT: '47,250 USDT',
    collateralCoin: 'ETH',
    collateralMin: '13.5 ETH',
    collateralUSDT: '48,000 USDT',
  },
  {
    lender: 'YieldKing',
    orders: 78,
    completion: '96%',
    likeRate: '97%',
    offerAmount: '12,000 USDT',
    offerUSDT: '12,000 USDT',
    collateralCoin: 'SOL',
    collateralMin: '800 SOL',
    collateralUSDT: '12,100 USDT',
  },
  {
    lender: 'XFinance',
    orders: 432,
    completion: '100%',
    likeRate: '99.5%',
    offerAmount: '150,000 DOGE',
    offerUSDT: '12,000 USDT',
    collateralCoin: 'BNB',
    collateralMin: '28 BNB',
    collateralUSDT: '12,320 USDT',
  },
]

export default function P2PTable() {
  return (
    <div className="w-full mt-10">
      {/* Table Header */}
      <div className="flex justify-between px-6 py-3 text-slate-400 text-xs font-semibold uppercase">
        <div className="flex-1">Lender</div>
        <div className="flex-1 text-right">Lending Offer</div>
        <div className="flex-1 text-right">Collateral Required</div>
        <div className="flex-1 text-right">Action</div>
      </div>

      {/* Table Rows */}
      {lendingData.map((row, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-2xl p-4 mt-2 transition"
        >
          {/* Lender Info */}
          <div className="flex-1 text-white">
            <div className="font-semibold">{row.lender}</div>
            <div className="text-xs text-slate-400 mt-1">
              {row.orders} orders | {row.completion} completion
            </div>
            <div className="text-xs text-green-400">👍{row.likeRate}</div>
          </div>

          {/* Lending Offer */}
          <div className="flex-1 text-right text-white">
            <div className="font-semibold">{row.offerAmount}</div>
            <div className="text-xs text-slate-400 mt-1">≈ {row.offerUSDT}</div>
          </div>

          {/* Collateral Required */}
          <div className="flex-1 text-right text-white">
            <div className="font-semibold">Wants: {row.collateralCoin}</div>
            <div className="text-xs text-slate-400 mt-1">
              Min: {row.collateralMin} ≈ {row.collateralUSDT}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-1 flex justify-end">
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white">Borrow</button>
          </div>
        </div>
      ))}
    </div>
  )
}
