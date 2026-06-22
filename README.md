# Nossa Casa

Painel responsivo para acompanhar imóvel, financiamento Caixa, cronograma, enxoval, poupança, documentos e inspirações.

## Executar

```bash
npm install
npm run dev
```

A aplicação usa Supabase Auth e sincroniza todas as alterações com o projeto remoto. O `localStorage` funciona apenas como cache otimista para manter a interface rápida.

## Supabase

1. Crie um projeto no Supabase.
2. Execute `supabase/migrations/202606220001_initial_schema.sql` no SQL Editor.
3. Copie `.env.example` para `.env.local` e informe URL e chave pública. Este workspace já está configurado para o projeto OurHouse.
4. Habilite o provedor Email no Supabase Auth.
5. Se o bucket de documentos tiver outro nome no seu projeto, ajuste `VITE_SUPABASE_DOCUMENTS_BUCKET`.

O schema inclui `house_members`, RLS por membro, storage privado e gatilhos de `updated_at`. No primeiro cadastro, a aplicação cria a casa, registra a conta como proprietária e popula os dados iniciais automaticamente.
