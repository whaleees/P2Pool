import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '0')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = page * limit

  const { data, error, count } = await supabase
    .from('p2p_offers')
    .select(
      `
      id,
      user_wallet,
      token,
      total_supply,
      usdt_value,
      collateral_token,
      collateral_amount,
      duration,
      user:user_wallet (
        username,
        total_orders,
        completed_orders
      )
    `,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const offers = data.map((item) => {
    const completionRate = item.user?.total_orders
      ? Math.round((item.user.completed_orders / item.user.total_orders) * 100)
      : 0

    return {
      id: item.id,
      lender: item.user?.username || item.user_wallet,
      offer_token: item.token,
      offer_amount: item.total_supply,
      offer_usdt: item.usdt_value,
      collateral_token: item.collateral_token,
      collateral_min: item.collateral_amount,
      collateral_usdt: item.usdt_value,
      duration: item.duration,
      total_orders: item.user?.total_orders || 0,
      completion: `${completionRate}%`,
      like_rate: `${Math.floor(60 + Math.random() * 30)}%`, // optional placeholder
    }
  })

  return NextResponse.json({
    offers,
    total: count || 0,
    page,
    pageSize: limit,
  })
}
