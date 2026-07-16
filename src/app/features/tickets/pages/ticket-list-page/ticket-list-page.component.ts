import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TicketPriority, TicketStatus } from '../../../../shared/models/api.models';
import { Component, inject, OnInit } from '@angular/core';
import { TicketApiService } from '../../services/ticket-api.service';
import { InputTextModule } from 'primeng/inputtext';
import { TicketListStore } from '../../stores/ticket-list.store';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    CommonModule,
    TableModule,
    RouterLink,
    CardModule,
    TagModule,
  ],
  templateUrl: './ticket-list-page.component.html',
  styleUrl: './ticket-list-page.component.css',
})
export class TicketListPageComponent implements OnInit {
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

  ngOnInit() {
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
