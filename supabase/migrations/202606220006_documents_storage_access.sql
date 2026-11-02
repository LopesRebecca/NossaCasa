-- Permite o upload de documentos pelo app.
--
-- Contexto: o login do app é local (senha básica, sem sessão do Supabase Auth),
-- então as requisições ao Storage chegam como role "anon". As policies da
-- migration inicial só liberavam a role "authenticated", e por isso todo upload
-- falhava com "new row violates row-level security policy".
--
-- Rode este arquivo no SQL Editor do Supabase.

-- Garante que o bucket existe e é público (a URL do arquivo é aberta direto na tabela).
insert into storage.buckets (id, name, public)
values ('house-documents', 'house-documents', true)
on conflict (id) do update set public = true;

-- Envio: somente dentro da pasta houses/ do bucket de documentos.
drop policy if exists "app users upload house documents" on storage.objects;
create policy "app users upload house documents"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'house-documents'
    and (storage.foldername(name))[1] = 'houses'
  );

-- Leitura: necessária para listar/baixar mesmo se o bucket voltar a ser privado.
drop policy if exists "app users read house documents" on storage.objects;
create policy "app users read house documents"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'house-documents');
