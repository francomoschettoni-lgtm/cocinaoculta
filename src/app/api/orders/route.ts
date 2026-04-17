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

    if (!customer_name || !customer_phone || !delivery_zone || !delivery_address || !payment_method)
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    if (subtotal < 20000)
      return NextResponse.json({ error: 'El pedido mínimo es $20.000' }, { status: 400 })
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

    // MercadoPago Checkout Pro — initialized here, only when needed
    if (payment_method === 'mercadopago') {
      try {
        const MercadoPagoConfig = (await import('mercadopago')).default
        const { Preference } = await import('mercadopago')
        const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const preference = await new Preference(mp).create({
          body: {
            external_reference: String(order.id),
            items: items.map((i: { product_name: string; product_price: number; quantity: number }) => ({
              id: String(i.product_name),
              title: i.product_name,
              quantity: i.quantity,
              unit_price: Number(i.product_price),
              currency_id: 'ARS',
            })),
            ...(delivery_cost > 0 && {
              shipments: { cost: delivery_cost, mode: 'not_specified' as const },
            }),
            payer: {
              name: customer_name,
              email: customer_email || 'cliente@cocinaoculta.com',
              phone: { number: String(customer_phone) },
            },
            back_urls: {
              success: `${siteUrl}/checkout/exito?order=${order.order_number}`,
              failure: `${siteUrl}/checkout/error`,
              pending: `${siteUrl}/checkout/exito?order=${order.order_number}&pending=1`,
            },
            auto_return: 'approved' as const,
            statement_descriptor: 'Cocina Oculta',
          },
        })

        return NextResponse.json({
          success: true,
          order_id: order.id,
          order_number: order.order_number,
          init_point: preference.init_point,
        })
      } catch (mpError) {
        console.error('[MP Error]', mpError)
        return NextResponse.json({
          error: 'No se pudo conectar con MercadoPago. Probá con otro método de pago o intentá de nuevo.',
          order_id: order.id,
          order_number: order.order_number,
        }, { status: 502 })
      }
    }

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
