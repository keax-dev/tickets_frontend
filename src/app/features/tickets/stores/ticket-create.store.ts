import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { resolveProblemDetailsMessage } from '../../../shared/utils/resolve-problem-details-message';
import { Category, CreateTicketRequest, ProblemDetails } from '../../../shared/models/api.models';
import { TicketApiService } from '../services/ticket-api.service';

@Injectable()
export class TicketCreateStore {
  private readonly ticketApiService = inject(TicketApiService);
  private readonly router = inject(Router);

  private readonly categoriesState = signal<Category[]>([]);
  private readonly loadingCategoriesState = signal(false);
  private readonly categoryErrorState = signal<string | null>(null);
  private readonly errorState = signal<string | null>(null);
  private readonly submittingState = signal(false);

  readonly categories = this.categoriesState.asReadonly();
  readonly loadingCategories = this.loadingCategoriesState.asReadonly();
  readonly categoryErrorMessage = this.categoryErrorState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();
  readonly submitting = this.submittingState.asReadonly();

  loadCategories(): void {
    this.loadingCategoriesState.set(true);
    this.categoryErrorState.set(null);

    this.ticketApiService
      .getCategories()
      .pipe(finalize(() => this.loadingCategoriesState.set(false)))
      .subscribe({
        next: (categories) => {
          this.categoriesState.set(categories.filter((category) => category.active));
        },
        error: (error: ProblemDetails) => {
          this.categoriesState.set([]);
          this.categoryErrorState.set(
            resolveProblemDetailsMessage(error, 'Unable to load categories.'),
          );
        },
      });
  }

  create(payload: CreateTicketRequest): void {
    this.errorState.set(null);
    this.submittingState.set(true);

    this.ticketApiService
      .createTicket(payload)
      .pipe(finalize(() => this.submittingState.set(false)))
      .subscribe({
        next: (ticket) => {
          void this.router.navigate(['/tickets', ticket.id]);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(resolveProblemDetailsMessage(error, 'Unable to create the ticket.'));
        },
      });
  }
}
