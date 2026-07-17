import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProblemDetails, SlaPolicy, TicketPriority } from '../../../../shared/models/api.models';
import { Component, inject, OnInit, signal } from '@angular/core';
import { resolveProblemDetailsMessage } from '../../../../shared/utils/resolve-problem-details-message';
import { AdministrationApiService } from '../../services/administration-api.service';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';

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
  templateUrl: './sla-page.component.html',
  styleUrl: './sla-page.component.css',
})
export class SlaPageComponent implements OnInit {
  private readonly administrationApiService = inject(AdministrationApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly errorMessage = signal<string | null>(null);
  readonly policies = signal<SlaPolicy[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly priorityOptions = [
    { label: 'Urgente', value: 'URGENT' as const },
    { label: 'Alta', value: 'HIGH' as const },
    { label: 'Media', value: 'MEDIUM' as const },
    { label: 'Baja', value: 'LOW' as const },
  ];

  readonly activeOptions = [
    { label: 'Activa', value: true },
    { label: 'Inactiva', value: false },
  ];

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

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.errorMessage.set(null);
    this.loading.set(true);

    this.administrationApiService
      .listSlaPolicies()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (policies) => {
          this.policies.set(policies);
          const activePolicy =
            policies.find((policy) => policy.priority === this.slaForm.controls.priority.value) ??
            policies[0];
          if (activePolicy) {
            this.patchForm(activePolicy);
          }
        },
        error: (error: ProblemDetails) => {
          this.errorMessage.set(
            resolveProblemDetailsMessage(error, 'No fue posible cargar las politicas SLA.'),
          );
        },
      });
  }

  selectPolicy(policy: SlaPolicy): void {
    this.patchForm(policy);
  }

  submit(): void {
    if (this.slaForm.invalid) {
      this.slaForm.markAllAsTouched();
      return;
    }

    const rawValue = this.slaForm.getRawValue();
    const selectedPolicy = this.policies().find((policy) => policy.priority === rawValue.priority);

    if (!selectedPolicy) {
      this.errorMessage.set('No fue posible identificar la politica SLA a actualizar.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.administrationApiService
      .updateSlaPolicy(rawValue.priority, {
        version: selectedPolicy.version,
        firstResponseHours: Number(rawValue.firstResponseHours),
        resolutionHours: Number(rawValue.resolutionHours),
        active: rawValue.active,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.loadPolicies();
        },
        error: (error: ProblemDetails) => {
          this.errorMessage.set(
            resolveProblemDetailsMessage(error, 'No fue posible actualizar la politica SLA.'),
          );
        },
      });
  }

  priorityLabel(priority: TicketPriority): string {
    return this.priorityOptions.find((option) => option.value === priority)?.label ?? priority;
  }

  prioritySeverity(priority: TicketPriority): 'danger' | 'warn' | 'info' | 'secondary' {
    switch (priority) {
      case 'URGENT':
        return 'danger';
      case 'HIGH':
        return 'warn';
      case 'MEDIUM':
        return 'info';
      default:
        return 'secondary';
    }
  }

  private patchForm(policy: SlaPolicy): void {
    this.slaForm.reset({
      priority: policy.priority,
      firstResponseHours: policy.firstResponseHours,
      resolutionHours: policy.resolutionHours,
      active: policy.active,
    });
  }
}
