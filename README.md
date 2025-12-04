# InovaSys Manager

Sistema de gestão interna da InovaSys - ERP/CRM para controle financeiro, gestão de clientes e ativos.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Criptografia**: crypto-js (AES-256)

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Módulos

- **Dashboard**: Visão geral com KPIs e gráficos
- **Financeiro**: Controle de despesas e receitas
- **Clientes**: CRM com status e tags
- **Domínios**: Gestão com alertas de vencimento
- **Vault**: Armazenamento seguro de credenciais

## Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
VAULT_ENCRYPTION_KEY=sua_chave_secreta_aqui
```

---

Desenvolvido com 💗 pela InovaSys
