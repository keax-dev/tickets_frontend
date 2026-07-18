import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../../core/config/tokens/api-base-url.token';
import {
  SlaPolicy,
  TicketPriority,
  UpdateSlaPolicyRequest,
} from '../../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class SlaAdminApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listSlaPolicies() {
    return this.httpClient.get<SlaPolicy[]>(`${this.apiBaseUrl}/sla-policies`);
  }

  updateSlaPolicy(priority: TicketPriority, payload: UpdateSlaPolicyRequest) {
    return this.httpClient.put<SlaPolicy>(`${this.apiBaseUrl}/sla-policies/${priority}`, payload);
  }
}
