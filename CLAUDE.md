<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.3.30
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v2
- laravel/cashier (CASHIER) - v16
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v12
- laravel/prompts (PROMPTS) - v0
- laravel/wayfinder (WAYFINDER) - v0
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA_REACT) - v2
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER_VITE) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Skills Activation

This project has domain-specific skills available. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

- `wayfinder-development` — Activates whenever referencing backend routes in frontend components. Use when importing from @/actions or @/routes, calling Laravel routes from TypeScript, or working with Wayfinder route functions.
- `pest-testing` — Tests applications using the Pest 4 PHP framework. Activates when writing tests, creating unit or feature tests, adding assertions, testing Livewire components, browser testing, debugging test failures, working with datasets or mocking; or when the user mentions test, spec, TDD, expects, assertion, coverage, or needs to verify functionality works.
- `inertia-react-development` — Develops Inertia.js v2 React client-side applications. Activates when creating React pages, forms, or navigation; using &lt;Link&gt;, &lt;Form&gt;, useForm, or router; working with deferred props, prefetching, or polling; or when user mentions React with Inertia, React pages, React forms, or React navigation.
- `tailwindcss-development` — Styles applications using Tailwind CSS v4 utilities. Activates when adding styles, restyling components, working with gradients, spacing, layout, flex, grid, responsive design, dark mode, colors, typography, or borders; or when the user mentions CSS, styling, classes, Tailwind, restyle, hero section, cards, buttons, or any visual/UI changes.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

- Laravel Boost is an MCP server that comes with powerful tools designed specifically for this application. Use them.

## Artisan

- Use the `list-artisan-commands` tool when you need to call an Artisan command to double-check the available parameters.

## URLs

- Whenever you share a project URL with the user, you should use the `get-absolute-url` tool to ensure you're using the correct scheme, domain/IP, and port.

## Tinker / Debugging

- You should use the `tinker` tool when you need to execute PHP to debug code or query Eloquent models directly.
- Use the `database-query` tool when you only need to read from the database.
- Use the `database-schema` tool to inspect table structure before writing migrations or models.

## Reading Browser Logs With the `browser-logs` Tool

- You can read browser logs, errors, and exceptions using the `browser-logs` tool from Boost.
- Only recent browser logs will be useful - ignore old logs.

## Searching Documentation (Critically Important)

- Boost comes with a powerful `search-docs` tool you should use before trying other approaches when working with Laravel or Laravel ecosystem packages. This tool automatically passes a list of installed packages and their versions to the remote Boost API, so it returns only version-specific documentation for the user's circumstance. You should pass an array of packages to filter on if you know you need docs for particular packages.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Use multiple, broad, simple, topic-based queries at once. For example: `['rate limiting', 'routing rate limiting', 'routing']`. The most relevant results will be returned first.
- Do not add package names to queries; package information is already shared. For example, use `test resource table`, not `filament 4 test resource table`.

### Available Search Syntax

1. Simple Word Searches with auto-stemming - query=authentication - finds 'authenticate' and 'auth'.
2. Multiple Words (AND Logic) - query=rate limit - finds knowledge containing both "rate" AND "limit".
3. Quoted Phrases (Exact Position) - query="infinite scroll" - words must be adjacent and in that order.
4. Mixed Queries - query=middleware "rate limit" - "middleware" AND exact phrase "rate limit".
5. Multiple Queries - queries=["authentication", "middleware"] - ANY of these terms.

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.

## Constructors

- Use PHP 8 constructor property promotion in `__construct()`.
    - `public function __construct(public GitHub $github) { }`
- Do not allow empty `__construct()` methods with zero parameters unless the constructor is private.

## Type Declarations

- Always use explicit return type declarations for methods and functions.
- Use appropriate PHP type hints for method parameters.

```php
protected function isAccessible(User $user, ?string $path = null): bool
{
    ...
}
```

## Enums

- Typically, keys in an Enum should be TitleCase. For example: `FavoritePerson`, `BestLake`, `Monthly`.

## Comments

- Prefer PHPDoc blocks over inline comments. Never use comments within the code itself unless the logic is exceptionally complex.

## PHPDoc Blocks

- Add useful array shape type definitions when appropriate.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v2

