import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { resolveProblemDetailsMessage } from '../../../shared/utils/resolve-problem-details-message';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketApiService } from '../services/ticket-api.service';
import { AuthStore } from '../../../core/auth/stores/auth.store';
import {
  RequestInformationRequest,
  TicketCommentVisibility,
  AddTicketCommentRequest,
  ResolveTicketRequest,
  TicketVersionRequest,
  ProblemDetails,
  TicketComment,
  TicketHistory,
  TicketDetail,
  UserRecord,
} from '../../../shared/models/api.models';
import {
  defaultIfEmpty,
  Observable,
  catchError,
  switchMap,
  finalize,
  forkJoin,
  Subject,
  EMPTY,
  tap,
  map,
  of,
} from 'rxjs';

@Injectable()
export class TicketDetailStore {
  private readonly ticketApiService = inject(TicketApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authStore = inject(AuthStore);

  private readonly supportUsersState = signal<UserRecord[]>([]);
  private readonly supportUsersLoadingState = signal(false);
  private readonly supportUsersLoadedState = signal(false);
  private readonly supportUsersErrorState = signal<string | null>(null);
  private readonly historyErrorState = signal<string | null>(null);
  private readonly ticketIdState = signal<string | null>(null);
  private readonly loadRequests$ = new Subject<string>();
  private readonly commentsState = signal<TicketComment[]>([]);
  private readonly loadingState = signal(false);
  private readonly historyState = signal<TicketHistory[]>([]);
  private readonly ticketState = signal<TicketDetail | null>(null);
  private readonly errorState = signal<string | null>(null);

  private latestRequestId = 0;

  readonly supportUsers = this.supportUsersState.asReadonly();
  readonly supportUsersLoading = this.supportUsersLoadingState.asReadonly();
  readonly supportUsersError = this.supportUsersErrorState.asReadonly();
  readonly historyError = this.historyErrorState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();
  readonly comments = this.commentsState.asReadonly();
  readonly ticketId = this.ticketIdState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly history = this.historyState.asReadonly();
  readonly ticket = this.ticketState.asReadonly();

  constructor() {
    this.loadRequests$
      .pipe(
        switchMap((ticketId) => this.loadTicketBundle(ticketId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  initialize(ticketId: string): void {
    this.ticketIdState.set(ticketId);
    this.loadRequests$.next(ticketId);
  }

  reloadSupportUsers(): void {
    this.loadSupportUsers();
  }

  addComment(content: string, visibility: TicketCommentVisibility): Observable<boolean> {
    return this.runTicketMutation((ticket) => {
      const payload: AddTicketCommentRequest = {
        version: ticket.version,
        content,
        visibility,
      };

      return this.ticketApiService.addComment(ticket.id, payload);
    }, 'No fue posible agregar el comentario.');
  }

  assignTicket(agentId: string): Observable<boolean> {
    return this.runTicketMutation(
      (ticket) =>
        this.ticketApiService.assignTicket(ticket.id, { version: ticket.version, agentId }),
      'No fue posible asignar el ticket.',
    );
  }

  startTicket(): Observable<boolean> {
    return this.runTicketMutation((ticket) => {
      const payload: TicketVersionRequest = { version: ticket.version };

      return this.ticketApiService.startTicket(ticket.id, payload);
    }, 'No fue posible iniciar el ticket.');
  }

  requestInformation(content: string): Observable<boolean> {
    return this.runTicketMutation((ticket) => {
      const payload: RequestInformationRequest = {
        version: ticket.version,
        content,
      };

      return this.ticketApiService.requestInformation(ticket.id, payload);
    }, 'No fue posible solicitar informacion.');
  }

  resolveTicket(resolutionSummary: string): Observable<boolean> {
    return this.runTicketMutation((ticket) => {
      const payload: ResolveTicketRequest = {
        version: ticket.version,
        resolutionSummary,
      };

      return this.ticketApiService.resolveTicket(ticket.id, payload);
    }, 'No fue posible resolver el ticket.');
  }

  closeTicket(): Observable<boolean> {
    return this.runTicketMutation((ticket) => {
      const payload: TicketVersionRequest = { version: ticket.version };

      return this.ticketApiService.closeTicket(ticket.id, payload);
    }, 'No fue posible cerrar el ticket.');
  }

  private loadSupportUsers(): void {
    this.supportUsersLoadingState.set(true);
    this.supportUsersErrorState.set(null);

    this.ticketApiService
      .getUsers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.supportUsersLoadingState.set(false);
        }),
      )
      .subscribe({
        next: (users) => {
          this.supportUsersLoadedState.set(true);
          this.supportUsersState.set(
            users.filter(
              (user) =>
                user.active &&
                (user.role === 'SUPPORT_AGENT' || user.role === 'SUPPORT_MANAGER'),
            ),
          );
        },
        error: (error: ProblemDetails) => {
          this.supportUsersLoadedState.set(false);
          this.supportUsersState.set([]);
          this.supportUsersErrorState.set(
            resolveProblemDetailsMessage(error, 'No fue posible cargar los agentes disponibles.'),
          );
        },
      });
  }

  private loadTicketBundle(ticketId: string): Observable<void> {
    const requestId = ++this.latestRequestId;
    const canReadHistory = this.authStore.hasPermission('AUDIT_READ');

    this.loadingState.set(true);
    this.errorState.set(null);
    this.historyErrorState.set(null);

    return forkJoin({
      ticket: this.ticketApiService.getTicket(ticketId),
      comments: this.ticketApiService.getComments(ticketId),
      history: this.loadHistory(ticketId, canReadHistory),
    }).pipe(
      tap(({ ticket, comments, history }) => {
        this.ticketState.set(ticket);
        this.commentsState.set(comments);
        this.historyState.set(history);

        if (
          ticket.availableActions.includes('assign') &&
          !this.supportUsersLoadedState() &&
          !this.supportUsersLoadingState()
        ) {
          this.reloadSupportUsers();
        }
      }),
      map(() => void 0),
      catchError((error: ProblemDetails) => {
        this.errorState.set(
          resolveProblemDetailsMessage(error, 'No fue posible cargar el ticket.'),
        );
        return EMPTY;
      }),
      finalize(() => {
        if (this.latestRequestId === requestId) {
          this.loadingState.set(false);
        }
      }),
    );
  }

  private runTicketMutation(
    requestFactory: (ticket: TicketDetail) => Observable<unknown>,
    fallbackMessage: string,
  ): Observable<boolean> {
    const currentTicket = this.ticketState();

    if (!currentTicket) {
      this.errorState.set('No hay un ticket cargado para ejecutar esta accion.');
      return of(false);
    }

    this.errorState.set(null);

    return requestFactory(currentTicket).pipe(
      switchMap(() =>
        this.loadTicketBundle(currentTicket.id).pipe(
          map(() => true),
          defaultIfEmpty(false),
        ),
      ),
      catchError((error: ProblemDetails) => {
        this.errorState.set(resolveProblemDetailsMessage(error, fallbackMessage));
        return of(false);
      }),
    );
  }

  private loadHistory(ticketId: string, canReadHistory: boolean): Observable<TicketHistory[]> {
    if (!canReadHistory) {
      return of([]);
    }

    return this.ticketApiService.getHistory(ticketId).pipe(
      catchError((error: ProblemDetails) => {
        this.historyErrorState.set(
          resolveProblemDetailsMessage(error, 'No fue posible cargar el historial del ticket.'),
        );
        return of([]);
      }),
    );
  }
}
