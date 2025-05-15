// ✅ src/app/api/transactions/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(req: Request) {
  const body = await req.json()

  const {
    status,
    token,
    amount,
    usdt_value,
    borrower_wallet,
    user_wallet,
    duration = 30,
    mode = 'p2p',
    action = 'borrow',
  } = body

  const { error } = await supabase.from('transaction_log').insert({
    transaction_id: Date.now(),
    date: new Date().toISOString(),
    mode,
    action,
    status,
    token,
    amount,
    usdt_value,
    borrower_wallet,
    user_wallet,
    duration,
    created_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
