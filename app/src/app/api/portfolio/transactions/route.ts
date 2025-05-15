// src/app/api/transactions/route.ts
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
    .select('id, date, mode, action, status, token, amount, usdt_value, borrower_wallet')
    .eq('user_wallet', wallet) // ✅ Only fetch transactions initiated by the user
    .order('date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ transactions: data })
}
