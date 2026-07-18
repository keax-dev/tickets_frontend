import { NotificationItem, PageResponse, ProblemDetails } from '../../../shared/models/api.models';
import { Observable, finalize, switchMap } from 'rxjs';
import { resolveProblemDetailsMessage } from '../../../shared/utils/resolve-problem-details-message';
import { Injectable, inject, signal } from '@angular/core';
import { NotificationApiService } from '../services/notification-api.service';

@Injectable()
export class NotificationStore {
  private readonly notificationApiService = inject(NotificationApiService);

  private readonly totalRecordsState = signal(0);
  private readonly currentPageState = signal(0);
  private readonly pageSizeState = signal(10);

  private readonly updatingState = signal(false);
  private readonly loadingState = signal(false);

  private readonly pageState = signal<PageResponse<NotificationItem> | null>(null);
  private readonly errorState = signal<string | null>(null);

  readonly totalRecords = this.totalRecordsState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();
  readonly currentPage = this.currentPageState.asReadonly();
  readonly updating = this.updatingState.asReadonly();
  readonly pageSize = this.pageSizeState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly page = this.pageState.asReadonly();

  load(page = 0, size = 10): void {
    this.currentPageState.set(page);
    this.pageSizeState.set(size);
    this.loadingState.set(true);
    this.errorState.set(null);
    this.pageState.set(null);

    this.notificationApiService
      .list(page, size)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => {
          this.totalRecordsState.set(response.totalElements);
          this.pageState.set(response);
        },
        error: (error: ProblemDetails) => {
          this.pageState.set(null);
          this.errorState.set(
            resolveProblemDetailsMessage(error, 'No fue posible cargar las notificaciones.'),
          );
        },
      });
  }

  markAsRead(notificationId: string): void {
    this.runNotificationMutation(
      this.notificationApiService.markAsRead(notificationId),
      'No fue posible marcar la notificacion como leida.',
    );
  }

  markAllAsRead(): void {
    this.runNotificationMutation(
      this.notificationApiService.markAllAsRead(),
      'No fue posible marcar las notificaciones como leidas.',
    );
  }

  private runNotificationMutation(request$: Observable<unknown>, fallbackMessage: string): void {
    const currentPage = this.currentPageState();
    const currentSize = this.pageSizeState();

    this.updatingState.set(true);
    this.errorState.set(null);

    request$
      .pipe(
        switchMap(() => this.notificationApiService.list(currentPage, currentSize)),
        finalize(() => this.updatingState.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.totalRecordsState.set(response.totalElements);
          this.pageState.set(response);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(resolveProblemDetailsMessage(error, fallbackMessage));
        }
      });
  }
}
