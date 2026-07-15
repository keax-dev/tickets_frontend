import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Category,
  PageResponse,
  TicketComment,
  TicketDetail,
  TicketHistory,
  TicketPriority,
  TicketStatus,
  TicketSummary,
  UserRecord,
} from '../../shared/models/api.models';
import { API_BASE_URL } from '../../core/config/api-base-url.token';

@Injectable({
  providedIn: 'root',
})
export class TicketApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listTickets(filters: {
    search?: string;
    status?: TicketStatus | null;
    priority?: TicketPriority | null;
    categoryId?: string | null;
    assignedAgentId?: string | null;
    page: number;
    size: number;
  }) {
    let params = new HttpParams()
      .set('page', filters.page)
      .set('size', filters.size)
      .set('sortBy', 'createdAt')
      .set('direction', 'DESC');

    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.priority) {
      params = params.set('priority', filters.priority);
    }
    if (filters.categoryId) {
      params = params.set('categoryId', filters.categoryId);
    }
    if (filters.assignedAgentId) {
      params = params.set('assignedAgentId', filters.assignedAgentId);
    }

    return this.httpClient.get<PageResponse<TicketSummary>>(`${this.apiBaseUrl}/tickets`, {
      params,
    });
  }

  createTicket(payload: {
    title: string;
    description: string;
    categoryId: string;
    priority: TicketPriority;
  }) {
    return this.httpClient.post<TicketDetail>(`${this.apiBaseUrl}/tickets`, payload, {
      headers: {
        'Idempotency-Key': crypto.randomUUID(),
      },
    });
  }

  getTicket(ticketId: string) {
    return this.httpClient.get<TicketDetail>(`${this.apiBaseUrl}/tickets/${ticketId}`);
  }

  updateTicket(ticketId: string, payload: Record<string, unknown>) {
    return this.httpClient.patch<TicketDetail>(`${this.apiBaseUrl}/tickets/${ticketId}`, payload);
  }

  assignTicket(ticketId: string, payload: { version: number; agentId: string }) {
    return this.httpClient.post<TicketDetail>(
      `${this.apiBaseUrl}/tickets/${ticketId}/assign`,
      payload,
    );
  }

  startTicket(ticketId: string, version: number) {
    return this.httpClient.post<TicketDetail>(`${this.apiBaseUrl}/tickets/${ticketId}/start`, {
      version,
    });
  }

  requestInformation(ticketId: string, payload: { version: number; content: string }) {
    return this.httpClient.post<TicketDetail>(
      `${this.apiBaseUrl}/tickets/${ticketId}/request-information`,
      payload,
    );
  }

  resolveTicket(ticketId: string, payload: { version: number; resolutionSummary: string }) {
    return this.httpClient.post<TicketDetail>(
      `${this.apiBaseUrl}/tickets/${ticketId}/resolve`,
      payload,
    );
  }

  closeTicket(ticketId: string, version: number) {
    return this.httpClient.post<TicketDetail>(`${this.apiBaseUrl}/tickets/${ticketId}/close`, {
      version,
    });
  }

  reopenTicket(ticketId: string, payload: { version: number; reason: string }) {
    return this.httpClient.post<TicketDetail>(
      `${this.apiBaseUrl}/tickets/${ticketId}/reopen`,
      payload,
    );
  }

  cancelTicket(ticketId: string, payload: { version: number; reason: string }) {
    return this.httpClient.post<TicketDetail>(
      `${this.apiBaseUrl}/tickets/${ticketId}/cancel`,
      payload,
    );
  }

  getComments(ticketId: string) {
    return this.httpClient.get<TicketComment[]>(`${this.apiBaseUrl}/tickets/${ticketId}/comments`);
  }

  addComment(
    ticketId: string,
    payload: { version: number; content: string; visibility: 'PUBLIC' | 'INTERNAL' },
  ) {
    return this.httpClient.post<TicketComment>(
      `${this.apiBaseUrl}/tickets/${ticketId}/comments`,
      payload,
    );
  }

  getHistory(ticketId: string) {
    return this.httpClient.get<TicketHistory[]>(`${this.apiBaseUrl}/tickets/${ticketId}/history`);
  }

  getCategories() {
    return this.httpClient.get<Category[]>(`${this.apiBaseUrl}/categories`);
  }

  getUsers() {
    return this.httpClient.get<UserRecord[]>(`${this.apiBaseUrl}/users`);
  }
}
