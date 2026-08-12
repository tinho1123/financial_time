import type { Auth } from '@/types/auth';
import type { AppNotification } from '@/types/finance';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            unreadNotificationsCount: number;
            notifications?: AppNotification[];
            [key: string]: unknown;
        };
    }
}
