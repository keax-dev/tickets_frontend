import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../core/config/api-base-url.token';
import { NotificationItem, PageResponse } from '../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class NotificationApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(page: number, size: number) {
    return this.httpClient.get<PageResponse<NotificationItem>>(
      `${this.apiBaseUrl}/notifications?page=${page}&size=${size}`,
    );
  }

  markAsRead(notificationId: string) {
    return this.httpClient.patch<NotificationItem>(
      `${this.apiBaseUrl}/notifications/${notificationId}/read`,
      {},
    );
  }

  markAllAsRead() {
    return this.httpClient.patch<void>(`${this.apiBaseUrl}/notifications/read-all`, {});
  }
}
