import { Link } from '@inertiajs/react';
import {
    ArrowLeftRight,
    LayoutGrid,
    LineChart,
    PiggyBank,
    Repeat,
    Tag,
    Target,
    Wallet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import accounts from '@/routes/accounts';
import budgets from '@/routes/budgets';
import categories from '@/routes/categories';
import goals from '@/routes/goals';
import investments from '@/routes/investments';
import recurringTransactions from '@/routes/recurring-transactions';
import transactions from '@/routes/transactions';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url(),
        icon: LayoutGrid,
    },
    {
        title: 'Transações',
        href: transactions.index.url(),
        icon: ArrowLeftRight,
    },
    {
        title: 'Recorrentes',
        href: recurringTransactions.index.url(),
        icon: Repeat,
    },
    {
        title: 'Orçamentos',
        href: budgets.index.url(),
        icon: PiggyBank,
    },
    {
        title: 'Metas',
        href: goals.index.url(),
        icon: Target,
    },
    {
        title: 'Categorias',
        href: categories.index.url(),
        icon: Tag,
    },
    {
        title: 'Contas',
        href: accounts.index.url(),
        icon: Wallet,
    },
    {
        title: 'Investimentos',
        href: investments.index.url(),
        icon: LineChart,
    },
    // {
    //     title: 'Cobrança',
    //     href: billing.index.url(),
    //     icon: CreditCard,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard.url()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
