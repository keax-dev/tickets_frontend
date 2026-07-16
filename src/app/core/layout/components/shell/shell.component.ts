import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Component, computed, inject } from '@angular/core';
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
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: 'pi pi-chart-bar' },
      { path: '/tickets', label: 'Tickets', icon: 'pi pi-ticket' },
      { path: '/notifications', label: 'Notificaciones', icon: 'pi pi-bell' },
      { path: '/profile', label: 'Perfil', icon: 'pi pi-user' },
    ];

    if (this.authStore.hasPermission('USER_READ')) {
      baseItems.push({ path: '/admin/users', label: 'Usuarios', icon: 'pi pi-users' });
    }
    if (this.authStore.hasPermission('CATEGORY_READ')) {
      baseItems.push({ path: '/admin/categories', label: 'Categorias', icon: 'pi pi-folder' });
    }
    if (this.authStore.hasPermission('SLA_READ')) {
      baseItems.push({ path: '/admin/sla', label: 'SLA', icon: 'pi pi-stopwatch' });
    }

    return baseItems;
  });

  readonly fullName = computed(() => {
    const user = this.authStore.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Invitado';
  });
}
