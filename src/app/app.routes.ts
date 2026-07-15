import { Routes } from '@angular/router';
import { authGuard, guestGuard, permissionGuard } from './core/auth/auth.guards';
import { ShellComponent } from './core/layout/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Iniciar sesión',
    loadComponent: () =>
      import('./features/auth/login-page.component').then((module) => module.LoginPageComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page.component').then(
            (module) => module.DashboardPageComponent,
          ),
      },
      {
        path: 'tickets',
        title: 'Tickets',
        loadComponent: () =>
          import('./features/tickets/ticket-list-page.component').then(
            (module) => module.TicketListPageComponent,
          ),
      },
      {
        path: 'tickets/new',
        title: 'Nuevo ticket',
        loadComponent: () =>
          import('./features/tickets/ticket-create-page.component').then(
            (module) => module.TicketCreatePageComponent,
          ),
      },
      {
        path: 'tickets/:ticketId',
        title: 'Detalle del ticket',
        loadComponent: () =>
          import('./features/tickets/ticket-detail-page.component').then(
            (module) => module.TicketDetailPageComponent,
          ),
      },
      {
        path: 'notifications',
        title: 'Notificaciones',
        loadComponent: () =>
          import('./features/notifications/notifications-page.component').then(
            (module) => module.NotificationsPageComponent,
          ),
      },
      {
        path: 'profile',
        title: 'Perfil',
        loadComponent: () =>
          import('./features/profile/profile-page.component').then(
            (module) => module.ProfilePageComponent,
          ),
      },
      {
        path: 'admin/users',
        title: 'Usuarios',
        canActivate: [permissionGuard],
        data: {
          permission: 'USER_READ',
        },
        loadComponent: () =>
          import('./features/administration/users-page.component').then(
            (module) => module.UsersPageComponent,
          ),
      },
      {
        path: 'admin/categories',
        title: 'Categorías',
        canActivate: [permissionGuard],
        data: {
          permission: 'CATEGORY_READ',
        },
        loadComponent: () =>
          import('./features/administration/categories-page.component').then(
            (module) => module.CategoriesPageComponent,
          ),
      },
      {
        path: 'admin/sla',
        title: 'SLA',
        canActivate: [permissionGuard],
        data: {
          permission: 'SLA_READ',
        },
        loadComponent: () =>
          import('./features/administration/sla-page.component').then(
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
    title: 'Acceso denegado',
    loadComponent: () =>
      import('./features/system/forbidden-page.component').then(
        (module) => module.ForbiddenPageComponent,
      ),
  },
  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () =>
      import('./features/system/not-found-page.component').then(
        (module) => module.NotFoundPageComponent,
      ),
  },
];
