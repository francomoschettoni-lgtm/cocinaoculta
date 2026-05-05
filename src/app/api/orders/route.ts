import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { sendOrderEmail, sendOrderWhatsApp } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customer_name, customer_email, customer_phone,
      delivery_zone, delivery_address, delivery_cost,
      subtotal, total, payment_method, notes, items,
    } = body

    if (!customer_name || !customer_phone || !delivery_zone || !payment_method)
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    const isPickup = delivery_zone === 'retiro'
    if (!isPickup && !delivery_address)
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    const minOrder = isPickup ? 20000 : 100000
    if (subtotal < minOrder)
      return NextResponse.json({ error: `El pedido mínimo ${isPickup ? 'para retiro' : 'para envío'} es $${minOrder.toLocaleString('es-AR')}` }, { status: 400 })
    if (!items || items.length === 0)
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })

    const supabase = getServiceSupabase()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name, customer_email: customer_email || null,
        customer_phone, delivery_zone, delivery_address,
        delivery_cost, subtotal, total, payment_method,
        notes: notes || null,
      })
      .select()
      .single()

    if (orderError) throw orderError

    const { error: itemsError } = await supabase.from('order_items').insert(
      items.map((i: { product_id: string; product_name: string; product_price: number; quantity: number; subtotal: number }) => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.product_name,
        product_price: i.product_price,
        quantity: i.quantity,
        subtotal: i.subtotal,
      }))
    )
    if (itemsError) throw itemsError

    // Fire-and-forget notifications (don't block the response)
    const notifPayload = {
      order_number: order.order_number,
      customer_name, customer_email, customer_phone,
      delivery_zone, delivery_address, total,
      payment_method, notes,
      items,
    }
    Promise.all([
      sendOrderEmail(notifPayload).catch(e => console.error('[Notif Email]', e)),
      sendOrderWhatsApp(notifPayload).catch(e => console.error('[Notif WA]', e)),
    ])

    return NextResponse.json({ success: true, order_id: order.id, order_number: order.order_number })
  } catch (err) {
    console.error('[Orders POST Error]', err)
    return NextResponse.json({ error: 'Error al procesar el pedido' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = getServiceSupabase()
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('[Orders GET Error]', err)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
