<div align="center">

# 💰 Financial Time

**Gestão financeira pessoal simples, segura e eficiente.**

Controle suas contas, receitas, despesas e categorias em um só lugar — com suporte a múltiplas contas, gráficos mensais e planos premium.

[![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?logo=php&logoColor=white)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

## Funcionalidades

- **Contas** — corrente, poupança, dinheiro, cartão de crédito e investimentos
- **Transações** — registre receitas e despesas com descrição, categoria, data e notas
- **Categorias** — crie categorias personalizadas por tipo (receita/despesa)
- **Dashboard** — resumo mensal com totais de receitas, despesas e saldo líquido
- **Gráficos mensais** — visualize sua evolução financeira (planos pagos)
- **Planos com limites** — plano gratuito com limites e planos premium sem restrições
- **Pagamento via PIX** — QR Code gerado pelo Mercado Pago para assinaturas
- **Stripe** — pagamento por cartão de crédito com gerenciamento de assinatura
- **Autenticação completa** — login, registro, redefinição de senha e **2FA (TOTP)**
- **Tema claro/escuro** — preferência salva por usuário
- **PWA** — instalável como aplicativo no celular e desktop

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | PHP 8.3, Laravel 12, Fortify, Cashier v16 |
| Frontend | React 19, Inertia.js v2, TypeScript, Tailwind CSS v4 |
| UI Components | Radix UI + Lucide Icons |
| Pagamentos | Mercado Pago (PIX), Stripe (cartão) |
| Banco de dados | SQLite (dev) / MySQL (produção) |
| Testes | Pest v4 |
| CI/CD | GitHub Actions + Hostinger (SSH) |

---

## Requisitos

- PHP **8.2+** com extensões: `pdo`, `mbstring`, `openssl`, `tokenizer`, `xml`, `bcmath`
- Composer
- Node.js **22+**
- Docker (opcional, para Laravel Sail)

---

## Instalação

```bash
# 1. Clone o repositório
git clone git@github.com:tinho1123/financial_time.git
cd financial_time

# 2. Instale as dependências e configure o ambiente
composer run setup
```

O script `setup` executa automaticamente:

1. `composer install`
2. Copia `.env.example` → `.env`
3. Gera a `APP_KEY`
4. Executa as migrations
5. `npm install && npm run build`

---

## Configuração do `.env`

Após o setup, edite o `.env` com suas credenciais:

```env
# Banco de dados
DB_CONNECTION=sqlite         # use "mysql" em produção
# DB_HOST=127.0.0.1
# DB_DATABASE=financial_time
# DB_USERNAME=root
# DB_PASSWORD=

# Mercado Pago (PIX)
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
MERCADO_PAGO_WEBHOOK_URL=https://seudominio.com/pix/webhook

# Stripe (cartão de crédito)
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> Obtenha seu token do Mercado Pago em [developers.mercadopago.com](https://developers.mercadopago.com) e as chaves do Stripe em [dashboard.stripe.com](https://dashboard.stripe.com).

---

## Executando em desenvolvimento

```bash
# Com Docker (recomendado — inicia Sail + Vite + Queue + Logs)
composer run dev

# Sem Docker
php artisan serve
npm run dev
```

Acesse: [http://localhost:8000](http://localhost:8000)

---

## Testes

```bash
# Rodar todos os testes
php artisan test --compact

# Rodar um teste específico
php artisan test --compact --filter=AccountCrud
```

A suíte cobre: autenticação, 2FA, CRUD de contas/transações/categorias, billing e configurações de perfil.

---

## Qualidade de código

```bash
# Formatar PHP (Pint)
vendor/bin/pint

# Lint + format JavaScript
npm run lint
npm run format

# Verificar tipos TypeScript
npm run types:check

# CI completo (lint + format + types + testes)
composer run ci:check
```

---

## Planos

| Plano | Contas | Categorias | Gráficos avançados | Pagamento |
|-------|--------|------------|--------------------|-----------|
| **Gratuito** | 1 | 5 | Não | — |
| **Mensal** | Ilimitadas | Ilimitadas | Sim | PIX ou Cartão |
| **Anual** | Ilimitadas | Ilimitadas | Sim | PIX ou Cartão |

O pagamento via PIX gera um **QR Code** com prazo de validade. Após confirmação pelo Mercado Pago, o plano é ativado automaticamente via webhook.

---

## Deploy

O projeto usa **GitHub Actions** para CI/CD automático em cada push na branch `main`:

1. **Lint** — verifica formatação PHP (Pint) e JavaScript (ESLint/Prettier)
2. **Testes** — executa a suíte completa com Pest
3. **Deploy** — compila os assets e envia para a **Hostinger** via SSH

---

## Estrutura do Projeto

```
app/
├── Enums/           # AccountType, TransactionType, CategoryType, PlanInterval
├── Http/
│   ├── Controllers/ # DashboardController, TransactionController, BillingController...
│   └── Requests/    # Form Requests por recurso
├── Models/          # User, Account, Transaction, Category, Plan, PixPayment
└── Services/        # BalanceService, MercadoPagoService, PlanLimitService

resources/js/
├── pages/           # Páginas Inertia (dashboard, transactions, billing...)
├── components/      # Componentes reutilizáveis + ui/ (Radix-based)
├── layouts/         # App, auth e settings layouts
└── hooks/           # use-appearance, use-clipboard, use-mobile...
```

---

## Licença

MIT © [tinho1123](https://github.com/tinho1123)
