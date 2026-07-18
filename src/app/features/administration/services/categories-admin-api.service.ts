import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../../core/config/tokens/api-base-url.token';
import {
  ActivationChangeRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class CategoriesAdminApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listCategories() {
    return this.httpClient.get<Category[]>(`${this.apiBaseUrl}/categories`);
  }

  createCategory(payload: CreateCategoryRequest) {
    return this.httpClient.post<Category>(`${this.apiBaseUrl}/categories`, payload);
  }

  updateCategory(categoryId: string, payload: UpdateCategoryRequest) {
    return this.httpClient.put<Category>(`${this.apiBaseUrl}/categories/${categoryId}`, payload);
  }

  updateCategoryStatus(categoryId: string, payload: ActivationChangeRequest) {
    return this.httpClient.patch<Category>(
      `${this.apiBaseUrl}/categories/${categoryId}/status`,
      payload,
    );
  }
}
