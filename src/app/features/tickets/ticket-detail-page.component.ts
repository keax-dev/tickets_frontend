import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { AuthStore } from '../../core/auth/auth.store';
import {
  TicketComment,
  TicketDetail,
  TicketHistory,
  UserRecord,
} from '../../shared/models/api.models';
import { TicketApiService } from './ticket-api.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    TabsModule,
    MessageModule,
    TextareaModule,
    SelectModule,
  ],
  template: `
    <section class="page-card page">
      @if (ticket(); as currentTicket) {
        <div class="page-heading">
          <div>
            <h1>{{ currentTicket.code }}</h1>
            <p>{{ currentTicket.title }}</p>
          </div>
          <div class="actions">
            @if (currentTicket.availableActions.includes('assign') && supportUsers.length > 0) {
              <p-select
                [options]="supportUsers"
                optionLabel="email"
                optionValue="id"
                [formControl]="assignmentForm.controls.agentId"
              ></p-select>
              <button
                pButton
                type="button"
                label="Asignar"
                severity="secondary"
                (click)="assign()"
              ></button>
            }
            @if (currentTicket.availableActions.includes('start')) {
              <button pButton type="button" label="Iniciar" (click)="start()"></button>
            }
            @if (currentTicket.availableActions.includes('close')) {
              <button
                pButton
                type="button"
                label="Cerrar"
                severity="secondary"
                (click)="close()"
              ></button>
            }
          </div>
        </div>

        <div class="summary-grid">
          <p-card header="Estado"><p-tag [value]="currentTicket.status"></p-tag></p-card>
          <p-card header="Prioridad"><p-tag [value]="currentTicket.priority"></p-tag></p-card>
          <p-card header="Solicitante">{{ currentTicket.requesterName ?? 'Sin dato' }}</p-card>
          <p-card header="Agente">{{ currentTicket.assignedAgentName ?? 'Sin asignar' }}</p-card>
        </div>

        @if (errorMessage()) {
          <p-message severity="error" [text]="errorMessage() ?? ''"></p-message>
        }

        <p-tabs value="comments">
          <p-tablist>
            <p-tab value="comments">Comentarios</p-tab>
            <p-tab value="history">Historial</p-tab>
            <p-tab value="details">Detalle</p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel value="comments">
              <form class="comment-form" [formGroup]="commentForm" (ngSubmit)="addComment()">
                <textarea
                  pTextarea
                  formControlName="content"
                  rows="4"
                  placeholder="Escribe un comentario"
                ></textarea>
                <p-select
                  formControlName="visibility"
                  [options]="visibilityOptions"
                  optionLabel="label"
                  optionValue="value"
                ></p-select>
                <div class="actions">
                  <button pButton type="submit" label="Agregar comentario"></button>
                </div>
              </form>

              <div class="comment-list">
                @for (comment of comments(); track comment.id) {
                  <div
                    class="comment-item"
                    [class.comment-item-internal]="comment.visibility === 'INTERNAL'"
                  >
                    <strong>{{ comment.authorName ?? 'Usuario' }}</strong>
                    <small>{{ comment.createdAt | date: 'short' }}</small>
                    <p>{{ comment.content }}</p>
                  </div>
                }
              </div>
            </p-tabpanel>

            <p-tabpanel value="history">
              <div class="comment-list">
                @for (entry of history(); track entry.id) {
                  <div class="comment-item">
                    <strong>{{ entry.action }}</strong>
                    <small
                      >{{ entry.performedByName ?? 'Sistema' }} |
                      {{ entry.createdAt | date: 'short' }}</small
                    >
                  </div>
                }
              </div>
            </p-tabpanel>

            <p-tabpanel value="details">
              <p>{{ currentTicket.description }}</p>
              @if (currentTicket.resolutionSummary) {
                <h3>Resumen de solucion</h3>
                <p>{{ currentTicket.resolutionSummary }}</p>
              }

              @if (currentTicket.availableActions.includes('request-information')) {
                <form
                  class="comment-form"
                  [formGroup]="requestInformationForm"
                  (ngSubmit)="requestInformation()"
                >
                  <textarea
                    pTextarea
                    formControlName="content"
                    rows="3"
                    placeholder="Que informacion falta"
                  ></textarea>
                  <button
                    pButton
                    type="submit"
                    label="Solicitar informacion"
                    severity="secondary"
                  ></button>
                </form>
              }

              @if (currentTicket.availableActions.includes('resolve')) {
                <form class="comment-form" [formGroup]="resolveForm" (ngSubmit)="resolve()">
                  <textarea
                    pTextarea
                    formControlName="resolutionSummary"
                    rows="4"
                    placeholder="Resumen de solucion"
                  ></textarea>
                  <button pButton type="submit" label="Resolver ticket"></button>
                </form>
              }
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      } @else {
        <p>Cargando ticket...</p>
      }
    </section>
  `,
  styles: [
    `
      .page {
        padding: 1.5rem;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .comment-form,
      .comment-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .comment-item {
        padding: 1rem;
        border-radius: 18px;
        border: 1px solid var(--app-border);
        background: color-mix(in srgb, var(--app-surface-soft) 75%, transparent);
      }

      .comment-item-internal {
        border-style: dashed;
      }

      .comment-item p,
      .comment-item strong,
      .comment-item small {
        display: block;
      }

      .comment-item p {
        margin: 0.5rem 0 0;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      @media (max-width: 960px) {
        .summary-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TicketDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketApiService = inject(TicketApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly authStore = inject(AuthStore);
  readonly ticket = signal<TicketDetail | null>(null);
  readonly comments = signal<TicketComment[]>([]);
  readonly history = signal<TicketHistory[]>([]);
  readonly supportUsers: UserRecord[] = [];
  readonly errorMessage = signal<string | null>(null);

  readonly assignmentForm = this.formBuilder.group({
    agentId: this.formBuilder.control<string | null>(null, {
      validators: [Validators.required],
    }),
  });

  readonly commentForm = this.formBuilder.nonNullable.group({
    content: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required],
    }),
    visibility: this.formBuilder.nonNullable.control<'PUBLIC' | 'INTERNAL'>('PUBLIC'),
  });

  readonly requestInformationForm = this.formBuilder.nonNullable.group({
    content: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required],
    }),
  });

  readonly resolveForm = this.formBuilder.nonNullable.group({
    resolutionSummary: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required],
    }),
  });

  readonly visibilityOptions = [
    { label: 'Publico', value: 'PUBLIC' as const },
    { label: 'Interno', value: 'INTERNAL' as const },
  ];

  constructor() {
    const ticketId = this.route.snapshot.paramMap.get('ticketId');
    if (!ticketId) {
      return;
    }

    this.ticketApiService.getUsers().subscribe((users) => {
      this.supportUsers.splice(
        0,
        this.supportUsers.length,
        ...users.filter((user) => user.role === 'SUPPORT_AGENT' || user.role === 'SUPPORT_MANAGER'),
      );
    });

    this.load(ticketId);
  }

  addComment(): void {
    const currentTicket = this.ticket();
    if (!currentTicket || this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.ticketApiService
      .addComment(currentTicket.id, {
        version: currentTicket.version,
        ...this.commentForm.getRawValue(),
      })
      .subscribe({
        next: () => {
          this.commentForm.reset({ content: '', visibility: 'PUBLIC' });
          this.load(currentTicket.id);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.detail ?? 'No fue posible agregar el comentario.');
        },
      });
  }

  assign(): void {
    const currentTicket = this.ticket();
    const agentId = this.assignmentForm.controls.agentId.value;
    if (!currentTicket || !agentId) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    this.ticketApiService
      .assignTicket(currentTicket.id, { version: currentTicket.version, agentId })
      .subscribe({
        next: () => {
          this.load(currentTicket.id);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.detail ?? 'No fue posible asignar el ticket.');
        },
      });
  }

  start(): void {
    const currentTicket = this.ticket();
    if (!currentTicket) {
      return;
    }

    this.ticketApiService.startTicket(currentTicket.id, currentTicket.version).subscribe({
      next: () => this.load(currentTicket.id),
      error: (error) => {
        this.errorMessage.set(error?.error?.detail ?? 'No fue posible iniciar el ticket.');
      },
    });
  }

  requestInformation(): void {
    const currentTicket = this.ticket();
    if (!currentTicket || this.requestInformationForm.invalid) {
      this.requestInformationForm.markAllAsTouched();
      return;
    }

    this.ticketApiService
      .requestInformation(currentTicket.id, {
        version: currentTicket.version,
        content: this.requestInformationForm.getRawValue().content,
      })
      .subscribe({
        next: () => {
          this.requestInformationForm.reset({ content: '' });
          this.load(currentTicket.id);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.detail ?? 'No fue posible solicitar informacion.');
        },
      });
  }

  resolve(): void {
    const currentTicket = this.ticket();
    if (!currentTicket || this.resolveForm.invalid) {
      this.resolveForm.markAllAsTouched();
      return;
    }

    this.ticketApiService
      .resolveTicket(currentTicket.id, {
        version: currentTicket.version,
        resolutionSummary: this.resolveForm.getRawValue().resolutionSummary,
      })
      .subscribe({
        next: () => {
          this.resolveForm.reset({ resolutionSummary: '' });
          this.load(currentTicket.id);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.detail ?? 'No fue posible resolver el ticket.');
        },
      });
  }

  close(): void {
    const currentTicket = this.ticket();
    if (!currentTicket) {
      return;
    }

    this.ticketApiService.closeTicket(currentTicket.id, currentTicket.version).subscribe({
      next: () => this.load(currentTicket.id),
      error: (error) => {
        this.errorMessage.set(error?.error?.detail ?? 'No fue posible cerrar el ticket.');
      },
    });
  }

  private load(ticketId: string): void {
    this.errorMessage.set(null);

    this.ticketApiService.getTicket(ticketId).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        this.assignmentForm.patchValue({ agentId: ticket.assignedAgentId }, { emitEvent: false });
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.detail ?? 'No fue posible cargar el ticket.');
      },
    });

    this.ticketApiService
      .getComments(ticketId)
      .subscribe((comments) => this.comments.set(comments));
    this.ticketApiService.getHistory(ticketId).subscribe({
      next: (history) => this.history.set(history),
      error: () => this.history.set([]),
    });
  }
}
