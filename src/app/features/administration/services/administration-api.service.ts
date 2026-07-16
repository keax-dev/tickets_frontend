import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../../core/config/tokens/api-base-url.token';
import { HttpClient } from '@angular/common/http';
import {
  ActivationChangeRequest,
  CreateCategoryRequest,
  CreateUserRequest,
  TicketPriority,
  UpdateCategoryRequest,
  UpdateSlaPolicyRequest,
  UpdateUserRequest,
  UserRecord,
  SlaPolicy,
  Category,
} from '../../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class AdministrationApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listUsers() {
    return this.httpClient.get<UserRecord[]>(`${this.apiBaseUrl}/users`);
  }

  createUser(payload: CreateUserRequest) {
    return this.httpClient.post<UserRecord>(`${this.apiBaseUrl}/users`, payload);
  }

  updateUser(userId: string, payload: UpdateUserRequest) {
    return this.httpClient.put<UserRecord>(`${this.apiBaseUrl}/users/${userId}`, payload);
  }

  updateUserStatus(userId: string, active: boolean) {
    const payload: ActivationChangeRequest = { active };

    return this.httpClient.patch<UserRecord>(`${this.apiBaseUrl}/users/${userId}/status`, payload);
  }

  listCategories() {
    return this.httpClient.get<Category[]>(`${this.apiBaseUrl}/categories`);
  }

  createCategory(payload: CreateCategoryRequest) {
    return this.httpClient.post<Category>(`${this.apiBaseUrl}/categories`, payload);
  }

  updateCategory(categoryId: string, payload: UpdateCategoryRequest) {
    return this.httpClient.put<Category>(`${this.apiBaseUrl}/categories/${categoryId}`, payload);
  }

  updateCategoryStatus(categoryId: string, active: boolean) {
    const payload: ActivationChangeRequest = { active };

    return this.httpClient.patch<Category>(
      `${this.apiBaseUrl}/categories/${categoryId}/status`,
      payload,
    );
  }

  listSlaPolicies() {
    return this.httpClient.get<SlaPolicy[]>(`${this.apiBaseUrl}/sla-policies`);
  }

  updateSlaPolicy(priority: TicketPriority, payload: UpdateSlaPolicyRequest) {
    return this.httpClient.put<SlaPolicy>(`${this.apiBaseUrl}/sla-policies/${priority}`, payload);
  }
}
