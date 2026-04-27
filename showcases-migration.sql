-- =============================================
-- VITRINAS / SHOWCASES - Secciones de la homepage
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Tabla de vitrinas
create table if not exists showcases (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Productos en cada vitrina (tabla puente)
create table if not exists showcase_products (
  id uuid primary key default uuid_generate_v4(),
  showcase_id uuid not null references showcases(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  display_order integer default 0,
  unique(showcase_id, product_id)
);

-- Indices
create index if not exists idx_showcase_products_showcase on showcase_products(showcase_id);
create index if not exists idx_showcase_products_product on showcase_products(product_id);

-- RLS
alter table showcases enable row level security;
alter table showcase_products enable row level security;

create policy "Showcases viewable by everyone" on showcases for select using (true);
create policy "Showcases editable by admin" on showcases for all using (auth.role() = 'authenticated');
create policy "Showcase products viewable by everyone" on showcase_products for select using (true);
create policy "Showcase products editable by admin" on showcase_products for all using (auth.role() = 'authenticated');

-- Migrar: crear vitrina "Mas vendidos" con los productos que ya estan destacados
insert into showcases (title, subtitle, display_order, is_active) values
  ('Más vendidos', 'Los favoritos de nuestros clientes', 1, true);

insert into showcase_products (showcase_id, product_id, display_order)
select s.id, p.id, row_number() over (order by p.name)::int
from products p, showcases s
where p.is_featured = true and s.title = 'Más vendidos';
