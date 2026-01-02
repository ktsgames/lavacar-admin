# LavaCar Admin

Painel de administração para gerenciar usuários do aplicativo LavaCar.

## Funcionalidades

- **Dashboard** com estatísticas de usuários (Free, Pendentes, Pró)
- **Gerenciamento de usuários**:
  - Ver todos os usuários
  - Aprovar solicitações de plano Pró
  - Estender dias de acesso Pró
  - Revogar plano Pró
  - Remover usuários
- **Filtros e busca** por email ou nome
- **Autenticação segura** apenas para administrador

## Credenciais de Acesso

- **Email**: kaiquedev2425@gmail.com
- **Senha**: 12022004@Kts

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```bash
   pnpm install
   ```
3. Configure as variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://rpqyhvbqterlxsflsiga.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
   ```
4. Execute o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```
5. Acesse http://localhost:3001

## Deploy

Para fazer deploy em produção:

```bash
pnpm build
pnpm start
```

## Tecnologias

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase

## Autor

Criado por **KaiqueDev**
