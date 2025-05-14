// src/components/CustomFooter.tsx
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
            <Link href="#">
              <Image
                src="/icons/discord.svg"
                alt="Discord"
                width={24}
                height={24}
                className="hover:opacity-80 transition"
              />
            </Link>
            <Link href="#">
              <Image src="/icons/x.svg" alt="X" width={24} height={24} className="hover:opacity-80 transition" />
            </Link>
          </div>
          <p className="text-sm">&copy; 2025 LOGO. All rights reserved.</p>
        </div>

        {/* About */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">About</h3>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="hover:text-white transition">
                Documentation
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition">
                Terms
              </Link>
            </li>
          </ul>
        </div>

        {/* Products */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Products</h3>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="hover:text-white transition">
                Lending
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition">
                Borrowing
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition">
                P2P
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition">
                Liquidity
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Resources</h3>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="hover:text-white transition">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition">
                Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Connect</h3>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="hover:text-white transition">
                Discord
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition">
                X
              </Link>
            </li>
            <li className="text-slate-300">Telkomsel: Kresna Wintata</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