- Use all Inertia features from v1 and v2. Check the documentation before making changes to ensure the correct approach.
- New features: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using the `list-artisan-commands` tool.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

## Database

- Always use proper Eloquent relationship methods with return type hints. Prefer relationship methods over raw queries or manual joins.
- Use Eloquent models and relationships before suggesting raw database queries.
- Avoid `DB::`; prefer `Model::query()`. Generate code that leverages Laravel's ORM capabilities rather than bypassing them.
- Generate code that prevents N+1 query problems by using eager loading.
- Use Laravel's query builder for very complex database operations.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `list-artisan-commands` to check the available options to `php artisan make:model`.

### APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## Controllers & Validation

- Always create Form Request classes for validation rather than inline validation in controllers. Include both validation rules and custom error messages.
- Check sibling Form Requests to see if the application uses array or string based validation rules.

## Authentication & Authorization

- Use Laravel's built-in authentication and authorization features (gates, policies, Sanctum, etc.).

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Queues

- Use queued jobs for time-consuming operations with the `ShouldQueue` interface.

## Configuration

- Use environment variables only in configuration files - never use the `env()` function directly outside of config files. Always use `config('app.name')`, not `env('APP_NAME')`.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== laravel/v12 rules ===

# Laravel 12

- CRITICAL: ALWAYS use `search-docs` tool for version-specific Laravel documentation and updated code examples.
- Since Laravel 11, Laravel has a new streamlined file structure which this project uses.

## Laravel 12 Structure

- In Laravel 12, middleware are no longer registered in `app/Http/Kernel.php`.
- Middleware are configured declaratively in `bootstrap/app.php` using `Application::configure()->withMiddleware()`.
- `bootstrap/app.php` is the file to register middleware, exceptions, and routing files.
- `bootstrap/providers.php` contains application specific service providers.
- The `app\Console\Kernel.php` file no longer exists; use `bootstrap/app.php` or `routes/console.php` for console configuration.
- Console commands in `app/Console/Commands/` are automatically available and do not require manual registration.

## Database

- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.
- Laravel 12 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.

### Models

- Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.

=== wayfinder/core rules ===

# Laravel Wayfinder

Wayfinder generates TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

- IMPORTANT: Activate `wayfinder-development` skill whenever referencing backend routes in frontend components.
- Invokable Controllers: `import StorePost from '@/actions/.../StorePostController'; StorePost()`.
- Parameter Binding: Detects route keys (`{post:slug}`) — `show({ slug: "my-post" })`.
- Query Merging: `show(1, { mergeQuery: { page: 2, sort: null } })` merges with current URL, `null` removes params.
- Inertia: Use `.form()` with `<Form>` component or `form.submit(store())` with useForm.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.
- CRITICAL: ALWAYS use `search-docs` tool for version-specific Pest documentation and updated code examples.
- IMPORTANT: Activate `pest-testing` every time you're working with a Pest or testing-related task.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

=== tailwindcss/core rules ===

# Tailwind CSS

- Always use existing Tailwind conventions; check project patterns before adding new ones.
- IMPORTANT: Always use `search-docs` tool for version-specific Tailwind CSS documentation and updated code examples. Never rely on training data.
- IMPORTANT: Activate `tailwindcss-development` every time you're working with a Tailwind CSS or styling-related task.

</laravel-boost-guidelines>

---

# Financial Time — Project Documentation

## Project Overview

Financial Time is a personal financial management SPA (Single Page Application) targeting the Brazilian market. It allows users to track accounts, transactions, and categories with plan-based feature gating and dual payment integration (Stripe and Mercado Pago PIX).

**Tech stack summary:**
- Backend: Laravel 12 + Fortify (auth) + Cashier (Stripe) + custom PIX (Mercado Pago)
- Frontend: React 19 + Inertia.js v2 + Tailwind CSS v4 + Radix UI
- Testing: Pest v4
- Tooling: Pint (PHP formatting), ESLint + Prettier (JS formatting), Wayfinder (type-safe routes)

---

## Directory Structure

