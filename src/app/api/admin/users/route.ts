import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// Verify caller is authenticated
async function verifyAuth(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return false
  const supabase = getServiceSupabase()
  const { data: { user } } = await supabase.auth.getUser(token)
  return !!user
}

// GET — list all users
export async function GET(req: NextRequest) {
  if (!await verifyAuth(req))
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = getServiceSupabase()
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    confirmed: !!u.confirmed_at,
  })))
}

// POST — invite user by email
export async function POST(req: NextRequest) {
  if (!await verifyAuth(req))
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

  const supabase = getServiceSupabase()
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true, user: data.user })
}

// DELETE — remove user
export async function DELETE(req: NextRequest) {
  if (!await verifyAuth(req))
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

  const supabase = getServiceSupabase()
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
