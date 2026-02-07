# ⚡ Quick Fix: Erro PGRST205

## 🎯 Solução Rápida (2 minutos)

### 1. Acesse o Supabase Dashboard
- Vá em: **SQL Editor**

### 2. Execute este SQL (copie e cole tudo):

```sql
-- Remover tabelas antigas (se existirem)
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.lists CASCADE;

-- Criar tabela lists
CREATE TABLE public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela items
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'un',
  category TEXT NOT NULL DEFAULT 'Outros',
  price NUMERIC(10, 2),
  checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_lists_user_id ON public.lists(user_id);
CREATE INDEX idx_lists_updated_at ON public.lists(updated_at DESC);
CREATE INDEX idx_items_user_id ON public.items(user_id);
CREATE INDEX idx_items_list_id ON public.items(list_id);

-- Função updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON public.lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Policies para lists
CREATE POLICY "Users can view own lists" ON public.lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own lists" ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lists" ON public.lists FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own lists" ON public.lists FOR DELETE USING (auth.uid() = user_id);

-- Policies para items
CREATE POLICY "Users can view own items" ON public.items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own items" ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON public.items FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON public.items FOR DELETE USING (auth.uid() = user_id);

-- ⚠️ IMPORTANTE: Recarregar cache do PostgREST
NOTIFY pgrst, 'reload schema';
```

### 3. Aguarde 30 segundos

### 4. Recarregue a página do frontend (F5)

### 5. Teste criar uma lista

✅ **Pronto!** O erro deve ter desaparecido.

---

## 🔍 Se ainda der erro:

1. **Aguarde mais 1-2 minutos** (cache pode demorar)
2. **Execute novamente:** `NOTIFY pgrst, 'reload schema';`
3. **Verifique no Table Editor** se as tabelas aparecem

---

## 📚 Documentação Completa

Veja `SOLUCAO_PGRST205.md` para análise detalhada e troubleshooting.
