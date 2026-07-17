import { DestroyRef, Component, computed, effect, inject, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TicketCommentVisibility } from '../../../../shared/models/api.models';
import { TicketDetailStore } from '../../stores/ticket-detail.store';
import { TextareaModule } from 'primeng/textarea';
import { ActivatedRoute } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { AuthStore } from '../../../../core/auth/stores/auth.store';
import { map } from 'rxjs';

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
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);

  readonly ticketDetailStore = inject(TicketDetailStore);
  readonly ticketId = toSignal(
    this.route.paramMap.pipe(map((paramMap) => paramMap.get('ticketId'))),
    {
      initialValue: null,
    },
  );
  readonly supportUsersLoading = this.ticketDetailStore.supportUsersLoading;
  readonly supportUsersError = this.ticketDetailStore.supportUsersError;
  readonly supportUsers = this.ticketDetailStore.supportUsers;
  readonly errorMessage = this.ticketDetailStore.errorMessage;
  readonly comments = this.ticketDetailStore.comments;
  readonly history = this.ticketDetailStore.history;
  readonly ticket = this.ticketDetailStore.ticket;

  readonly canCreateInternalComments = computed(() =>
    this.authStore.hasPermission('COMMENT_CREATE_INTERNAL'),
  );

  readonly canReadInternalComments = computed(() =>
    this.authStore.hasPermission('COMMENT_READ_INTERNAL'),
  );

  readonly canReadHistory = computed(() => this.authStore.hasPermission('AUDIT_READ'));

  readonly visibleComments = computed(() =>
    this.canReadInternalComments()
      ? this.comments()
      : this.comments().filter((comment) => comment.visibility === 'PUBLIC'),
  );

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

  readonly visibilityOptions = computed(() => {
    const options: Array<{ label: string; value: TicketCommentVisibility }> = [
      { label: 'Publico', value: 'PUBLIC' },
    ];

    if (this.canCreateInternalComments()) {
      options.push({ label: 'Interno', value: 'INTERNAL' });
    }

    return options;
  });

  constructor() {
    effect(() => {
      const ticketId = this.ticketId();

      if (ticketId) {
        untracked(() => {
          this.ticketDetailStore.initialize(ticketId);
        });
      }
    });

    effect(() => {
      const ticketId = this.ticketId();

      if (!ticketId) {
        return;
      }

      this.assignmentForm.reset({ agentId: null }, { emitEvent: false });
      this.commentForm.reset({ content: '', visibility: 'PUBLIC' });
      this.requestInformationForm.reset({ content: '' });
      this.resolveForm.reset({ resolutionSummary: '' });
    });

    effect(() => {
      this.assignmentForm.patchValue(
        { agentId: this.currentTicket()?.assignedAgentId ?? null },
        { emitEvent: false },
      );
    });

    effect(() => {
      const agentControl = this.assignmentForm.controls.agentId;
      const shouldDisable = this.supportUsersLoading() || this.supportUsers().length === 0;

      if (shouldDisable) {
        agentControl.disable({ emitEvent: false });
        return;
      }

      agentControl.enable({ emitEvent: false });
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

    if (!agentId || !this.hasSelectedSupportUser()) {
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

  reloadSupportUsers(): void {
    this.ticketDetailStore.reloadSupportUsers();
  }

  hasSelectedSupportUser(): boolean {
    const agentId = this.assignmentForm.controls.agentId.value;

    return !!agentId && this.supportUsers().some((user) => user.id === agentId);
  }
}
