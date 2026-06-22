create extension if not exists "pgcrypto";

create table public.houses (
  id uuid primary key default gen_random_uuid(), name text not null, address text, city text, neighborhood text,
  lot_size text, built_size text, property_type text, seller text, seller_contact text, property_value numeric default 0,
  down_payment numeric default 0, delivery_date date, purchase_status text default 'Em análise', notes text,
  created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.house_members (
  house_id uuid references public.houses(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade,
  display_name text not null, role text not null default 'member', created_at timestamptz not null default now(), primary key(house_id,user_id)
);
create table public.financing (
  id uuid primary key default gen_random_uuid(), house_id uuid not null references public.houses(id) on delete cascade, user_id uuid references auth.users(id),
  bank text default 'Caixa Econômica Federal', financing_type text, property_value numeric default 0, financed_value numeric default 0,
  down_payment numeric default 0, installments_count int, annual_rate numeric, monthly_rate numeric, amortization_system text,
  contract_date date, first_due_date date, due_day int, first_value numeric, current_value numeric, current_balance numeric,
  current_number int default 0, contract_status text, contract_url text, notes text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.financing_installments (
  id uuid primary key default gen_random_uuid(), house_id uuid not null references public.houses(id) on delete cascade, financing_id uuid references public.financing(id) on delete cascade,
  user_id uuid references auth.users(id), installment_number int not null, due_date date, value numeric default 0, interest numeric default 0,
  amortization numeric default 0, fees numeric default 0, balance numeric default 0, status text default 'Pendente', payment_date date,
  receipt_url text, notes text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.rooms (id uuid primary key default gen_random_uuid(), house_id uuid not null references public.houses(id) on delete cascade, user_id uuid references auth.users(id), name text not null, icon text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.shopping_items (id uuid primary key default gen_random_uuid(), house_id uuid not null references public.houses(id) on delete cascade, room_id uuid references public.rooms(id) on delete set null, user_id uuid references auth.users(id), name text not null, category text, estimated_value numeric default 0, actual_value numeric, store text, product_url text, priority text, status text, purchased boolean default false, responsible text, purchase_date date, notes text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.schedule_events (id uuid primary key default gen_random_uuid(), house_id uuid not null references public.houses(id) on delete cascade, user_id uuid references auth.users(id), title text not null, category text, event_date date, event_time time, responsible text, status text, priority text, notes text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.savings_goals (id uuid primary key default gen_random_uuid(), house_id uuid not null references public.houses(id) on delete cascade, user_id uuid references auth.users(id), name text not null, target_amount numeric not null default 0 check(target_amount >= 0), deadline date, category text, priority text, notes text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.savings_transactions (id uuid primary key default gen_random_uuid(), house_id uuid not null references public.houses(id) on delete cascade, goal_id uuid references public.savings_goals(id) on delete set null, user_id uuid references auth.users(id), description text not null, transaction_type text not null check(transaction_type in ('Depósito','Retirada')), amount numeric not null check(amount > 0), transaction_date date not null default current_date, responsible text, notes text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.documents (id uuid primary key default gen_random_uuid(), house_id uuid not null references public.houses(id) on delete cascade, user_id uuid references auth.users(id), name text not null, category text, status text, sent_date date, expiry_date date, responsible text, file_url text, notes text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.inspirations (id uuid primary key default gen_random_uuid(), house_id uuid not null references public.houses(id) on delete cascade, user_id uuid references auth.users(id), title text not null, room text, category text, image_url text, priority text, status text, notes text, created_at timestamptz default now(), updated_at timestamptz default now());

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['houses','financing','financing_installments','rooms','shopping_items','schedule_events','savings_goals','savings_transactions','documents','inspirations'] loop execute format('create trigger touch_%I before update on public.%I for each row execute function public.touch_updated_at()',t,t); end loop; end $$;
create or replace function public.is_house_member(target uuid) returns boolean language sql security definer stable set search_path=public as $$ select exists(select 1 from public.house_members where house_id=target and user_id=auth.uid()) $$;

alter table public.houses enable row level security; alter table public.house_members enable row level security;
create policy "members read houses" on public.houses for select using (public.is_house_member(id) or created_by=auth.uid());
create policy "users create houses" on public.houses for insert with check (created_by=auth.uid());
create policy "members update houses" on public.houses for update using (public.is_house_member(id));
create policy "members read membership" on public.house_members for select using (public.is_house_member(house_id) or user_id=auth.uid());
create policy "owners manage membership" on public.house_members for all using (exists(select 1 from public.house_members m where m.house_id=house_members.house_id and m.user_id=auth.uid() and m.role='owner'));
do $$ declare t text; begin foreach t in array array['financing','financing_installments','rooms','shopping_items','schedule_events','savings_goals','savings_transactions','documents','inspirations'] loop execute format('alter table public.%I enable row level security',t); execute format('create policy "house members manage %1$I" on public.%1$I for all using (public.is_house_member(house_id)) with check (public.is_house_member(house_id))',t); end loop; end $$;

insert into storage.buckets(id,name,public) values ('house-documents','house-documents',false) on conflict do nothing;
create policy "members upload house files" on storage.objects for insert to authenticated with check (bucket_id='house-documents');
create policy "members read house files" on storage.objects for select to authenticated using (bucket_id='house-documents');