```
app/
├── Actions/Fortify/         # Fortify user creation and password reset
├── Concerns/                # Shared traits (PasswordValidationRules, ProfileValidationRules)
├── Enums/                   # AccountType, CategoryType, PlanInterval, TransactionType
├── Http/
│   ├── Controllers/         # Feature controllers + Settings/ subdirectory
│   ├── Middleware/          # HandleInertiaRequests, HandleAppearance
│   └── Requests/            # Form Requests per feature (Accounts/, Transactions/, Categories/, Settings/)
├── Models/                  # Eloquent models
└── Services/                # BalanceService, MercadoPagoService, PlanLimitService

bootstrap/
├── app.php                  # Middleware, routing, exception config (no Kernel.php)
└── providers.php            # Application service providers

database/
├── factories/               # Model factories for tests
├── migrations/              # Timestamped migrations
└── seeders/                 # DatabaseSeeder (seeds plans + test user)

resources/js/
├── app.tsx                  # Inertia app entry (PWA registration, theme init)
├── ssr.tsx                  # SSR entry point
├── components/              # Reusable React components
│   └── ui/                  # Base UI components (Radix-based)
├── hooks/                   # Custom React hooks
├── layouts/                 # App, auth, settings layouts
├── lib/                     # Utility functions
├── pages/                   # Inertia page components (mirrors route structure)
└── types/                   # TypeScript type definitions

routes/
├── web.php                  # All web routes (includes settings.php)
├── settings.php             # Settings + Fortify auth routes
└── console.php              # Artisan schedule / console commands

tests/
├── Feature/                 # Feature tests mirroring app structure
│   ├── Auth/
│   ├── Accounts/
│   ├── Categories/
│   ├── Transactions/
│   ├── Billing/
│   └── Settings/
└── Unit/
```

---

## Core Domain Models

### User
- Traits: `Billable` (Cashier), `TwoFactorAuthenticatable` (Fortify)
- Key relationships: `plan()`, `transactions()`, `categories()`, `accounts()`
- Auto-assigns free plan on creation via `boot()` hook
- Key methods: `onPaidPlan()`, `canAddAccount()`, `canAddCategory()`

### Account
- Types (enum): `checking`, `savings`, `cash`, `credit`, `investment`
- Balances stored in cents (`initial_balance_in_cents`)
- Current balance derived via `currentBalanceInCents()` from transactions

### Transaction
- Types (enum): `income`, `expense`
- Amounts in cents (`amount_in_cents`)
- Tracks balance snapshots: `previous_balance_in_cents`, `current_balance_in_cents`
- Belongs to a User, Account, and Category

### Category
- Types (enum): mirror TransactionType (`income`, `expense`)
- User-scoped; plan limits apply

### Plan
- Intervals (enum): `free`, `monthly`, `annual`
- Stores both Stripe price IDs and promo price IDs
- Feature flags: `has_advanced_charts`, `max_accounts`, `max_categories`
- Monetary values in cents

### PixPayment
- Tracks Mercado Pago PIX payment lifecycle
- Referenced in billing routes and webhook handler

---

## Monetary Convention

**All monetary values are stored and passed in cents (integers).** Never use floats for money.

```php
// Correct
$account->initial_balance_in_cents = 150000; // R$ 1,500.00

// Wrong
$account->balance = 1500.00;
```

On the frontend, use the `<AmountDisplay>` component to format and display monetary values.

---

## Plan & Feature Gating

Feature access is controlled by the `Plan` model and enforced in:
- `User::onPaidPlan()` — checks Stripe subscription OR non-expired paid plan
- `User::canAddAccount()` / `User::canAddCategory()` — checks against plan limits
- `PlanLimitService` — centralizes limit logic

The `<PlanLimitBanner>` React component surfaces limit warnings in the UI.

---

## Payment Integration

### Stripe (subscription billing)
- Uses Laravel Cashier v16
- Webhook route: `POST /stripe/webhook` (CSRF exempt)
- Handled by `CashierWebhookController`
- Checkout initiated via `BillingController::stripeCheckout()`

### Mercado Pago PIX (one-time payments, Brazilian market)
- Uses `MercadoPagoService`
- Webhook route: `POST /pix/webhook` (CSRF exempt)
- Handled by `PixWebhookController`
- QR code displayed via `billing/payment.tsx` page
- Payment status polled via `billing.payment-status` route

---

## Authentication & Security

