import { NotificationItem, PageResponse, ProblemDetails } from '../../../shared/models/api.models';
import { Injectable, inject, signal } from '@angular/core';
import { NotificationApiService } from '../services/notification-api.service';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationStore {
  private readonly notificationApiService = inject(NotificationApiService);

  private readonly loadingState = signal(false);
  private readonly pageState = signal<PageResponse<NotificationItem> | null>(null);
  private readonly errorState = signal<string | null>(null);

  readonly errorMessage = this.errorState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly page = this.pageState.asReadonly();

  load(page = 0, size = 20): void {
    this.loadingState.set(true);
    this.notificationApiService
      .list(page, size)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (response) => {
          this.pageState.set(response);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(error?.detail ?? 'No fue posible cargar las notificaciones.');
        },
      });
  }

  markAsRead(notificationId: string): void {
    this.notificationApiService
      .markAsRead(notificationId)
      .subscribe(() => this.load(this.page()?.page ?? 0, this.page()?.size ?? 20));
  }

  markAllAsRead(): void {
    this.notificationApiService
      .markAllAsRead()
      .subscribe(() => this.load(this.page()?.page ?? 0, this.page()?.size ?? 20));
  }
}
