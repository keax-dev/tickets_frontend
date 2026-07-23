import { authGuard, guestGuard, permissionGuard } from './core/auth/guards/auth.guards';
import { ROUTE_TITLES } from './shared/constants/ui.constants';
import { ShellComponent } from './core/layout/components/shell/shell.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: ROUTE_TITLES.login,
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page.component').then(
        (module) => module.LoginPageComponent,
      ),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: ROUTE_TITLES.dashboard,
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
            (module) => module.DashboardPageComponent,
          ),
      },
      {
        path: 'tickets',
        title: ROUTE_TITLES.tickets,
        loadComponent: () =>
          import('./features/tickets/pages/ticket-list-page/ticket-list-page.component').then(
            (module) => module.TicketListPageComponent,
          ),
      },
      {
        path: 'tickets/new',
        title: ROUTE_TITLES.ticketCreate,
        loadComponent: () =>
          import('./features/tickets/pages/ticket-create-page/ticket-create-page.component').then(
            (module) => module.TicketCreatePageComponent,
          ),
      },
      {
        path: 'tickets/:ticketId',
        title: ROUTE_TITLES.ticketDetail,
        loadComponent: () =>
          import('./features/tickets/pages/ticket-detail-page/ticket-detail-page.component').then(
            (module) => module.TicketDetailPageComponent,
          ),
      },
      {
        path: 'notifications',
        title: ROUTE_TITLES.notifications,
        loadComponent: () =>
          import('./features/notifications/pages/notifications-page/notifications-page.component').then(
            (module) => module.NotificationsPageComponent,
          ),
      },
      {
        path: 'profile',
        title: ROUTE_TITLES.profile,
        loadComponent: () =>
          import('./features/profile/pages/profile-page/profile-page.component').then(
            (module) => module.ProfilePageComponent,
          ),
      },
      {
        path: 'admin/users',
        title: ROUTE_TITLES.users,
        canActivate: [permissionGuard],
        data: {
          permission: 'USER_READ',
        },
        loadComponent: () =>
          import('./features/administration/pages/users-page/users-page.component').then(
            (module) => module.UsersPageComponent,
          ),
      },
      {
        path: 'admin/categories',
        title: ROUTE_TITLES.categories,
        canActivate: [permissionGuard],
        data: {
          permissions: ['CATEGORY_CREATE', 'CATEGORY_UPDATE', 'CATEGORY_DISABLE'],
        },
        loadComponent: () =>
          import('./features/administration/pages/categories-page/categories-page.component').then(
            (module) => module.CategoriesPageComponent,
          ),
      },
      {
        path: 'admin/sla',
        title: ROUTE_TITLES.sla,
        canActivate: [permissionGuard],
        data: {
          permission: 'SLA_READ',
        },
        loadComponent: () =>
          import('./features/administration/pages/sla-page/sla-page.component').then(
            (module) => module.SlaPageComponent,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
  {
    path: 'forbidden',
    title: ROUTE_TITLES.forbidden,
    loadComponent: () =>
      import('./features/system/pages/forbidden-page/forbidden-page.component').then(
        (module) => module.ForbiddenPageComponent,
      ),
  },
  {
    path: '**',
    title: ROUTE_TITLES.notFound,
    loadComponent: () =>
      import('./features/system/pages/not-found-page/not-found-page.component').then(
        (module) => module.NotFoundPageComponent,
      ),
  },
];
