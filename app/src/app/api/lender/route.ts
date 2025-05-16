import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet is required' }, { status: 400 })
  }

  const { data, error } = await supabase.from('user').select('username').eq('user_wallet', wallet).single()

  if (error || !data) {
    return NextResponse.json({ name: null })
  }

  return NextResponse.json({ name: data.username })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { wallet, name } = body

  if (!wallet || !name) {
    return NextResponse.json({ error: 'Missing wallet or name' }, { status: 400 })
  }

  // Check if wallet already exists
  const { data: existingUser, error: checkError } = await supabase
    .from('user')
    .select('id')
    .eq('user_wallet', wallet)
    .single()

  if (existingUser) {
    return NextResponse.json({ error: 'Wallet already registered' }, { status: 409 })
  }

  if (checkError && checkError.code !== 'PGRST116') {
    return NextResponse.json({ error: checkError.message }, { status: 500 })
  }

  const { data, error } = await supabase.from('user').insert([
    {
      user_wallet: wallet,
      username: name.trim(),
      created_at: new Date().toISOString(),
      total_orders: 0,
      completed_orders: 0,
    },
  ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ name })
}
