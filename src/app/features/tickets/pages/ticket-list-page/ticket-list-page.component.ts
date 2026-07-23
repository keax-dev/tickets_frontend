import { DestroyRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, merge } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { resolveProblemDetailsMessage } from '../../../../shared/utils/resolve-problem-details-message';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketApiService } from '../../services/ticket-api.service';
import {
  TICKET_PRIORITY_OPTIONS,
  TICKET_STATUS_OPTIONS,
  getTicketPriorityLabel,
  getTicketPriorityTagSeverity,
  getTicketStatusLabel,
} from '../../../../shared/constants/ui.constants';
import { InputTextModule } from 'primeng/inputtext';
import { TicketListStore } from '../../stores/ticket-list.store';
import { TablePageEvent } from 'primeng/types/table';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import {
  ProblemDetails,
  TicketPriority,
  SortDirection,
  TicketStatus,
  Category,
} from '../../../../shared/models/api.models';

type TicketTableSortEvent = {
  field?: string | string[] | null;
  order?: number | null;
};

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    SelectModule,
    CommonModule,
    TableModule,
    RouterLink,
    CardModule,
    TagModule,
  ],
  providers: [TicketListStore],
  templateUrl: './ticket-list-page.component.html',
  styleUrl: './ticket-list-page.component.css',
})
export class TicketListPageComponent implements OnInit {
  readonly defaultRows = 10;

  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly categoryErrorMessage = signal<string | null>(null);
  readonly ticketApiService = inject(TicketApiService);
  readonly ticketListStore = inject(TicketListStore);
  readonly categories = signal<Category[]>([]);

  readonly filtersForm = this.formBuilder.group({
    search: this.formBuilder.nonNullable.control(''),
    status: this.formBuilder.control<TicketStatus | null>(null),
    priority: this.formBuilder.control<TicketPriority | null>(null),
    categoryId: this.formBuilder.control<string | null>(null),
  });

  readonly statusOptions = TICKET_STATUS_OPTIONS;
  readonly priorityOptions = TICKET_PRIORITY_OPTIONS;
  readonly currentFirst = computed(
    () => this.ticketListStore.currentPage() * this.ticketListStore.pageSize(),
  );
  readonly sortField = this.ticketListStore.sortBy;
  readonly sortOrder = computed(() => (this.ticketListStore.sortDirection() === 'ASC' ? 1 : -1));
  readonly totalRecords = this.ticketListStore.totalRecords;
  readonly currentRows = this.ticketListStore.pageSize;

  ngOnInit(): void {
    this.ticketListStore.load(0, this.defaultRows);
    this.loadCategories();
    this.observeSearchChanges();
    this.observeStructuredFilterChanges();
  }

  statusLabel(status: TicketStatus): string {
    return getTicketStatusLabel(status);
  }

  priorityLabel(priority: TicketPriority): string {
    return getTicketPriorityLabel(priority);
  }

  priorityTagSeverity(priority: TicketPriority): 'secondary' | 'info' | 'warn' | 'danger' {
    return getTicketPriorityTagSeverity(priority);
  }

  onPageChange(event: TablePageEvent): void {
    const rows = event.rows;
    const page = Math.floor(event.first / rows);

    this.ticketListStore.load(page, rows);
  }

  onSortChange(event: TicketTableSortEvent): void {
    const sortBy = Array.isArray(event.field) ? event.field[0] : event.field;

    if (!sortBy) {
      return;
    }

    this.ticketListStore.updateSort(sortBy, this.resolveSortDirection(event.order));
  }

  private resolveSortDirection(order: number | null | undefined): SortDirection {
    return order === 1 ? 'ASC' : 'DESC';
  }

  private loadCategories(): void {
    this.categoryErrorMessage.set(null);
    this.ticketApiService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories.filter((category) => category.active));
        },
        error: (error: ProblemDetails) => {
          this.categories.set([]);
          this.categoryErrorMessage.set(
            resolveProblemDetailsMessage(error, 'Unable to load categories.'),
          );
        },
      });
  }

  private observeSearchChanges(): void {
    this.filtersForm.controls.search.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.ticketListStore.updateSearch(value);
      });
  }

  private observeStructuredFilterChanges(): void {
    merge(
      this.filtersForm.controls.status.valueChanges,
      this.filtersForm.controls.priority.valueChanges,
      this.filtersForm.controls.categoryId.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.ticketListStore.updateFilters({
          status: this.filtersForm.controls.status.value ?? null,
          priority: this.filtersForm.controls.priority.value ?? null,
          categoryId: this.filtersForm.controls.categoryId.value ?? null,
          assignedAgentId: null,
        });
      });
  }
}
