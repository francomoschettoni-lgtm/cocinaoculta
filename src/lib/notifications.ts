import nodemailer from 'nodemailer'

interface OrderInfo {
  order_number: number
  customer_name: string
  customer_phone: string
  customer_email?: string
  delivery_zone: string
  delivery_address: string
  total: number
  payment_method: string
  items: { product_name: string; quantity: number; subtotal: number }[]
  notes?: string
}

const ZONE_LABELS: Record<string, string> = {
  tigre: 'Tigre',
  san_isidro: 'San Isidro',
  escobar: 'Escobar',
}

const PAYMENT_LABELS: Record<string, string> = {
  mercadopago: 'MercadoPago',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

// ── Email (Gmail SMTP) ──────────────────────────────────────────
export async function sendOrderEmail(order: OrderInfo) {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  const to = process.env.NOTIFICATION_EMAIL || user

  if (!user || !pass) {
    console.warn('[Email] GMAIL_USER o GMAIL_APP_PASSWORD no configurados')
    return
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })

  const itemsHtml = order.items
    .map(i => `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;">${i.product_name}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;">x${i.quantity}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(i.subtotal)}</td>
    </tr>`)
    .join('')

  await transporter.sendMail({
    from: `"Cocina Oculta" <${user}>`,
    to,
    subject: `🛒 Nuevo pedido #${order.order_number} — ${order.customer_name}`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#1A1F1C;">
        <div style="background:#2D7A4F;padding:24px 28px;border-radius:12px 12px 0 0;">
          <h2 style="color:white;margin:0;font-size:1.3rem;">Nuevo pedido #${order.order_number}</h2>
          <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:0.9rem;">${new Date().toLocaleString('es-AR')}</p>
        </div>
        <div style="background:#f9f7f3;padding:24px 28px;border-radius:0 0 12px 12px;border:1px solid #e4ddd2;">
          <table style="width:100%;margin-bottom:20px;">
            <tr><td style="color:#6B7269;font-size:0.8rem;padding-bottom:4px;">Cliente</td><td style="font-weight:600;">${order.customer_name}</td></tr>
            <tr><td style="color:#6B7269;font-size:0.8rem;padding-bottom:4px;">Teléfono</td><td>${order.customer_phone}</td></tr>
            ${order.customer_email ? `<tr><td style="color:#6B7269;font-size:0.8rem;padding-bottom:4px;">Email</td><td>${order.customer_email}</td></tr>` : ''}
            <tr><td style="color:#6B7269;font-size:0.8rem;padding-bottom:4px;">Zona</td><td>${ZONE_LABELS[order.delivery_zone] || order.delivery_zone}</td></tr>
            <tr><td style="color:#6B7269;font-size:0.8rem;padding-bottom:4px;">Dirección</td><td>${order.delivery_address}</td></tr>
            <tr><td style="color:#6B7269;font-size:0.8rem;padding-bottom:4px;">Pago</td><td>${PAYMENT_LABELS[order.payment_method] || order.payment_method}</td></tr>
            ${order.notes ? `<tr><td style="color:#6B7269;font-size:0.8rem;padding-bottom:4px;">Notas</td><td>${order.notes}</td></tr>` : ''}
          </table>

          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <thead><tr style="background:#e4ddd2;">
              <th style="padding:8px 12px;text-align:left;font-size:0.8rem;">Producto</th>
              <th style="padding:8px 12px;text-align:center;font-size:0.8rem;">Cant.</th>
              <th style="padding:8px 12px;text-align:right;font-size:0.8rem;">Subtotal</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="text-align:right;font-size:1.2rem;font-weight:700;color:#2D7A4F;">
            Total: ${formatPrice(order.total)}
          </div>

          <div style="margin-top:20px;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/pedidos" style="background:#2D7A4F;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem;">
              Ver en panel admin
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

// ── WhatsApp (CallMeBot) ────────────────────────────────────────
export async function sendOrderWhatsApp(order: OrderInfo) {
  const phone = process.env.WHATSAPP_NOTIFY_PHONE
  const apiKey = process.env.CALLMEBOT_API_KEY

  if (!phone || !apiKey) {
    console.warn('[WhatsApp] WHATSAPP_NOTIFY_PHONE o CALLMEBOT_API_KEY no configurados')
    return
  }

  const itemsList = order.items
    .map(i => `• ${i.product_name} x${i.quantity}`)
    .join('\n')

  const msg = [
    `🛒 *Nuevo pedido #${order.order_number}*`,
    `👤 ${order.customer_name} — ${order.customer_phone}`,
    `📍 ${ZONE_LABELS[order.delivery_zone] || order.delivery_zone}: ${order.delivery_address}`,
    `💳 ${PAYMENT_LABELS[order.payment_method] || order.payment_method}`,
    ``,
    itemsList,
    ``,
    `💰 *Total: ${formatPrice(order.total)}*`,
    order.notes ? `📝 ${order.notes}` : '',
  ].filter(Boolean).join('\n')

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(msg)}&apikey=${apiKey}`

  const res = await fetch(url)
  if (!res.ok) console.warn('[WhatsApp] Error al enviar:', await res.text())
}
