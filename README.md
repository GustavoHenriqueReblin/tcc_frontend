# TCC Frontend

Aplicação web do ERP para gestão de produção e estoque de sucos em pequenas agroindústrias, cobrindo cadastros, produção, vendas, compras e finanças com rastreio por lotes.

## Visão geral
- Vite 7 + React 19 + TypeScript (plugin SWC) com roteamento via React Router 7 e estado de dados com TanStack Query.
- UI em Tailwind CSS 4 com componentes Radix (dialog, select, tooltip), ícones Lucide e toasts Sonner; layout responsivo com Header + Sidebar.
- Formulários com React Hook Form + Zod (validação de CPF/CNPJ, CEP, telefone e máscaras), campos reutilizáveis em `src/components/Fields.tsx`.
- Tabelas com TanStack Table em `DataTable` (busca, ordenação e paginação server-side via `page`, `limit`, `search`, `sortBy`, `sortOrder`, filtros opcionais e visualização mobile).
- HTTP via Axios configurado com `withCredentials`; autenticação feita pelo cookie HttpOnly do backend (`/auth/me`), guardas `PublicRoute`/`ProtectedRoute` e contexto `AuthProvider`.
- Integração opcional de CNPJ (Brasil API) preenchendo estado/cidade pelo backend (`/states` e `/cities`).

## Principais páginas e fluxos
- Dashboard com cartões de capacidade/produção e atalhos rápidos.
- Autenticação: tela `/login` e guarda que consulta `/auth/me` antes de abrir o app.
- Cadastros: clientes e fornecedores (busca de CNPJ e endereço), definições de produto (tipos e categorias), unidades de medida e depósitos.
- Estoque: matérias-primas e produtos finais (CRUD), entrada de mercadorias (compra/colheita/ajuste), movimentações de estoque com origem e lotes/depósitos.
- Produção: ordens de produção (receita, depósito/lote, status e insumos) e finalização com quantidades produzidas/perdas/custos.
- Componentes de apoio: combobox com busca remota, date range picker, botões de status e loading.

## Arquitetura
- `src/main.tsx`: monta React + QueryClientProvider e estilos globais.
- `src/App.tsx` + `src/routes/*`: define BrowserRouter com rotas públicas/privadas; `AppLayout` renderiza shell com Header/Sidebar.
- `src/context/AuthContext.tsx`: estado do usuário, mutações de login/logout e erro/loading.
- `src/api/client.ts` + `src/config/env.ts`: Axios com base `VITE_API_URL` validada por Zod e `withCredentials` habilitado.
- `src/layout/{Header,Sidebar,AppLayout}.tsx`: estrutura de navegação e sessão do usuário.
- `src/components/ui/*`: biblioteca de UI (button, input, dialog, select, data-table, etc.) baseada em Radix + Tailwind.
- `src/schemas/*.ts`: validações Zod para login, clientes, fornecedores, produtos/definições, unidades, depósitos, ordens de produção e entradas de estoque.
- `src/hooks/useCnpjLookup.ts`: consulta Brasil API e preenche formulários; aciona buscas de estado/cidade no backend.
- `src/types/*`: enums e tipagens de domínio (status, papéis, tipos de produto, movimentação, pedidos).

## Ambiente
- Variáveis esperadas (`.env`, ver `.env.example`):
  - `VITE_API_URL` (URL base da API, deve aceitar cookies HttpOnly).
- Requisitos: Node 18+ e npm; backend em execução para autenticação e listas.

## Scripts
- `npm run dev`: inicia Vite em modo desenvolvimento (host exposto).
- `npm run build`: `tsc -b` e build Vite.
- `npm run preview`: pré-visualiza o build.
- `npm run lint` / `npm run lint:fix`: análise estática com ESLint.
- `npm run format`: formata com Prettier.

## Licença
©2026 Gustavo Henrique Reblin. Todos os direitos reservados.

Este software é de propriedade exclusiva do autor. Nenhuma parte deste código, documentação ou conteúdo poderá ser copiada, modificada, distribuída ou utilizada, total ou parcialmente, sem autorização expressa e por escrito do detentor dos direitos.

O uso deste sistema é restrito aos fins autorizados pelo proprietário. O descumprimento destas condições poderá resultar em sanções civis e penais conforme a legislação aplicável.
