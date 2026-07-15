import { Injectable, inject, signal } from '@angular/core';
import { NotificationItem, PageResponse, ProblemDetails } from '../../shared/models/api.models';
import { NotificationApiService } from './notifications-api.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationStore {
  private readonly notificationApiService = inject(NotificationApiService);

  private readonly loadingState = signal(false);
  private readonly pageState = signal<PageResponse<NotificationItem> | null>(null);
  private readonly errorState = signal<string | null>(null);

  readonly loading = this.loadingState.asReadonly();
  readonly page = this.pageState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();

  load(page = 0, size = 20): void {
    this.loadingState.set(true);
    this.notificationApiService.list(page, size).subscribe({
      next: (response) => {
        this.pageState.set(response);
        this.loadingState.set(false);
      },
      error: (error: ProblemDetails) => {
        this.errorState.set(error?.detail ?? 'No fue posible cargar las notificaciones.');
        this.loadingState.set(false);
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
