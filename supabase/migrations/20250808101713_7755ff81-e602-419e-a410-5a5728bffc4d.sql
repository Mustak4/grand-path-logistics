-- Enums
create type public.user_role as enum ('dispecer', 'vozac');
create type public.tip_naplata as enum ('fiskalna', 'faktura');
create type public.metod_plakanje as enum ('gotovo', 'transakcija');
create type public.ruta_status as enum ('draft', 'aktivna', 'zavrsena');
create type public.stop_status as enum ('na_cekane', 'zavrseno', 'preskoknato');

-- Profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  ime text not null default 'Корисник',
  telefon text,
  uloga public.user_role not null default 'vozac',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated at trigger function (shared)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- SECURITY DEFINER helper to check roles
create or replace function public.has_role(_user_id uuid, _role public.user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p where p.id = _user_id and p.uloga = _role
  );
$$;

-- Auto-create profile for new users (default role = vozac)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, ime, telefon, uloga)
  values (new.id,
          coalesce(new.raw_user_meta_data ->> 'ime', 'Возач'),
          coalesce(new.raw_user_meta_data ->> 'telefon', null),
          'vozac')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Core domain tables
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  ime text not null,
  naseleno_mesto text not null,
  adresa text not null,
  lat double precision,
  lng double precision,
  telefon text,
  tip_naplata public.tip_naplata not null,
  zabeleshka text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_clients_updated_at
before update on public.clients
for each row execute function public.update_updated_at_column();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  ime text not null,
  edinica text not null,
  cena_po_edinica numeric not null,
  tezina_kg numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.update_updated_at_column();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  klient_id uuid not null references public.clients(id) on delete restrict,
  datum timestamptz not null default now(),
  tip_naplata public.tip_naplata not null,
  metod_plakanje public.metod_plakanje not null,
  suma numeric not null,
  zabeleshka text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.update_updated_at_column();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  naracka_id uuid not null references public.orders(id) on delete cascade,
  produkt_id uuid not null references public.products(id) on delete restrict,
  kolicina numeric not null check (kolicina > 0)
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  datum date not null,
  vozac_id uuid references public.profiles(id) on delete set null,
  vozilo text,
  status public.ruta_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_routes_datum on public.routes(datum);
create index if not exists idx_routes_vozac on public.routes(vozac_id);
create trigger trg_routes_updated_at
before update on public.routes
for each row execute function public.update_updated_at_column();

create table if not exists public.stops (
  id uuid primary key default gen_random_uuid(),
  ruta_id uuid not null references public.routes(id) on delete cascade,
  naracka_id uuid not null references public.orders(id) on delete restrict,
  redosled integer not null,
  status public.stop_status not null default 'na_cekane',
  eta timestamptz,
  suma_za_naplata numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_stops_ruta on public.stops(ruta_id);
create index if not exists idx_stops_naracka on public.stops(naracka_id);
create trigger trg_stops_updated_at
before update on public.stops
for each row execute function public.update_updated_at_column();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.routes enable row level security;
alter table public.stops enable row level security;

-- Profiles policies
create policy "Profiles: select own or dispatcher" on public.profiles
for select to authenticated using (
  id = auth.uid() or public.has_role(auth.uid(), 'dispecer')
);
create policy "Profiles: insert self" on public.profiles
for insert to authenticated with check (id = auth.uid());
create policy "Profiles: update own or dispatcher" on public.profiles
for update to authenticated using (
  id = auth.uid() or public.has_role(auth.uid(), 'dispecer')
);

-- Clients policies
create policy "Clients: everyone authenticated can read" on public.clients
for select to authenticated using (true);
create policy "Clients: dispatcher full access" on public.clients
for all to authenticated using (public.has_role(auth.uid(), 'dispecer')) with check (public.has_role(auth.uid(), 'dispecer'));

-- Products policies
create policy "Products: everyone authenticated can read" on public.products
for select to authenticated using (true);
create policy "Products: dispatcher full access" on public.products
for all to authenticated using (public.has_role(auth.uid(), 'dispecer')) with check (public.has_role(auth.uid(), 'dispecer'));

-- Orders policies
create policy "Orders: dispatcher full access" on public.orders
for all to authenticated using (public.has_role(auth.uid(), 'dispecer')) with check (public.has_role(auth.uid(), 'dispecer'));
create policy "Orders: drivers can view own stops' orders" on public.orders
for select to authenticated using (
  exists (
    select 1 from public.stops s
    join public.routes r on r.id = s.ruta_id
    where s.naracka_id = orders.id and r.vozac_id = auth.uid()
  )
);

-- Order items policies
create policy "OrderItems: dispatcher full access" on public.order_items
for all to authenticated using (public.has_role(auth.uid(), 'dispecer')) with check (public.has_role(auth.uid(), 'dispecer'));
create policy "OrderItems: drivers can view items of their orders" on public.order_items
for select to authenticated using (
  exists (
    select 1 from public.orders o
    join public.stops s on s.naracka_id = o.id
    join public.routes r on r.id = s.ruta_id
    where o.id = order_items.naracka_id and r.vozac_id = auth.uid()
  )
);

-- Routes policies
create policy "Routes: dispatcher full access" on public.routes
for all to authenticated using (public.has_role(auth.uid(), 'dispecer')) with check (public.has_role(auth.uid(), 'dispecer'));
create policy "Routes: drivers can view own" on public.routes
for select to authenticated using (vozac_id = auth.uid());

-- Stops policies
create policy "Stops: dispatcher full access" on public.stops
for all to authenticated using (public.has_role(auth.uid(), 'dispecer')) with check (public.has_role(auth.uid(), 'dispecer'));
create policy "Stops: drivers can view own route stops" on public.stops
for select to authenticated using (
  exists (
    select 1 from public.routes r where r.id = stops.ruta_id and r.vozac_id = auth.uid()
  )
);
create policy "Stops: drivers can update status on own route" on public.stops
for update to authenticated using (
  exists (
    select 1 from public.routes r where r.id = stops.ruta_id and r.vozac_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.routes r where r.id = stops.ruta_id and r.vozac_id = auth.uid()
  )
);
