'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function CustomFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Logo & Social */}
        <div className="space-y-4">
          <h2 className="text-white text-2xl font-bold">LOGO</h2>
          <div className="flex space-x-4">
            <Link href="#" aria-label="Discord">
              <Image
                src="/icons/discord.svg"
                alt="Discord"
                width={24}
                height={24}
                className="hover:opacity-80 transition"
              />
            </Link>
            <Link href="#" aria-label="X">
              <Image src="/icons/x.svg" alt="X" width={24} height={24} className="hover:opacity-80 transition" />
            </Link>
          </div>
          <p className="text-sm text-slate-500">&copy; 2025 LOGO. All rights reserved.</p>
        </div>

        {/* Footer sections */}
        {[
          { title: 'About', items: ['Documentation', 'Terms'] },
          { title: 'Products', items: ['Lending', 'Borrowing', 'P2P', 'Liquidity'] },
          { title: 'Resources', items: ['FAQ', 'Support'] },
          { title: 'Connect', items: ['Discord', 'X'] },
        ].map(({ title, items }) => (
          <div key={title}>
            <h3 className="text-white text-lg font-semibold mb-3">{title}</h3>
            <ul className="space-y-2">
              {items.map((text) => (
                <li key={text}>
                  <Link href="#" className="hover:text-white transition">
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}
