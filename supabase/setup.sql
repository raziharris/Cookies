create extension if not exists pgcrypto;

create table if not exists public.stock_state (
  id integer primary key check (id = 1),
  stock_s integer not null default 0 check (stock_s >= 0),
  stock_m integer not null default 0 check (stock_m >= 0),
  updated_at timestamptz not null default now()
);

insert into public.stock_state (id, stock_s, stock_m)
values (1, 0, 0)
on conflict (id) do nothing;

create table if not exists public.stock_admin_auth (
  id integer primary key check (id = 1),
  password_hash text not null,
  updated_at timestamptz not null default now()
);

insert into public.stock_admin_auth (id, password_hash)
values (1, extensions.crypt('cuzicunim', extensions.gen_salt('bf')))
on conflict (id) do nothing;

create table if not exists public.stock_reservations (
  order_key text primary key,
  quantity_s integer not null default 0 check (quantity_s >= 0),
  quantity_m integer not null default 0 check (quantity_m >= 0),
  created_at timestamptz not null default now()
);

alter table public.stock_state enable row level security;
alter table public.stock_admin_auth enable row level security;
alter table public.stock_reservations enable row level security;

drop policy if exists "Public can read stock" on public.stock_state;
create policy "Public can read stock"
on public.stock_state
for select
to anon, authenticated
using (true);

create or replace function public.verify_admin_password(admin_password text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_hash text;
begin
  select password_hash
  into stored_hash
  from public.stock_admin_auth
  where id = 1;

  return stored_hash is not null
    and extensions.crypt(admin_password, stored_hash) = stored_hash;
end;
$$;

create or replace function public.admin_set_stock(
  admin_password text,
  new_stock_s integer,
  new_stock_m integer
)
returns public.stock_state
language plpgsql
security definer
set search_path = public
as $$
declare
  result_row public.stock_state;
begin
  if not public.verify_admin_password(admin_password) then
    raise exception 'Invalid admin password';
  end if;

  update public.stock_state
  set
    stock_s = greatest(0, least(10000, coalesce(new_stock_s, 0))),
    stock_m = greatest(0, least(10000, coalesce(new_stock_m, 0))),
    updated_at = now()
  where id = 1
  returning *
  into result_row;

  return result_row;
end;
$$;

create or replace function public.reserve_stock(
  order_key text,
  quantity_s integer,
  quantity_m integer
)
returns public.stock_state
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_s integer := greatest(0, coalesce(quantity_s, 0));
  normalized_m integer := greatest(0, coalesce(quantity_m, 0));
  result_row public.stock_state;
begin
  if coalesce(order_key, '') = '' then
    raise exception 'Order key is required';
  end if;

  insert into public.stock_reservations (order_key, quantity_s, quantity_m)
  values (order_key, normalized_s, normalized_m)
  on conflict (order_key) do nothing;

  if not found then
    select *
    into result_row
    from public.stock_state
    where id = 1;

    return result_row;
  end if;

  update public.stock_state
  set
    stock_s = greatest(stock_s - normalized_s, 0),
    stock_m = greatest(stock_m - normalized_m, 0),
    updated_at = now()
  where id = 1
  returning *
  into result_row;

  return result_row;
end;
$$;

grant execute on function public.verify_admin_password(text) to anon, authenticated;
grant execute on function public.admin_set_stock(text, integer, integer) to anon, authenticated;
grant execute on function public.reserve_stock(text, integer, integer) to anon, authenticated;
