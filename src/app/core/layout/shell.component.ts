import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AuthStore } from '../auth/auth.store';
import { ThemeStore } from '../theme/theme.store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    DividerModule,
  ],
  template: `
    <div class="shell">
      <aside class="sidebar page-card">
        <div>
          <p class="eyebrow">Management Tickets</p>
          <h2>Centro de soporte</h2>
          <p class="muted">Gestiona tickets, comentarios, prioridades y seguimiento operativo.</p>
        </div>

        <nav class="nav">
          @for (item of navigationItems(); track item.path) {
            <a class="nav-link" [routerLink]="item.path" routerLinkActive="nav-link-active">
              <i [class]="item.icon"></i>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <p-divider />

        <div class="sidebar-footer">
          <button
            pButton
            type="button"
            severity="contrast"
            variant="text"
            [label]="'Modo ' + themeStore.modeLabel()"
            icon="pi pi-palette"
            (click)="themeStore.toggle()"
          ></button>
          <button
            pButton
            type="button"
            severity="danger"
            variant="text"
            label="Cerrar sesión"
            icon="pi pi-sign-out"
            (click)="authStore.logout()"
          ></button>
        </div>
      </aside>

      <div class="content">
        <header class="topbar page-card">
          <div>
            <p class="eyebrow">Sesión activa</p>
            <h1>Hola, {{ authStore.currentUser()?.firstName }}</h1>
          </div>

          <div class="user-pill">
            <a class="notification-link" routerLink="/notifications">
              <i class="pi pi-bell"></i>
            </a>
            <p-avatar [label]="authStore.userInitials()" shape="circle" />
            <div>
              <strong>{{ fullName() }}</strong>
              <small>{{ authStore.currentUser()?.role }}</small>
            </div>
          </div>
        </header>

        <main class="main-view">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .shell {
        display: grid;
        grid-template-columns: 320px minmax(0, 1fr);
        gap: 1.25rem;
        min-height: 100vh;
        padding: 1rem;
      }

      .sidebar,
      .topbar {
        padding: 1.5rem;
      }

      .sidebar {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        position: sticky;
        top: 1rem;
        max-height: calc(100vh - 2rem);
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0;
      }

      .eyebrow {
        margin: 0 0 0.35rem;
        color: var(--app-accent);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h2,
      h1 {
        margin: 0;
      }

      .muted {
        color: var(--app-text-muted);
        margin: 0.5rem 0 0;
      }

      .nav {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.9rem 1rem;
        border-radius: 18px;
        color: var(--app-text-muted);
        transition: 0.2s ease;
      }

      .nav-link:hover,
      .nav-link-active {
        background: color-mix(in srgb, var(--app-accent) 10%, var(--app-surface-soft));
        color: var(--app-text);
      }

      .sidebar-footer {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: auto;
      }

      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .user-pill {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .notification-link {
        width: 2.5rem;
        height: 2.5rem;
        display: grid;
        place-items: center;
        border-radius: 999px;
        border: 1px solid var(--app-border);
      }

      .user-pill small {
        display: block;
        color: var(--app-text-muted);
      }

      .main-view {
        min-width: 0;
      }

      @media (max-width: 1100px) {
        .shell {
          grid-template-columns: 1fr;
        }

        .sidebar {
          position: static;
          max-height: none;
        }

        .topbar {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class ShellComponent {
  readonly authStore = inject(AuthStore);
  readonly themeStore = inject(ThemeStore);

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
      baseItems.push({ path: '/admin/categories', label: 'Categorías', icon: 'pi pi-folder' });
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
