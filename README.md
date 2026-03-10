# Financial Time

**Financial Time** é uma aplicação web de gestão financeira pessoal que permite controlar receitas, despesas e saldos de contas de forma simples e eficiente.

## Funcionalidades

- **Contas** — gerencie múltiplas contas (corrente, poupança, cartão de crédito, dinheiro, investimentos)
- **Transações** — registre receitas e despesas com categorias, filtros e paginação
- **Categorias** — organize suas transações com categorias personalizadas por tipo
- **Dashboard** — visão geral da sua saúde financeira
- **Planos** — plano gratuito com limites e planos pagos com recursos avançados
- **Pagamento via PIX** — integração com Mercado Pago para assinaturas
- **Autenticação com 2FA** — segurança com autenticação de dois fatores

## Tecnologias

**Backend**
- PHP 8.3 + Laravel 12
- Laravel Fortify (autenticação)
- Laravel Cashier (assinaturas)
- MySQL (produção) / SQLite (desenvolvimento)

**Frontend**
- React 19 + TypeScript
- Inertia.js v2
- Tailwind CSS v4
- Vite

**Pagamentos**
- Mercado Pago (PIX)

## Requisitos

- PHP 8.2+
- Composer
- Node.js 22+
- Docker (opcional, para Laravel Sail)

## Instalação

```bash
# Clone o repositório
git clone git@github.com:tinho1123/financial_time.git
cd financial_time

# Instale as dependências e configure o ambiente
composer run setup
```

O script `setup` executa automaticamente:
1. `composer install`
2. Copia `.env.example` → `.env`
3. Gera a `APP_KEY`
4. Executa as migrations
5. `npm install && npm run build`

## Configuração do `.env`

```env
# Banco de dados
DB_CONNECTION=sqlite  # ou mysql para produção

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
MERCADO_PAGO_WEBHOOK_URL=https://seudominio.com/pix/webhook
```

## Executando em desenvolvimento

```bash
# Com Docker (recomendado)
composer run dev

# Sem Docker
php artisan serve
npm run dev
```

## Testes

```bash
php artisan test --compact
```

## Planos

| Plano    | Contas | Categorias | Gráficos avançados |
|----------|--------|------------|--------------------|
| Gratuito | 1      | 5          | Não                |
| Mensal   | ∞      | ∞          | Sim                |
| Anual    | ∞      | ∞          | Sim                |

O pagamento é feito via **PIX** com QR Code gerado pelo Mercado Pago.

## Deploy

O projeto utiliza GitHub Actions para CI/CD automático:

- **Lint** — verifica formatação PHP (Pint) e JavaScript (ESLint/Prettier)
- **Tests** — executa a suíte de testes com Pest
- **Deploy** — compila os assets e faz upload para a Hostinger via SSH

O deploy é disparado automaticamente a cada push na branch `main`.
