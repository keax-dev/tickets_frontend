import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Component, computed, inject } from '@angular/core';
import { ROUTE_TITLES, getAppRoleLabel } from '../../../../shared/constants/ui.constants';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { ThemeStore } from '../../../theme/stores/theme.store';
import { AuthStore } from '../../../auth/stores/auth.store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterLinkActive,
    DividerModule,
    CommonModule,
    RouterOutlet,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    RouterLink,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  readonly themeStore = inject(ThemeStore);
  readonly authStore = inject(AuthStore);

  readonly navigationItems = computed(() => {
    const baseItems: Array<{ path: string; label: string; icon: string }> = [
      { path: '/dashboard', label: ROUTE_TITLES.dashboard, icon: 'pi pi-chart-bar' },
      { path: '/tickets', label: ROUTE_TITLES.tickets, icon: 'pi pi-ticket' },
      { path: '/notifications', label: ROUTE_TITLES.notifications, icon: 'pi pi-bell' },
      { path: '/profile', label: ROUTE_TITLES.profile, icon: 'pi pi-user' },
    ];

    if (this.authStore.hasPermission('USER_READ')) {
      baseItems.push({ path: '/admin/users', label: ROUTE_TITLES.users, icon: 'pi pi-users' });
    }
    if (this.authStore.hasPermission('CATEGORY_READ')) {
      baseItems.push({
        path: '/admin/categories',
        label: ROUTE_TITLES.categories,
        icon: 'pi pi-folder',
      });
    }
    if (this.authStore.hasPermission('SLA_READ')) {
      baseItems.push({ path: '/admin/sla', label: ROUTE_TITLES.sla, icon: 'pi pi-stopwatch' });
    }

    return baseItems;
  });

  readonly fullName = computed(() => {
    const user = this.authStore.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Guest';
  });

  readonly currentRoleLabel = computed(() => {
    const user = this.authStore.currentUser();
    return user ? getAppRoleLabel(user.role) : 'Guest';
  });
}
