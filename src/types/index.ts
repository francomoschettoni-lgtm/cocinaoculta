export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  stock: number | null
  preparation: string | null
  weight: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  display_order: number
  is_active: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export type DeliveryZone = 'san_isidro' | 'tigre' | 'escobar'
export type PaymentMethod = 'mercadopago' | 'transferencia' | 'efectivo'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export const DELIVERY_COSTS: Record<DeliveryZone, number> = {
  san_isidro: 3000,
  tigre: 2000,
  escobar: 1000,
}

export const DELIVERY_ZONE_LABELS: Record<DeliveryZone, string> = {
  san_isidro: 'San Isidro',
  tigre: 'Tigre',
  escobar: 'Escobar',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
}

export const MINIMUM_ORDER = 20000

export interface Order {
  id: string
  order_number: number
  customer_name: string
  customer_email: string | null
  customer_phone: string
  delivery_zone: DeliveryZone
  delivery_address: string
  delivery_cost: number
  subtotal: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  order_status: OrderStatus
  notes: string | null
  mp_preference_id: string | null
  mp_payment_id: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
}
