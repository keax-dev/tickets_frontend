import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketDetail } from '../../../../shared/models/api.models';
import { TicketDetailStore } from '../../stores/ticket-detail.store';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-ticket-detail-header',
  standalone: true,
  imports: [ReactiveFormsModule, MessageModule, ButtonModule, SelectModule],
  templateUrl: './ticket-detail-header.component.html',
  styleUrl: './ticket-detail-header.component.css',
})
export class TicketDetailHeaderComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly assignmentSubmittingState = signal(false);

  private lastSyncedAssignmentKey: string | null = null;

  readonly ticketDetailStore = inject(TicketDetailStore);
  readonly ticket = input.required<TicketDetail>();

  readonly supportUsersLoading = this.ticketDetailStore.supportUsersLoading;
  readonly supportUsersError = this.ticketDetailStore.supportUsersError;
  readonly supportUsers = this.ticketDetailStore.supportUsers;
  readonly assignmentSubmitting = this.assignmentSubmittingState.asReadonly();

  readonly canAssign = computed(() => this.ticket().availableActions.includes('assign'));
  readonly canStart = computed(() => this.ticket().availableActions.includes('start'));
  readonly canClose = computed(() => this.ticket().availableActions.includes('close'));

  readonly showSupportUsersEmptyState = computed(
    () =>
      this.canAssign() &&
      !this.supportUsersLoading() &&
      !this.supportUsersError() &&
      this.supportUsers().length === 0,
  );

  readonly assignmentForm = this.formBuilder.group({
    agentId: this.formBuilder.control<string | null>(null, {
      validators: [Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      const ticket = this.ticket();
      const assignmentKey = `${ticket.id}:${ticket.assignedAgentId ?? 'unassigned'}`;

      if (this.lastSyncedAssignmentKey === assignmentKey) {
        return;
      }

      this.lastSyncedAssignmentKey = assignmentKey;
      this.assignmentForm.patchValue({ agentId: ticket.assignedAgentId ?? null }, { emitEvent: false });
    });

    effect(() => {
      const agentControl = this.assignmentForm.controls.agentId;
      const shouldDisable =
        !this.canAssign() ||
        this.supportUsersLoading() ||
        this.assignmentSubmitting() ||
        this.supportUsers().length === 0;

      if (shouldDisable) {
        agentControl.disable({ emitEvent: false });
        return;
      }

      agentControl.enable({ emitEvent: false });
    });
  }

  assign(): void {
    const agentId = this.assignmentForm.controls.agentId.value;

    if (!agentId || !this.hasSelectedSupportUser()) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    this.assignmentSubmittingState.set(true);

    this.ticketDetailStore
      .assignTicket(agentId)
      .pipe(
        finalize(() => {
          this.assignmentSubmittingState.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  start(): void {
    this.ticketDetailStore.startTicket().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
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
