import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import notificationsRoute from '@/routes/notifications';
import type { AppNotification } from '@/types';

function timeAgo(dateString: string): string {
    const seconds = Math.floor(
        (Date.now() - new Date(dateString).getTime()) / 1000,
    );

    if (seconds < 60) return 'agora mesmo';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `há ${days}d`;

    return new Date(dateString).toLocaleDateString('pt-BR');
}

export function NotificationBell() {
    const { props } = usePage();
    const unreadCount = props.unreadNotificationsCount ?? 0;
    const notifications = props.notifications;

    function handleOpenChange(open: boolean) {
        if (open && notifications === undefined) {
            router.reload({ only: ['notifications'] });
        }
    }

    function handleMarkAllAsRead() {
        router.post(
            notificationsRoute.readAll.url(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['notifications'],
            },
        );
    }

    function handleNotificationClick(
        e: React.MouseEvent,
        notification: AppNotification,
    ) {
        e.preventDefault();

        if (!notification.read_at) {
            router.post(
                notificationsRoute.read.url(notification.id),
                {},
                {
                    preserveScroll: true,
                    onFinish: () => router.visit(notification.data.url),
                },
            );
        } else {
            router.visit(notification.data.url);
        }
    }

    return (
        <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notificações</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <div className="flex items-center justify-between px-1 py-1">
                    <DropdownMenuLabel className="p-0">
                        Notificações
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="size-3.5" />
                            Marcar tudo
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />

                {notifications === undefined ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                        Carregando...
                    </p>
                ) : notifications.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                        Nenhuma notificação por aqui.
                    </p>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} asChild>
                                <Link
                                    href={notification.data.url}
                                    onClick={(e) =>
                                        handleNotificationClick(e, notification)
                                    }
                                    className={cn(
                                        'flex cursor-pointer flex-col items-start gap-0.5 whitespace-normal',
                                        !notification.read_at && 'bg-accent/50',
                                    )}
                                >
                                    <div className="flex w-full items-center gap-1.5">
                                        {!notification.read_at && (
                                            <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {notification.data.title}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {notification.data.message}
                                    </p>
                                    <span className="text-[11px] text-muted-foreground/70">
                                        {timeAgo(notification.created_at)}
                                    </span>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
