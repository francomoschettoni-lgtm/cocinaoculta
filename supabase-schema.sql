-- =============================================
-- COCINA OCULTA - Supabase Schema
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Habilitar UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PRODUCTOS
-- =============================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null default 'general',
  image_url text,
  is_available boolean default true,
  is_featured boolean default false,
  stock integer default null, -- null = sin limite
  preparation text, -- instrucciones de preparacion
  weight text, -- ej: "500g", "x2 unidades"
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- PEDIDOS
-- =============================================
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number serial,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  delivery_zone text not null check (delivery_zone in ('san_isidro', 'tigre', 'escobar')),
  delivery_address text not null,
  delivery_cost numeric(10,2) not null,
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  payment_method text not null check (payment_method in ('mercadopago', 'transferencia', 'efectivo')),
  payment_status text default 'pending' check (payment_status in ('pending', 'approved', 'rejected', 'cancelled')),
  order_status text default 'pending' check (order_status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  notes text,
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- ITEMS DE PEDIDO
-- =============================================
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_price numeric(10,2) not null,
  quantity integer not null default 1,
  subtotal numeric(10,2) not null
);

-- =============================================
-- CATEGORIAS (para ordenar el catalogo)
-- =============================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  display_order integer default 0,
  is_active boolean default true
);

-- =============================================
-- CONFIGURACION DEL SITIO
-- =============================================
create table if not exists site_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value text,
  updated_at timestamptz default now()
);

