import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TicketPriority, TicketStatus } from '../../shared/models/api.models';
import { TicketApiService } from './ticket-api.service';
import { TicketListStore } from './ticket-list.store';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
  ],
  template: `
    <section class="page-card page">
      <div class="page-heading">
        <div>
          <h1>Tickets</h1>
          <p>Busqueda, filtros server-side y seguimiento del estado operativo.</p>
        </div>
        <a pButton routerLink="/tickets/new" label="Nuevo ticket" icon="pi pi-plus"></a>
      </div>

      <form class="filters" [formGroup]="filtersForm">
        <input
          pInputText
          type="search"
          formControlName="search"
          placeholder="Buscar por codigo, titulo o descripcion"
        />
        <p-select
          formControlName="status"
          [options]="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Estado"
        ></p-select>
        <p-select
          formControlName="priority"
          [options]="priorityOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Prioridad"
        ></p-select>
        <p-select
          formControlName="categoryId"
          [options]="categories"
          optionLabel="name"
          optionValue="id"
          placeholder="Categoria"
        ></p-select>
      </form>

      <p-table
        [value]="ticketListStore.page()?.content ?? []"
        [loading]="ticketListStore.loading()"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Codigo</th>
            <th>Titulo</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Solicitante</th>
            <th>Agente</th>
            <th>Vence</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-ticket>
          <tr [routerLink]="['/tickets', ticket.id]" class="row-link">
            <td>{{ ticket.code }}</td>
            <td>{{ ticket.title }}</td>
            <td><p-tag [value]="statusLabel(ticket.status)"></p-tag></td>
            <td>
              <p-tag
                [value]="priorityLabel(ticket.priority)"
                [severity]="priorityTagSeverity(ticket.priority)"
              ></p-tag>
            </td>
            <td>{{ ticket.requesterName ?? 'Sin dato' }}</td>
            <td>{{ ticket.assignedAgentName ?? 'Sin asignar' }}</td>
            <td>{{ ticket.resolutionDueAt | date: 'short' }}</td>
          </tr>
        </ng-template>
      </p-table>
    </section>
  `,
  styles: [
    `
      .page {
        padding: 1.5rem;
      }

      .filters {
        display: grid;
        grid-template-columns: 2fr repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .row-link {
        cursor: pointer;
      }

      @media (max-width: 960px) {
        .filters {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TicketListPageComponent {
  readonly ticketListStore = inject(TicketListStore);
  readonly ticketApiService = inject(TicketApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly filtersForm = this.formBuilder.group({
    search: this.formBuilder.nonNullable.control(''),
    status: this.formBuilder.control<TicketStatus | null>(null),
    priority: this.formBuilder.control<TicketPriority | null>(null),
    categoryId: this.formBuilder.control<string | null>(null),
  });

  readonly statusLabels: Record<TicketStatus, string> = {
    CREATED: 'Creado',
    ASSIGNED: 'Asignado',
    IN_PROGRESS: 'En progreso',
    WAITING_FOR_CUSTOMER: 'Esperando al cliente',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado',
    CANCELLED: 'Cancelado',
  };

  readonly priorityLabels: Record<TicketPriority, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    URGENT: 'Urgente',
  };

  readonly prioritySeverity: Record<TicketPriority, 'secondary' | 'info' | 'warn' | 'danger'> = {
    LOW: 'secondary',
    MEDIUM: 'info',
    HIGH: 'warn',
    URGENT: 'danger',
  };

  readonly statusOptions = Object.entries(this.statusLabels).map(([value, label]) => ({
    value: value as TicketStatus,
    label,
  }));
  readonly priorityOptions = Object.entries(this.priorityLabels).map(([value, label]) => ({
    value: value as TicketPriority,
    label,
  }));
  categories: { id: string; name: string }[] = [];

  constructor() {
    this.ticketListStore.load();
    this.ticketApiService.getCategories().subscribe((categories) => {
      this.categories = categories.filter((category) => category.active);
    });

    this.filtersForm.controls.search.valueChanges.subscribe((value) => {
      this.ticketListStore.updateSearch(value ?? '');
    });

    this.filtersForm.valueChanges.subscribe((value) => {
      this.ticketListStore.updateFilters({
        status: value.status ?? null,
        priority: value.priority ?? null,
        categoryId: value.categoryId ?? null,
        assignedAgentId: null,
      });
    });
  }

  statusLabel(status: TicketStatus): string {
    return this.statusLabels[status];
  }

  priorityLabel(priority: TicketPriority): string {
    return this.priorityLabels[priority];
  }

  priorityTagSeverity(priority: TicketPriority): 'secondary' | 'info' | 'warn' | 'danger' {
    return this.prioritySeverity[priority];
  }
}
