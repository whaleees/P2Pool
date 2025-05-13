'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function CustomNavbar() {
  const links = [
    { href: '/', label: 'Borrow / Lend' },
    { href: '/p2p', label: 'P2P' },
    { href: '/portfolio', label: 'Portfolio' },
  ]

  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href
  }

  return (
    <header className="text-white flex justify-between items-center p-10 px-10">
      <div>
        <Link href={'/'}>LOGO</Link>
      </div>
      <div className="flex gap-10 ml-25">
        {links.map((link) => (
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
      <div>
        <button className="bg-slate-700 p-5 rounded-2xl hover:bg-slate-600">Connect Wallet</button>
      </div>
    </header>
  )
}