- Laravel Fortify handles: login, register, password reset, email verification, 2FA
- Two-factor authentication: TOTP-based, managed in `Settings/TwoFactorAuthenticationController`
- Cookie encryption exemptions (in `bootstrap/app.php`): `appearance`, `sidebar_state`
- CSRF exemptions: `stripe/webhook`, `pix/webhook`

---

## Frontend Architecture

### Inertia Pages (`resources/js/pages/`)
Each route maps to a page component. Pages receive typed props from controllers via `Inertia::render()`.

### Layouts
- `app-layout.tsx` — authenticated app shell (sidebar + header)
- `auth-layout.tsx` — centered auth forms
- `settings/layout.tsx` — settings sub-navigation

### UI Components (`resources/js/components/ui/`)
Radix UI primitives wrapped with Tailwind. Always check these before building new UI:
`alert`, `avatar`, `badge`, `breadcrumb`, `button`, `card`, `checkbox`, `collapsible`, `dialog`, `dropdown-menu`, `icon`, `input`, `input-otp`, `label`, `navigation-menu`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `spinner`, `toggle`, `toggle-group`, `tooltip`

### Key App Components
- `category-form.tsx` — create/edit categories
- `transaction-form.tsx` — create/edit transactions
- `monthly-chart.tsx` — income/expense bar chart (paid plan only)
- `amount-display.tsx` — format cents to currency string
- `plan-limit-banner.tsx` — warning banner when limits are reached

### Hooks (`resources/js/hooks/`)
- `use-appearance.tsx` — light/dark theme management
- `use-clipboard.ts` — copy to clipboard
- `use-mobile.tsx` — mobile breakpoint detection
- `use-two-factor-auth.ts` — 2FA setup flow state

### Route Access (Wayfinder)
Never hardcode URLs in components. Use generated Wayfinder functions:
```ts
import { index } from '@/actions/TransactionController';
// or
import { dashboard } from '@/routes/dashboard';
```

---

## Development Workflows

### Local Setup
```bash
composer run setup   # install deps, .env, key, migrate, npm install, build
composer run dev     # Sail + Vite + queue + pail (concurrent)
```

### Running Tests
```bash
php artisan test --compact                          # all tests
php artisan test --compact --filter=AccountCrud    # filtered
```

### Code Formatting
```bash
vendor/bin/pint --dirty          # fix PHP style (run after any PHP change)
npm run lint                      # ESLint fix
npm run format                    # Prettier fix
npm run types:check               # TypeScript type check
```

### Full CI Check
```bash
composer run ci:check   # lint + format + types + tests
```

### Frontend Build
```bash
npm run build       # production build
npm run dev         # Vite dev server
```

---

## Routing Conventions

All routes are in `routes/web.php` and `routes/settings.php`. Key patterns:

| Prefix | Guard | Purpose |
|--------|-------|---------|
| `/` | none | Welcome page (shows plans) |
| `/dashboard` | `auth`, `verified` | Main dashboard |
| `/transactions` | `auth`, `verified` | Transaction CRUD |
| `/categories` | `auth`, `verified` | Category CRUD |
| `/accounts` | `auth`, `verified` | Account CRUD |
| `/billing/*` | `auth`, `verified` | Billing & payments |
| `/settings/*` | `auth` | Profile, password, 2FA |
| `/stripe/webhook` | none (CSRF exempt) | Stripe webhook |
| `/pix/webhook` | none (CSRF exempt) | PIX webhook |

---

## Database Notes

- SQLite in development, MySQL in production
- All monetary columns end in `_in_cents` (integer type)
- Timestamps follow Laravel defaults (`created_at`, `updated_at`)
- Migrations are sequential; `2026_03_*` migrations handle the core domain

---

## PWA Configuration

The app is configured as a PWA via `vite-plugin-pwa`:
- App name: "Financial Time"
- Theme color: `#10b981` (emerald-500)
- Start URL: `/dashboard`
- Display: `standalone`
- Bunny Fonts are cached with a 1-year TTL

---

## Environment Variables

Key `.env` variables (see `.env.example`):
```
STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
MERCADO_PAGO_ACCESS_TOKEN=
INERTIA_SSR_ENABLED=true
```

Never use `env()` directly in application code — always go through `config()`.
