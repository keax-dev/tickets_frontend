import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../core/config/api-base-url.token';
import { DashboardSummary, RecentActivity } from '../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getSummary() {
    return this.httpClient.get<DashboardSummary>(`${this.apiBaseUrl}/dashboard/summary`);
  }

  getRecentActivity() {
    return this.httpClient.get<RecentActivity[]>(`${this.apiBaseUrl}/dashboard/recent-activity`);
  }
}
