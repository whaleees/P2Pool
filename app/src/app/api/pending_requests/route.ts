import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    offer_id,
    borrower_wallet,
    user_wallet,
    status,
    token,
    token_amount,
    usdt_token_value,
    collateral_token,
    collateral_amount,
    usdt_collateral_value,
    duration,
  } = body

  console.log('Received POST:', body)

  if (
    offer_id === undefined ||
    !borrower_wallet ||
    !user_wallet ||
    !token ||
    !collateral_token ||
    token_amount == null ||
    collateral_amount == null ||
    usdt_token_value == null ||
    usdt_collateral_value == null ||
    duration == null
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await supabase.from('pending_requests').insert([
    {
      offer_id,
      borrower_wallet,
      user_wallet,
      status: status || 'Pending',
      token,
      token_amount,
      usdt_token_value,
      collateral_token,
      collateral_amount,
      usdt_collateral_value,
      duration,
    },
  ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
