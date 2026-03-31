export type TransactionType = 'income' | 'expense';
export type AccountType =
    | 'checking'
    | 'savings'
    | 'cash'
    | 'credit'
    | 'investment';
export type PlanInterval = 'free' | 'monthly' | 'annual';

export type Plan = {
    id: number;
    uuid: string;
    slug: string;
    name: string;
    price_in_cents: number;
    promo_price_in_cents: number | null;
    promo_months: number | null;
    interval: PlanInterval;
    max_accounts: number | null;
    max_categories: number | null;
    has_advanced_charts: boolean;
    has_creem_checkout: boolean;
    usd_price_in_cents: number | null;
};

export type Category = {
    id: number;
    user_id: number;
    name: string;
    type: TransactionType;
    color: string;
};

export type Account = {
    id: number;
    user_id: number;
    name: string;
    type: AccountType;
    currency: string;
    initial_balance_in_cents: number;
    current_balance_in_cents: number;
};

export type Transaction = {
    id: number;
    user_id: number;
    account_id: number;
    category_id: number | null;
    type: TransactionType;
    amount_in_cents: number;
    previous_balance_in_cents: number;
    current_balance_in_cents: number;
    description: string;
    date: string;
    notes: string | null;
    account?: Account;
    category?: Category | null;
};

export type MonthlySummary = {
    month: string;
    income_in_cents: number;
    expense_in_cents: number;
};

export type CategoryBreakdown = {
    category_name: string;
    color: string;
    total_in_cents: number;
    percentage: number;
};

export type PixPayment = {
    id: number;
    qr_code: string;
    amount_in_cents: number;
    expires_at: string;
    plan_name: string;
};

export type PaginatedTransactions = {
    data: Transaction[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};
