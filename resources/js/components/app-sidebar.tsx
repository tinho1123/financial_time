import { Link } from '@inertiajs/react';
import {
    ArrowLeftRight,
    LayoutGrid,
    PiggyBank,
    Repeat,
    Tag,
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
        title: 'Categorias',
        href: categories.index.url(),
        icon: Tag,
    },
    {
        title: 'Contas',
        href: accounts.index.url(),
        icon: Wallet,
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
