# SmartList - Lista de Compras Inteligente

Uma aplicação web moderna e completa para gerenciar suas listas de compras, com sincronização online, sugestões inteligentes e interface otimizada para mobile e desktop.

## 🚀 Features

### Funcionalidades Core
- ✅ Autenticação completa (login, cadastro, logout)
- ✅ Criação e gerenciamento de múltiplas listas
- ✅ Adição rápida de itens com Enter
- ✅ Itens com quantidade, unidade, categoria e preço
- ✅ Check/uncheck de itens
- ✅ Busca com debounce
- ✅ Filtros por categoria e status (pendente/concluído)
- ✅ Total estimado da compra
- ✅ Duplicação de listas
- ✅ Histórico de itens frequentes e recentes

### Funcionalidades "UAU"
- 🧠 Autocategorização inteligente (sugere categoria e unidade baseado no nome)
- 💡 Sugestões de itens (frequentes e recentes)
- ⚠️ Detecção de duplicados
- ⌨️ Atalhos de teclado (Enter, Esc, Ctrl+K)
- 🎨 Tema claro/escuro
- 📱 PWA instalável com suporte offline básico
- 🎯 UI moderna com microinterações

## 🛠️ Stack Tecnológica

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Roteamento
- **Zustand** - Gerenciamento de estado
- **TanStack Query (React Query)** - Data fetching e cache
- **Styled Components** - Estilização
- **Supabase** - Autenticação e banco de dados
- **React Beautiful DnD** - Drag and drop
- **React Hot Toast** - Notificações
- **Vite PWA** - Progressive Web App

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase (gratuita)

## 🔧 Instalação Rápida

1. **Instale as dependências:**

```bash
npm install
```

2. **Configure o Supabase:**

   📖 **Siga o guia completo passo a passo em [SETUP.md](./SETUP.md)**
   
   **🚫 Para desativar completamente envio de emails (produção):**
   📖 **Siga o guia em [DESATIVAR_EMAIL_SUPABASE.md](./DESATIVAR_EMAIL_SUPABASE.md)**
   
   Resumo rápido:
   - Crie um projeto no [Supabase](https://supabase.com)
   - **Desative "Confirm email"** (Authentication → Providers → Email) para desenvolvimento/produção
   - Copie a Project URL e anon key
   - Crie um arquivo `.env` na raiz com suas credenciais
   - Execute o `database.sql` no SQL Editor do Supabase
   - Reinicie o servidor (`npm run dev`)

3. **Inicie o servidor:**

```bash
npm run dev
```

O app estará disponível em `http://localhost:3000` (ou outra porta se 3000 estiver ocupada)

**⚠️ Importante:** Se o Supabase não estiver configurado, você será redirecionado para a página `/setup` com instruções detalhadas.

## 📁 Estrutura do Projeto

```
src/
├── features/
│   ├── auth/           # Autenticação
│   │   ├── context/    # AuthProvider
│   │   └── pages/      # Landing, Auth
│   ├── lists/          # Listas
│   │   ├── hooks/      # useLists, useList
│   │   ├── pages/      # Home, ListDetail
│   │   └── services/   # listService
│   ├── items/          # Itens
│   │   ├── hooks/      # useItems, useFrequentItems
│   │   └── services/   # itemService
│   └── settings/        # Configurações
│       └── pages/       # Settings
├── shared/
│   ├── components/     # Componentes reutilizáveis
│   ├── lib/            # Supabase client
│   ├── styles/         # GlobalStyle
│   ├── types/          # Tipagens TypeScript
│   └── utils/          # Funções utilitárias
└── App.tsx             # Rotas principais
```

## 🗄️ Banco de Dados

### Tabelas

#### `lists`
- `id` (UUID, PK)
- `user_id` (UUID, FK -> auth.users)
- `title` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `items`
- `id` (UUID, PK)
- `user_id` (UUID, FK -> auth.users)
- `list_id` (UUID, FK -> lists)
- `name` (TEXT)
- `quantity` (NUMERIC)
- `unit` (TEXT)
- `category` (TEXT)
- `price` (NUMERIC, opcional)
- `checked` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Row Level Security (RLS)

Todas as tabelas têm RLS ativado. As policies garantem que:
- Usuários só veem seus próprios dados
- Usuários só podem criar/atualizar/deletar seus próprios registros
- Todas as queries são filtradas automaticamente por `user_id`

## 🎨 Funcionalidades Detalhadas

### Autenticação
- Login e cadastro com email/senha
- Persistência de sessão (mantém logado após refresh)
- Rotas protegidas (PrivateRoute)
- Logout

### Listas
- Criar listas com título personalizado
- Visualizar todas as listas na home
- Duplicar listas existentes
- Deletar listas (com confirmação)
- Ordenação por data de atualização

### Itens
- Adicionar itens com nome, quantidade, unidade, categoria e preço
- Autocategorização baseada no nome do item
- Sugestões de itens frequentes e recentes
- Marcar/desmarcar itens como concluídos
- Busca em tempo real com debounce
- Filtros por categoria e status
- Reordenação por drag-and-drop (visual)
- Cálculo automático do total estimado
- Detecção de duplicados

### UI/UX
- Design moderno e limpo
- Responsivo (mobile-first)
- Tema claro/escuro
- Microinterações e animações suaves
- Loading states e skeletons
- Empty states informativos
- Toasts para feedback
- Acessibilidade básica (labels, foco)

### PWA
- Instalável como app
- Cache de assets para offline
- Service worker configurado
- Manifest completo

## ⌨️ Atalhos de Teclado

- `Enter` - Adiciona item (quando no campo de nome)
- `Esc` - Fecha modais
- `Ctrl+K` - Foca na busca (planejado)

## 🔒 Segurança

- RLS ativado em todas as tabelas
- Policies garantem isolamento de dados por usuário
- Apenas chaves públicas do Supabase no frontend
- Validação de dados no cliente e servidor

## 📱 PWA

O app é um Progressive Web App (PWA) instalável:
- Funciona offline (cache de assets)
- Pode ser instalado no celular/desktop
- Service worker para cache inteligente

## 🚧 Melhorias Futuras

- [ ] Sincronização offline completa (fila de operações)
- [ ] Reordenação persistente de itens
- [ ] Modo mercado (UI simplificada)
- [ ] Compartilhamento de listas
- [ ] Exportação/importação de dados
- [ ] Notificações push
- [ ] Histórico de compras
- [ ] Estatísticas e gráficos

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões e melhorias são bem-vindas!

## 📄 Licença

MIT

## 👨‍💻 Autor

Desenvolvido com ❤️ para uso pessoal diário.

---

**Nota:** Certifique-se de configurar corretamente as variáveis de ambiente e executar o SQL no Supabase antes de usar o app.
