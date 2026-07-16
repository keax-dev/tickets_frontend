import { Injectable, inject, signal } from '@angular/core';
import { TicketApiService } from '../services/ticket-api.service';
import { PageResponse } from '../../../shared/models/api.models';
import {
  ProblemDetails,
  TicketPriority,
  TicketSummary,
  TicketStatus,
} from '../../../shared/models/api.models';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TicketListStore {
  private readonly ticketApiService = inject(TicketApiService);

  private readonly assignedAgentIdState = signal<string | null>(null);
  private readonly categoryIdState = signal<string | null>(null);
  private readonly priorityState = signal<TicketPriority | null>(null);
  private readonly loadingState = signal(false);
  private readonly searchState = signal('');
  private readonly statusState = signal<TicketStatus | null>(null);
  private readonly errorState = signal<string | null>(null);
  private readonly pageState = signal<PageResponse<TicketSummary> | null>(null);

  readonly assignedAgentId = this.assignedAgentIdState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();
  readonly categoryId = this.categoryIdState.asReadonly();
  readonly priority = this.priorityState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly search = this.searchState.asReadonly();
  readonly page = this.pageState.asReadonly();

  load(page = 0, size = 10): void {
    this.loadingState.set(true);
    this.ticketApiService
      .listTickets({
        search: this.searchState(),
        status: this.statusState(),
        priority: this.priorityState(),
        categoryId: this.categoryIdState(),
        assignedAgentId: this.assignedAgentIdState(),
        page,
        size,
      })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => {
          this.pageState.set(response);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(error?.detail ?? 'No fue posible cargar los tickets.');
        },
      });
  }

  updateSearch(value: string): void {
    this.searchState.set(value);
    this.load();
  }

  updateFilters(filters: {
    status: TicketStatus | null;
    priority: TicketPriority | null;
    categoryId: string | null;
    assignedAgentId: string | null;
  }): void {
    this.statusState.set(filters.status);
    this.priorityState.set(filters.priority);
    this.categoryIdState.set(filters.categoryId);
    this.assignedAgentIdState.set(filters.assignedAgentId);
    this.load();
  }
}