-- =============================================
-- INDICES
-- =============================================
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_available on products(is_available);
create index if not exists idx_orders_status on orders(order_status);
create index if not exists idx_orders_created on orders(created_at desc);
create index if not exists idx_order_items_order on order_items(order_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table categories enable row level security;
alter table site_settings enable row level security;

-- Politicas para productos: lectura publica, escritura solo admin
create policy "Products are viewable by everyone" on products
  for select using (true);

create policy "Products are editable by admin only" on products
  for all using (auth.role() = 'authenticated');

-- Politicas para categorias: lectura publica
create policy "Categories are viewable by everyone" on categories
  for select using (true);

create policy "Categories are editable by admin only" on categories
  for all using (auth.role() = 'authenticated');

-- Politicas para pedidos: solo el admin puede ver todos
create policy "Orders are viewable by admin" on orders
  for select using (auth.role() = 'authenticated');

create policy "Orders can be inserted by anyone" on orders
  for insert with check (true);

create policy "Orders are updatable by admin" on orders
  for update using (auth.role() = 'authenticated');

-- Item de pedidos
create policy "Order items are viewable by admin" on order_items
  for select using (auth.role() = 'authenticated');

create policy "Order items can be inserted by anyone" on order_items
  for insert with check (true);

-- Settings
create policy "Settings are viewable by everyone" on site_settings
  for select using (true);

create policy "Settings are editable by admin" on site_settings
  for all using (auth.role() = 'authenticated');

-- =============================================
-- TRIGGERS - updated_at
-- =============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at before update on products
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

-- =============================================
-- STORAGE - Bucket para imagenes
-- =============================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "Product images are publicly accessible" on storage.objects
  for select using (bucket_id = 'products');

create policy "Authenticated users can upload product images" on storage.objects
  for insert with check (bucket_id = 'products' and auth.role() = 'authenticated');

create policy "Authenticated users can update product images" on storage.objects
  for update using (bucket_id = 'products' and auth.role() = 'authenticated');

create policy "Authenticated users can delete product images" on storage.objects
  for delete using (bucket_id = 'products' and auth.role() = 'authenticated');

-- =============================================
-- DATOS INICIALES - Categorias
-- =============================================
insert into categories (name, slug, display_order) values
  ('Platos Principales', 'platos-principales', 1),
  ('Nueces Pecan', 'nueces-pecan', 2),
  ('Guarniciones', 'guarniciones', 3),
  ('Salsas', 'salsas', 4)
on conflict (slug) do nothing;

-- =============================================
-- DATOS INICIALES - Productos
-- =============================================
insert into products (name, description, price, category, is_available, is_featured, preparation, weight) values
  (
    'Salsa de Tomate',
    'Salsa de tomate casera, lista para usar. Rinde para 2 porciones de pasta. Hecha con tomates frescos y hierbas aromáticas.',
    7000,
    'salsas',
    true,
    false,
    'Calentar en cacerola o microondas. Lista en 3 minutos.',
    '2 porciones'
  ),
  (
    'Matambre de Pollo',
    'Matambre arrollado de pollo relleno con verduras. Jugoso y sabroso, ideal para servir frío, calentar o grillar.',
    12000,
    'platos-principales',
    true,
    true,
    'Servir frío o calentar en agua hirviendo 10 min / microondas 4 min.',
    '~400g'
  ),
  (
    'Relleno de Pollo',
    'Relleno de pollo listo, ideal para empanadas, tartas o budines. Sabor casero, sin conservantes.',
    14000,
    'platos-principales',
    true,
    false,
    'Usar directamente frío o calentar levemente antes de usar.',
    '~300g'
  ),
  (
    'Solomillo de Cerdo Ahumado x 2u',
    'Dos solomillos de cerdo ahumados artesanalmente. Perfectos como fiambre frío, en tabla o calentados. Sabor ahumado intenso y natural.',
    24000,
    'platos-principales',
    true,
    true,
    'Servir frío cortado fino o calentar en agua hirviendo 8 min / microondas 3 min.',
    'x2 unidades ~500g'
  ),
  (
    'Puré de Batata',
    'Puré de batata cremoso, listo para calentar y servir. Acompañamiento perfecto para carnes.',
    6000,
    'guarniciones',
    true,
    false,
    'Calentar en cacerola a fuego suave o microondas 3 min. Revolver y servir.',
    '500g'
  ),
  (
    'Pechito de Cerdo con Manta Ahumado',
    'Pechito de cerdo con su manta, ahumado artesanalmente. Tierno, jugoso, con corteza crujiente al calentar.',
    22000,
    'platos-principales',
    true,
    true,
    'Calentar en agua hirviendo 15 min o en horno 180° 20 min para crocante.',
    '~600g'
  ),
  (
    'Tapa de Asado Ahumada',
    'Tapa de asado ahumada lentamente a leña. Lista para calentar y sorprender en la mesa.',
    28000,
    'platos-principales',
    true,
    true,
    'Calentar en agua hirviendo 20 min o en horno 180° 25 min.',
    '~700g'
  ),
  (
    'Pecan Chocolate Negro',
    'Nueces pecan bañadas en chocolate negro artesanal. Crujientes, con un balance perfecto entre amargo y dulce.',
    18000,
    'nueces-pecan',
    true,
    true,
    'Listo para consumir. Conservar en lugar fresco y seco.',
    '500g'
  ),
  (
    'Pecan Chocolate MIX',
    'Nueces pecan bañadas en chocolate negro y blanco artesanal. El clásico combinado para los que no pueden elegir.',
    18000,
    'nueces-pecan',
    true,
    true,
    'Listo para consumir. Conservar en lugar fresco y seco.',
    '500g'
  ),
  (
    'Pecan Chocolate Blanco',
    'Nueces pecan bañadas en chocolate blanco artesanal. Suaves, cremosas, irresistibles.',
    18000,
    'nueces-pecan',
    true,
    false,
    'Listo para consumir. Conservar en lugar fresco y seco.',
    '500g'
  ),
  (
    'Pecan Garrapiñada',
    'Nueces pecan garrapiñadas con azúcar caramelizada. Crujientes, dulces, adictivas.',
    18000,
    'nueces-pecan',
    true,
    false,
    'Listo para consumir. Conservar en lugar fresco y seco.',
    '500g'
  ),
  (
    'Pecan Peladas',
    'Nueces pecan peladas, ideales para repostería o snacking natural. Frescas y sin agregados.',
    18000,
    'nueces-pecan',
    true,
    false,
    'Listo para consumir. Conservar en lugar fresco y seco.',
    '500g'
  )
on conflict do nothing;

-- =============================================
-- CONFIGURACION INICIAL
-- =============================================
insert into site_settings (key, value) values
  ('whatsapp_number', '5491153447998'),
  ('instagram_handle', 'copuertos'),
  ('minimum_order', '20000'),
  ('delivery_cost_san_isidro', '3000'),
  ('delivery_cost_tigre', '2000'),
  ('delivery_cost_escobar', '1000'),
  ('transfer_alias', 'Cocina.oculta'),
  ('location_lat', '-34.2547'),
  ('location_lng', '-58.7293'),
  ('location_address', 'Puertos Escobar, Buenos Aires, Argentina')
on conflict (key) do nothing;
