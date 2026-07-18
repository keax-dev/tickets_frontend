import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SlaPolicy, TicketPriority } from '../../../../shared/models/api.models';
import {
  ACTIVE_STATE_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
  getActiveStateLabel,
  getTicketPriorityLabel,
  getTicketPriorityTagSeverity,
} from '../../../../shared/constants/ui.constants';
import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SlaPageStore } from '../../stores/sla-page.store';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    CommonModule,
    ButtonModule,
    SelectModule,
    TableModule,
    CardModule,
    TagModule,
  ],
  providers: [SlaPageStore],
  templateUrl: './sla-page.component.html',
  styleUrl: './sla-page.component.css',
})
export class SlaPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly slaPageStore = inject(SlaPageStore);
  private readonly formBuilder = inject(FormBuilder);

  readonly validationErrorMessage = signal<string | null>(null);
  readonly errorMessage = computed(
    () => this.validationErrorMessage() ?? this.slaPageStore.errorMessage(),
  );
  readonly policies = this.slaPageStore.policies;
  readonly loading = this.slaPageStore.loading;
  readonly saving = this.slaPageStore.saving;

  readonly priorityOptions = TICKET_PRIORITY_OPTIONS;

  readonly activeOptions = ACTIVE_STATE_OPTIONS;

  readonly slaForm = this.formBuilder.nonNullable.group({
    priority: this.formBuilder.nonNullable.control<TicketPriority>('URGENT', {
      validators: [Validators.required],
    }),
    firstResponseHours: this.formBuilder.nonNullable.control(1, {
      validators: [Validators.required, Validators.min(1)],
    }),
    resolutionHours: this.formBuilder.nonNullable.control(1, {
      validators: [Validators.required, Validators.min(1)],
    }),
    active: this.formBuilder.nonNullable.control(true, { validators: [Validators.required] }),
  });

  constructor() {
    effect(() => {
      const policies = this.policies();

      if (policies.length === 0) {
        return;
      }

      const currentPriority = untracked(() => this.slaForm.controls.priority.getRawValue());
      const activePolicy =
        policies.find((policy) => policy.priority === currentPriority) ?? policies[0];

      untracked(() => this.patchForm(activePolicy));
    });

    this.slaForm.controls.priority.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((priority) => {
        const selectedPolicy = this.policies().find((policy) => policy.priority === priority);

        if (selectedPolicy) {
          this.patchForm(selectedPolicy);
        }
      });
  }

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.slaPageStore.load();
  }

  selectPolicy(policy: SlaPolicy): void {
    this.patchForm(policy);
  }

  submit(): void {
    if (this.slaForm.invalid) {
      this.slaForm.markAllAsTouched();
      return;
    }

    this.validationErrorMessage.set(null);

    const rawValue = this.slaForm.getRawValue();
    const selectedPolicy = this.policies().find((policy) => policy.priority === rawValue.priority);

    if (!selectedPolicy) {
      this.validationErrorMessage.set('Unable to identify the SLA policy to update.');
      return;
    }

    this.slaPageStore.update(rawValue.priority, {
      version: selectedPolicy.version,
      firstResponseHours: Number(rawValue.firstResponseHours),
      resolutionHours: Number(rawValue.resolutionHours),
      active: rawValue.active,
    });
  }

  priorityLabel(priority: TicketPriority): string {
    return getTicketPriorityLabel(priority);
  }

  prioritySeverity(priority: TicketPriority): 'danger' | 'warn' | 'info' | 'secondary' {
    return getTicketPriorityTagSeverity(priority);
  }

  activeStateLabel(active: boolean): string {
    return getActiveStateLabel(active);
  }

  private patchForm(policy: SlaPolicy): void {
    this.slaForm.reset(
      {
        priority: policy.priority,
        firstResponseHours: policy.firstResponseHours,
        resolutionHours: policy.resolutionHours,
        active: policy.active,
      },
      { emitEvent: false },
    );
  }
}
