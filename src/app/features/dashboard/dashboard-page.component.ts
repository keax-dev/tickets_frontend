import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { DashboardStore } from './dashboard.store';

@Component({
  standalone: true,
  imports: [CommonModule, CardModule, SkeletonModule, TagModule, ButtonModule],
  template: `
    <section class="page-card page">
      <div class="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Visión rápida del estado operativo y del riesgo de SLA.</p>
        </div>
        <button
          pButton
          type="button"
          label="Recargar"
          icon="pi pi-refresh"
          severity="secondary"
          (click)="dashboardStore.load()"
        ></button>
      </div>

      @if (dashboardStore.loading()) {
        <div class="grid">
          @for (_ of skeletonCards; track $index) {
            <p-card>
              <p-skeleton width="8rem" height="1rem"></p-skeleton>
              <p-skeleton width="5rem" height="2rem"></p-skeleton>
            </p-card>
          }
        </div>
      } @else if (dashboardStore.summary(); as summary) {
        <div class="grid">
          <p-card header="Activos"
            ><strong>{{ summary.activeTickets }}</strong></p-card
          >
          <p-card header="Creados hoy"
            ><strong>{{ summary.createdToday }}</strong></p-card
          >
          <p-card header="Sin asignar"
            ><strong>{{ summary.unassignedTickets }}</strong></p-card
          >
          <p-card header="SLA vencido"
            ><strong>{{ summary.breachedTickets }}</strong></p-card
          >
        </div>

        <div class="two-columns">
          <p-card header="Tickets por estado">
            <div class="stack">
              @for (entry of objectEntries(summary.ticketsByStatus); track entry[0]) {
                <div class="metric-row">
                  <span>{{ statusLabels[entry[0]] }}</span>
                  <p-tag [value]="entry[1].toString()"></p-tag>
                </div>
              }
            </div>
          </p-card>

          <p-card header="Actividad reciente">
            @if (dashboardStore.recentActivity().length === 0) {
              <p>No hay actividad reciente para mostrar.</p>
            } @else {
              <div class="stack">
                @for (activity of dashboardStore.recentActivity(); track activity.id) {
                  <div class="metric-row metric-row-block">
                    <div>
                      <strong>{{ activity.action }}</strong>
                      <small>{{ activity.performedByName ?? 'Sistema' }}</small>
                    </div>
                    <small>{{ activity.createdAt | date: 'short' }}</small>
                  </div>
                }
              </div>
            }
          </p-card>
        </div>
      } @else {
        <p>No hay información disponible.</p>
      }
    </section>
  `,
  styles: [
    `
      .page {
        padding: 1.5rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }

      strong {
        font-size: 2rem;
      }

      .two-columns {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .stack {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .metric-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .metric-row-block {
        align-items: flex-start;
      }

      small {
        color: var(--app-text-muted);
      }

      @media (max-width: 960px) {
        .grid,
        .two-columns {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardPageComponent {
  readonly dashboardStore = inject(DashboardStore);
  readonly skeletonCards = Array.from({ length: 4 });
  readonly objectEntries = Object.entries;
  readonly statusLabels: Record<string, string> = {
    CREATED: 'Creado',
    ASSIGNED: 'Asignado',
    IN_PROGRESS: 'En progreso',
    WAITING_FOR_CUSTOMER: 'Esperando al cliente',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado',
    CANCELLED: 'Cancelado',
  };

  constructor() {
    this.dashboardStore.load();
  }
}
