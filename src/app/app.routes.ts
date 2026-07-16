import { authGuard, guestGuard, permissionGuard } from './core/auth/guards/auth.guards';
import { ShellComponent } from './core/layout/components/shell/shell.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Iniciar sesion',
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
        title: 'Dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
            (module) => module.DashboardPageComponent,
          ),
      },
      {
        path: 'tickets',
        title: 'Tickets',
        loadComponent: () =>
          import('./features/tickets/pages/ticket-list-page/ticket-list-page.component').then(
            (module) => module.TicketListPageComponent,
          ),
      },
      {
        path: 'tickets/new',
        title: 'Nuevo ticket',
        loadComponent: () =>
          import('./features/tickets/pages/ticket-create-page/ticket-create-page.component').then(
            (module) => module.TicketCreatePageComponent,
          ),
      },
      {
        path: 'tickets/:ticketId',
        title: 'Detalle del ticket',
        loadComponent: () =>
          import('./features/tickets/pages/ticket-detail-page/ticket-detail-page.component').then(
            (module) => module.TicketDetailPageComponent,
          ),
      },
      {
        path: 'notifications',
        title: 'Notificaciones',
        loadComponent: () =>
          import('./features/notifications/pages/notifications-page/notifications-page.component').then(
            (module) => module.NotificationsPageComponent,
          ),
      },
      {
        path: 'profile',
        title: 'Perfil',
        loadComponent: () =>
          import('./features/profile/pages/profile-page/profile-page.component').then(
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
          import('./features/administration/pages/users-page/users-page.component').then(
            (module) => module.UsersPageComponent,
          ),
      },
      {
        path: 'admin/categories',
        title: 'Categorias',
        canActivate: [permissionGuard],
        data: {
          permission: 'CATEGORY_READ',
        },
        loadComponent: () =>
          import('./features/administration/pages/categories-page/categories-page.component').then(
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
    title: 'Acceso denegado',
    loadComponent: () =>
      import('./features/system/pages/forbidden-page/forbidden-page.component').then(
        (module) => module.ForbiddenPageComponent,
      ),
  },
  {
    path: '**',
    title: 'Pagina no encontrada',
    loadComponent: () =>
      import('./features/system/pages/not-found-page/not-found-page.component').then(
        (module) => module.NotFoundPageComponent,
      ),
  },
];
