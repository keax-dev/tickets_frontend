import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../../core/config/tokens/api-base-url.token';
import {
  AddTicketCommentRequest,
  AssignTicketRequest,
  CancelTicketRequest,
  TicketComment,
  TicketHistory,
  TicketSummary,
  TicketDetail,
  CreateTicketRequest,
  PageResponse,
  ReopenTicketRequest,
  RequestInformationRequest,
  ResolveTicketRequest,
  TicketListFilters,
  TicketVersionRequest,
  UpdateTicketRequest,
  UserRecord,
  Category,
} from '../../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class TicketApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listTickets(filters: TicketListFilters) {
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

  createTicket(payload: CreateTicketRequest) {
    return this.httpClient.post<TicketDetail>(`${this.apiBaseUrl}/tickets`, payload, {
      headers: {
        'Idempotency-Key': crypto.randomUUID(),
      },
    });
  }

  getTicket(ticketId: string) {
    return this.httpClient.get<TicketDetail>(`${this.apiBaseUrl}/tickets/${ticketId}`);
  }

  updateTicket(ticketId: string, payload: UpdateTicketRequest) {
    return this.httpClient.patch<TicketDetail>(`${this.apiBaseUrl}/tickets/${ticketId}`, payload);
  }

  assignTicket(ticketId: string, payload: AssignTicketRequest) {
    return this.httpClient.post<TicketDetail>(
      `${this.apiBaseUrl}/tickets/${ticketId}/assign`,
      payload,
    );
  }

  startTicket(ticketId: string, payload: TicketVersionRequest) {
    return this.httpClient.post<TicketDetail>(
      `${this.apiBaseUrl}/tickets/${ticketId}/start`,
      payload,
    );
  }

  requestInformation(ticketId: string, payload: RequestInformationRequest) {
    return this.httpClient.post<TicketDetail>(
      `${this.apiBaseUrl}/tickets/${ticketId}/request-information`,
      payload,
    );
  }

  resolveTicket(ticketId: string, payload: ResolveTicketRequest) {
    return this.httpClient.post<TicketDetail>(
      `${this.apiBaseUrl}/tickets/${ticketId}/resolve`,
      payload,
    );
  }

  closeTicket(ticketId: string, payload: TicketVersionRequest) {
    return this.httpClient.post<TicketDetail>(
      `${this.apiBaseUrl}/tickets/${ticketId}/close`,
      payload,
    );
  }

  reopenTicket(ticketId: string, payload: ReopenTicketRequest) {
    return this.httpClient.post<TicketDetail>(
      `${this.apiBaseUrl}/tickets/${ticketId}/reopen`,
      payload,
    );
  }

  cancelTicket(ticketId: string, payload: CancelTicketRequest) {
    return this.httpClient.post<TicketDetail>(
      `${this.apiBaseUrl}/tickets/${ticketId}/cancel`,
      payload,
    );
  }

  getComments(ticketId: string) {
    return this.httpClient.get<TicketComment[]>(`${this.apiBaseUrl}/tickets/${ticketId}/comments`);
  }

  addComment(ticketId: string, payload: AddTicketCommentRequest) {
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
