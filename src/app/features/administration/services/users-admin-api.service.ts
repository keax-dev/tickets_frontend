import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../../core/config/tokens/api-base-url.token';
import {
  ActivationChangeRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UserRecord,
} from '../../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class UsersAdminApiService {
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

  updateUserStatus(userId: string, payload: ActivationChangeRequest) {
    return this.httpClient.patch<UserRecord>(`${this.apiBaseUrl}/users/${userId}/status`, payload);
  }
}
