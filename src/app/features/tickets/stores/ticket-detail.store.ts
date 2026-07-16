import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AddTicketCommentRequest,
  ProblemDetails,
  RequestInformationRequest,
  ResolveTicketRequest,
  TicketComment,
  TicketCommentVisibility,
  TicketDetail,
  TicketHistory,
  TicketVersionRequest,
  UserRecord,
} from '../../../shared/models/api.models';
import { TicketApiService } from '../services/ticket-api.service';
import {
  defaultIfEmpty,
  EMPTY,
  Observable,
  Subject,
  catchError,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { resolveProblemDetailsMessage } from '../../../shared/utils/resolve-problem-details-message';

@Injectable({
  providedIn: 'root',
})
export class TicketDetailStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ticketApiService = inject(TicketApiService);

  private readonly loadRequests$ = new Subject<string>();
  private readonly ticketIdState = signal<string | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly supportUsersState = signal<UserRecord[]>([]);
  private readonly commentsState = signal<TicketComment[]>([]);
  private readonly historyState = signal<TicketHistory[]>([]);
  private readonly ticketState = signal<TicketDetail | null>(null);

  private latestRequestId = 0;

  readonly ticketId = this.ticketIdState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();
  readonly supportUsers = this.supportUsersState.asReadonly();
  readonly comments = this.commentsState.asReadonly();
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

    if (this.supportUsersState().length === 0) {
      this.loadSupportUsers();
    }

    this.loadRequests$.next(ticketId);
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
    this.ticketApiService
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.supportUsersState.set(
            users.filter(
              (user) => user.role === 'SUPPORT_AGENT' || user.role === 'SUPPORT_MANAGER',
            ),
          );
        },
        error: () => {
          this.supportUsersState.set([]);
        },
      });
  }

  private loadTicketBundle(ticketId: string): Observable<void> {
    const requestId = ++this.latestRequestId;

    this.loadingState.set(true);
    this.errorState.set(null);

    return forkJoin({
      ticket: this.ticketApiService.getTicket(ticketId),
      comments: this.ticketApiService.getComments(ticketId),
      history: this.ticketApiService.getHistory(ticketId).pipe(catchError(() => of([]))),
    }).pipe(
      tap(({ ticket, comments, history }) => {
        this.ticketState.set(ticket);
        this.commentsState.set(comments);
        this.historyState.set(history);
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
}
