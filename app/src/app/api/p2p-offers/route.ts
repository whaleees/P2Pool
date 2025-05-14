import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient' // your server-side config

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '0', 10)
  const PAGE_SIZE = 10

  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error, count } = await supabase
    .from('p2p_offers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    offers: data,
    total: count,
    page,
    pageSize: PAGE_SIZE,
  })
}
