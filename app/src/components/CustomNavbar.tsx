'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function CustomNavbar() {
  const links = [
    { href: '/', label: 'Borrow / Lend' },
    { href: '/p2p', label: 'P2P' },
    { href: '/portfolio', label: 'Portfolio' },
  ]

  const pathname = usePathname()
  const [user, setUser] = useState<{ wallet: string; username: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wallet')
    if (stored) {
      loadUser(stored)
    }
  }, [])

  const isActive = (href: string) => pathname === href

  async function loadUser(walletAddress: string) {
    const { data, error } = await supabase.from('user').select('username').eq('user_wallet', walletAddress).single()

    if (data) {
      setUser({ wallet: walletAddress, username: data.username })
    }
  }

  async function handleConnect() {
    const walletAddress = prompt('🔐 Enter your wallet address:')
    if (!walletAddress?.trim()) {
      alert('Wallet address is required!')
      return
    }

    const cleanWallet = walletAddress.trim()

    const { data, error } = await supabase.from('user').select('username').eq('user_wallet', cleanWallet).single()

    if (error && error.code !== 'PGRST116') {
      alert('Database error: ' + error.message)
      return
    }

    if (data) {
      setUser({ wallet: cleanWallet, username: data.username })
      localStorage.setItem('wallet', cleanWallet)
    } else {
      const username = prompt('Choose a username tied to your wallet:')
      if (!username?.trim()) {
        alert('Username is required!')
        return
      }

      const { error: insertError } = await supabase.from('user').insert({
        user_wallet: cleanWallet,
        username: username.trim(),
        created_at: new Date().toISOString(),
        total_orders: 0,
        completed_orders: 0,
      })

      if (insertError) {
        alert('Failed to create user: ' + insertError.message)
        return
      }

      setUser({ wallet: cleanWallet, username: username.trim() })
      localStorage.setItem('wallet', cleanWallet)
    }
  }

  function handleLogout() {
    setUser(null)
    localStorage.removeItem('wallet')
  }

  return (
    <header className="text-white flex justify-between items-center p-10 px-10">
      <div>
        <Link href="/" className="font-bold text-xl">
          LOGO
        </Link>
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
        {!user ? (
          <button className="bg-slate-700 p-5 rounded-2xl hover:bg-slate-600" onClick={handleConnect}>
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">Welcome, {user.username}</p>
              <p className="text-sm break-all">{user.wallet}</p>
            </div>
            <button className="bg-red-600 p-3 rounded-xl hover:bg-red-700" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
