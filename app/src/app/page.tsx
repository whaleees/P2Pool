'use client'
import { usePathname } from 'next/navigation'
import MarketBar from '@/components/Market-Bar'
import MarketTable from '@/components/Market-Table'

export default function Home() {
  const pathname = usePathname()

  function getTitle(path: string) {
    if (path === '/p2p') return 'P2P'
    if (path === '/portfolio') return 'Portfolio'
    return 'Borrow / Lend'
  }

  return (
    <div className="w-[70vw] mx-auto mt-10">
      {/* Title */}
      <div className="text-center flex gap-2.5 flex-col items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
          {getTitle(pathname)}
        </h1>
        <p className="text-base text-slate-400">Supply assets to earn yield and borrow against collateral.</p>
      </div>

      {/* Market Bar */}
      <MarketBar></MarketBar>

      {/* Market Tables */}
      <div className="flex flex-col gap-10 mt-15 text-white">
        <div>
          <div className="flex items-center gap-2 mb-5">
            <img src="" alt="" className="w-6 h-6" />
            <h1 className="text-2xl">Pool Market</h1>
          </div>
          <MarketTable></MarketTable>
        </div>
      </div>
    </div>
  )
}
