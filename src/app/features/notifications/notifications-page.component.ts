import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { NotificationStore } from './notification.store';

@Component({
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  template: `
    <section class="page-card page">
      <div class="page-heading">
        <div>
          <h1>Notificaciones</h1>
          <p>Seguimiento personal de eventos relevantes del flujo de tickets.</p>
        </div>
        <button
          pButton
          type="button"
          label="Marcar todas"
          severity="secondary"
          (click)="notificationStore.markAllAsRead()"
        ></button>
      </div>

      <div class="stack">
        @for (notification of notificationStore.page()?.content ?? []; track notification.id) {
          <div class="notification-item">
            <div>
              <strong>{{ notification.title }}</strong>
              <p>{{ notification.message }}</p>
            </div>
            <div class="notification-side">
              <p-tag
                [value]="notification.read ? 'Leída' : 'Nueva'"
                [severity]="notification.read ? 'secondary' : 'success'"
              ></p-tag>
              <button
                pButton
                type="button"
                variant="text"
                label="Marcar"
                (click)="notificationStore.markAsRead(notification.id)"
              ></button>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .page {
        padding: 1.5rem;
      }

      .stack {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .notification-item {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem;
        border-radius: 18px;
        border: 1px solid var(--app-border);
        background: color-mix(in srgb, var(--app-surface-soft) 78%, transparent);
      }

      .notification-item p {
        margin: 0.35rem 0 0;
        color: var(--app-text-muted);
      }

      .notification-side {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-end;
      }
    `,
  ],
})
export class NotificationsPageComponent {
  readonly notificationStore = inject(NotificationStore);

  constructor() {
    this.notificationStore.load();
  }
}
