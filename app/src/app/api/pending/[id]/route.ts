import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '0')
  const pageSize = 10
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await supabase
    .from('p2p_offers')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ offers: data, total: count, page, pageSize })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { user_wallet, token, total_supply, collateral_token, collateral_amount, usdt_value, duration } = body

  const { error } = await supabase.from('p2p_offers').insert({
    user_wallet,
    offer_token: token,
    offer_amount: total_supply,
    collateral_token,
    collateral_min: collateral_amount,
    collateral_usdt: usdt_value,
    offer_usdt: usdt_value,
    duration,
    created_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
