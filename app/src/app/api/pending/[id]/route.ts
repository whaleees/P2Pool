// src/app/api/pending/[id]/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

interface Body {
  action: 'accept' | 'reject'
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const { action }: Body = await request.json()
  if (action !== 'accept' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // 1️⃣ Update the pending_requests row
  const { error: upErr } = await supabase
    .from('pending_requests')
    .update({ status: action, updated_at: new Date() })
    .eq('id', id)

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  // 2️⃣ Fetch the updated row back so we can log it
  const { data, error: fetchErr } = await supabase.from('pending_requests').select('*').eq('id', id).limit(1)

  if (fetchErr || !data || data.length === 0) {
    return NextResponse.json({ error: fetchErr?.message || 'Request not found' }, { status: 500 })
  }

  const req = data[0]

  // 3️⃣ Insert into transaction_log
  const { error: logErr } = await supabase.from('transaction_log').insert({
    pending_id: id,
    mode: 'p2p',
    action: action,
    status: action === 'accept' ? 'success' : 'failed',
    token: req.token,
    amount: req.amount,
    usdt_value: req.usdt_value,
    wallet: req.wallet_address,
    created_at: new Date(),
  })

  if (logErr) {
    return NextResponse.json({ error: logErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
