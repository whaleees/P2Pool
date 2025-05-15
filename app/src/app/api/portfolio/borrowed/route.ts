import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get('wallet')

  if (!wallet) {
    return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('transaction_log')
    .select('id, date, mode, status, action, token, amount, usdt_value, borrower_wallet, user_wallet')
    .eq('user_wallet', wallet) // ✅ match logged-in user
    .eq('action', 'Borrowed') // ✅ only borrowed transactions
    .order('date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ transactions: data })
}
