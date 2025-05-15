import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const wallet = searchParams.get('wallet')
  if (!wallet) return NextResponse.json({ error: 'Missing wallet' }, { status: 400 })

  const { data, error } = await supabase.from('user').select('username').eq('user_wallet', wallet).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ name: data?.username || null })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { wallet, name } = body
  if (!wallet || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { error } = await supabase.from('user').insert({
    user_wallet: wallet,
    username: name,
    created_at: new Date().toISOString(),
    total_orders: 0,
    completed_orders: 0,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ name })
}
