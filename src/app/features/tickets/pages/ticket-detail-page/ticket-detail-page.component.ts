import { DestroyRef, Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TicketDetailStore } from '../../stores/ticket-detail.store';
import { TicketCommentVisibility } from '../../../../shared/models/api.models';

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
  providers: [TicketDetailStore],
  templateUrl: './ticket-detail-page.component.html',
  styleUrl: './ticket-detail-page.component.css',
})
export class TicketDetailPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly ticketDetailStore = inject(TicketDetailStore);
  readonly ticketId = toSignal(
    this.route.paramMap.pipe(map((paramMap) => paramMap.get('ticketId'))),
    {
      initialValue: null,
    },
  );
  readonly supportUsers = this.ticketDetailStore.supportUsers;
  readonly errorMessage = this.ticketDetailStore.errorMessage;
  readonly comments = this.ticketDetailStore.comments;
  readonly history = this.ticketDetailStore.history;
  readonly ticket = this.ticketDetailStore.ticket;
  readonly currentTicket = computed(() => {
    const ticket = this.ticket();
    const ticketId = this.ticketId();

    return ticket && ticket.id === ticketId ? ticket : null;
  });
  readonly loading = this.ticketDetailStore.loading;

  readonly assignmentForm = this.formBuilder.group({
    agentId: this.formBuilder.control<string | null>(null, {
      validators: [Validators.required],
    }),
  });

  readonly commentForm = this.formBuilder.nonNullable.group({
    content: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required],
    }),
    visibility: this.formBuilder.nonNullable.control<TicketCommentVisibility>('PUBLIC'),
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
    effect(() => {
      const ticketId = this.ticketId();

      if (ticketId) {
        this.ticketDetailStore.initialize(ticketId);
      }
    });

    effect(() => {
      this.assignmentForm.patchValue(
        { agentId: this.currentTicket()?.assignedAgentId ?? null },
        { emitEvent: false },
      );
    });
  }

  addComment(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const rawValue = this.commentForm.getRawValue();

    this.ticketDetailStore
      .addComment(rawValue.content, rawValue.visibility)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((succeeded) => {
        if (succeeded) {
          this.commentForm.reset({ content: '', visibility: 'PUBLIC' });
        }
      });
  }

  assign(): void {
    const agentId = this.assignmentForm.controls.agentId.value;

    if (!agentId) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    this.ticketDetailStore
      .assignTicket(agentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  start(): void {
    this.ticketDetailStore.startTicket().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  requestInformation(): void {
    if (this.requestInformationForm.invalid) {
      this.requestInformationForm.markAllAsTouched();
      return;
    }

    this.ticketDetailStore
      .requestInformation(this.requestInformationForm.getRawValue().content)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((succeeded) => {
        if (succeeded) {
          this.requestInformationForm.reset({ content: '' });
        }
      });
  }

  resolve(): void {
    if (this.resolveForm.invalid) {
      this.resolveForm.markAllAsTouched();
      return;
    }

    this.ticketDetailStore
      .resolveTicket(this.resolveForm.getRawValue().resolutionSummary)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((succeeded) => {
        if (succeeded) {
          this.resolveForm.reset({ resolutionSummary: '' });
        }
      });
  }

  close(): void {
    this.ticketDetailStore.closeTicket().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
