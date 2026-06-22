alter table public.houses add column if not exists join_code text;
update public.houses set join_code=upper(substr(encode(gen_random_bytes(8),'hex'),1,8)) where join_code is null;
alter table public.houses alter column join_code set default upper(substr(encode(gen_random_bytes(8),'hex'),1,8));
alter table public.houses alter column join_code set not null;
create unique index if not exists houses_join_code_key on public.houses(join_code);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  title text not null,
  category text not null default 'Geral',
  completed boolean not null default false,
  responsible text,
  due_date date,
  priority text not null default 'Média',
  notes text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.checklist_items enable row level security;
create policy "house members manage checklist_items" on public.checklist_items for all to authenticated using (private.is_house_member(house_id)) with check (private.is_house_member(house_id));
create trigger touch_checklist_items before update on public.checklist_items for each row execute function public.touch_updated_at();
create index if not exists checklist_items_house_id_idx on public.checklist_items(house_id);
create index if not exists checklist_items_user_id_idx on public.checklist_items(user_id);

create or replace function public.join_house_by_code(invite_code text,member_name text default 'Membro') returns uuid language plpgsql security definer set search_path=public,private as $$
declare target_house uuid;
begin
  if auth.uid() is null then raise exception 'Autenticação necessária'; end if;
  select id into target_house from public.houses where join_code=upper(trim(invite_code));
  if target_house is null then raise exception 'Código de convite inválido'; end if;
  insert into public.house_members(house_id,user_id,display_name,role) values(target_house,auth.uid(),coalesce(nullif(trim(member_name),''),'Membro'),'member') on conflict(house_id,user_id) do update set display_name=excluded.display_name;
  return target_house;
end; $$;
revoke all on function public.join_house_by_code(text,text) from public,anon;
grant execute on function public.join_house_by_code(text,text) to authenticated;

update public.shopping_items set responsible='Naelly' where responsible='Namorada';
update public.schedule_events set responsible='Naelly' where responsible='Namorada';
update public.savings_transactions set responsible='Naelly' where responsible='Namorada';
update public.documents set responsible='Naelly' where responsible='Namorada';
update public.checklist_items set responsible='Naelly' where responsible='Namorada';
