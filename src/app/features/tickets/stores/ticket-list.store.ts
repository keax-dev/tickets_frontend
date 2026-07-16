import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketApiService } from '../services/ticket-api.service';
import {
  PageResponse,
  ProblemDetails,
  TicketListFilters,
  TicketPriority,
  TicketSummary,
  TicketStatus,
} from '../../../shared/models/api.models';
import { EMPTY, Subject, catchError, finalize, switchMap, tap } from 'rxjs';
import { resolveProblemDetailsMessage } from '../../../shared/utils/resolve-problem-details-message';

@Injectable({
  providedIn: 'root',
})
export class TicketListStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ticketApiService = inject(TicketApiService);

  private readonly loadRequests$ = new Subject<TicketListFilters>();
  private readonly assignedAgentIdState = signal<string | null>(null);
  private readonly categoryIdState = signal<string | null>(null);
  private readonly priorityState = signal<TicketPriority | null>(null);
  private readonly loadingState = signal(false);
  private readonly searchState = signal('');
  private readonly statusState = signal<TicketStatus | null>(null);
  private readonly errorState = signal<string | null>(null);
  private readonly pageState = signal<PageResponse<TicketSummary> | null>(null);

  private latestRequestId = 0;

  readonly assignedAgentId = this.assignedAgentIdState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();
  readonly categoryId = this.categoryIdState.asReadonly();
  readonly priority = this.priorityState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly search = this.searchState.asReadonly();
  readonly page = this.pageState.asReadonly();

  constructor() {
    this.loadRequests$
      .pipe(
        switchMap((filters) => {
          const requestId = ++this.latestRequestId;

          this.loadingState.set(true);
          this.errorState.set(null);
          this.pageState.set(null);

          return this.ticketApiService.listTickets(filters).pipe(
            tap((response) => {
              this.pageState.set(response);
            }),
            catchError((error: ProblemDetails) => {
              this.pageState.set(null);
              this.errorState.set(
                resolveProblemDetailsMessage(error, 'No fue posible cargar los tickets.'),
              );
              return EMPTY;
            }),
            finalize(() => {
              if (this.latestRequestId === requestId) {
                this.loadingState.set(false);
              }
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  load(page = 0, size = 10): void {
    this.loadRequests$.next({
      search: this.searchState(),
      status: this.statusState(),
      priority: this.priorityState(),
      categoryId: this.categoryIdState(),
      assignedAgentId: this.assignedAgentIdState(),
      page,
      size,
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
