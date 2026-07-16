import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TicketApiService } from '../../services/ticket-api.service';
import { ActivatedRoute } from '@angular/router';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { AuthStore } from '../../../../core/auth/stores/auth.store';
import {
  TicketComment,
  TicketHistory,
  TicketDetail,
  UserRecord,
} from '../../../../shared/models/api.models';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TextareaModule,
    MessageModule,
    SelectModule,
    CommonModule,
    ButtonModule,
    CardModule,
    TabsModule,
    TagModule,
  ],
  templateUrl: './ticket-detail-page.component.html',
  styleUrl: './ticket-detail-page.component.css',
})
export class TicketDetailPageComponent implements OnInit{
  private readonly ticketApiService = inject(TicketApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly supportUsers: UserRecord[] = [];
  readonly errorMessage = signal<string | null>(null);
  readonly authStore = inject(AuthStore);
  readonly comments = signal<TicketComment[]>([]);
  readonly history = signal<TicketHistory[]>([]);
  readonly ticket = signal<TicketDetail | null>(null);

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

  ngOnInit(): void {
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
