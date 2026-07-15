import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../core/config/api-base-url.token';
import {
  AppRole,
  Category,
  SlaPolicy,
  TicketPriority,
  UserRecord,
} from '../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class AdministrationApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listUsers() {
    return this.httpClient.get<UserRecord[]>(`${this.apiBaseUrl}/users`);
  }

  createUser(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: AppRole;
  }) {
    return this.httpClient.post<UserRecord>(`${this.apiBaseUrl}/users`, payload);
  }

  updateUser(
    userId: string,
    payload: {
      firstName: string;
      lastName: string;
      email: string;
      role: AppRole;
    },
  ) {
    return this.httpClient.put<UserRecord>(`${this.apiBaseUrl}/users/${userId}`, payload);
  }

  updateUserStatus(userId: string, active: boolean) {
    return this.httpClient.patch<UserRecord>(`${this.apiBaseUrl}/users/${userId}/status`, {
      active,
    });
  }

  listCategories() {
    return this.httpClient.get<Category[]>(`${this.apiBaseUrl}/categories`);
  }

  createCategory(payload: { name: string; description: string | null }) {
    return this.httpClient.post<Category>(`${this.apiBaseUrl}/categories`, payload);
  }

  updateCategory(categoryId: string, payload: { name: string; description: string | null }) {
    return this.httpClient.put<Category>(`${this.apiBaseUrl}/categories/${categoryId}`, payload);
  }

  updateCategoryStatus(categoryId: string, active: boolean) {
    return this.httpClient.patch<Category>(`${this.apiBaseUrl}/categories/${categoryId}/status`, {
      active,
    });
  }

  listSlaPolicies() {
    return this.httpClient.get<SlaPolicy[]>(`${this.apiBaseUrl}/sla-policies`);
  }

  updateSlaPolicy(
    priority: TicketPriority,
    payload: {
      firstResponseHours: number;
      resolutionHours: number;
      active: boolean;
    },
  ) {
    return this.httpClient.put<SlaPolicy>(`${this.apiBaseUrl}/sla-policies/${priority}`, payload);
  }
}
