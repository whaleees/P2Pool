'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import P2PTable from '@/components/P2P-Table'

function Page() {
  const pathname = usePathname()

  function getTitle(path: string) {
    if (path === '/p2p') return 'P2P'
    if (path === '/portfolio') return 'Portfolio'
    return 'Borrow / Lend'
  }

  const PopulerPicks = [
    { label: 'BTC', href: '/btc' },
    { label: 'ETH', href: '/eth' },
    { label: 'USDC', href: '/usdc' },
    { label: 'USDT', href: '/usdt' },
  ]

  function isActive(href: string) {
    return pathname === href
  }

  return (
    <div className="w-[70vw] mx-auto mt-10">
      {/* Title */}
      <div className="text-center flex gap-2.5 flex-col items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
          {getTitle(pathname)}
        </h1>
        <p className="text-base text-slate-400">Peer-to-peer lending with flexible terms and direct user matching.</p>
      </div>

      <div className="text-slate-600 mt-10">
        <div className="flex items-center gap-2 mb-5">
          <h1 className="border-r-2 border-slate-700 pr-2">Popular Picks</h1>
          {PopulerPicks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-sky-400 ${
                isActive(link.href) ? 'underline decoration-[#49AFE9] underline-offset-10 text-sky-400' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <P2PTable />
    </div>
  )
}

export default Page
