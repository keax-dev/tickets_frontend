import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProblemDetails, SlaPolicy, TicketPriority } from '../../shared/models/api.models';
import { AdministrationApiService } from './administration-api.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    MessageModule,
  ],
  template: `
    <section class="page-card page">
      <div class="page-heading">
        <div>
          <h1>SLA</h1>
          <p>Define ventanas objetivo por prioridad para primera respuesta y resolucion.</p>
        </div>
        <button
          pButton
          type="button"
          label="Recargar"
          icon="pi pi-refresh"
          severity="secondary"
          (click)="loadPolicies()"
        ></button>
      </div>

      @if (errorMessage()) {
        <p-message severity="error" [text]="errorMessage() ?? ''"></p-message>
      }

      <div class="layout">
        <p-card>
          <p-table [value]="policies()" [loading]="loading()">
            <ng-template pTemplate="header">
              <tr>
                <th>Prioridad</th>
                <th>Primera respuesta</th>
                <th>Resolucion</th>
                <th>Estado</th>
                <th class="actions-column">Acciones</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-policy>
              <tr>
                <td>
                  <p-tag
                    [value]="priorityLabel(policy.priority)"
                    [severity]="prioritySeverity(policy.priority)"
                  ></p-tag>
                </td>
                <td>{{ policy.firstResponseHours }} h</td>
                <td>{{ policy.resolutionHours }} h</td>
                <td>
                  <p-tag
                    [value]="policy.active ? 'Activa' : 'Inactiva'"
                    [severity]="policy.active ? 'success' : 'secondary'"
                  ></p-tag>
                </td>
                <td class="actions-cell">
                  <button
                    pButton
                    type="button"
                    size="small"
                    label="Editar"
                    severity="secondary"
                    (click)="selectPolicy(policy)"
                  ></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <p-card header="Editar politica">
          <form class="form" [formGroup]="slaForm" (ngSubmit)="submit()">
            <label class="field">
              <span>Prioridad</span>
              <p-select
                formControlName="priority"
                [options]="priorityOptions"
                optionLabel="label"
                optionValue="value"
              ></p-select>
            </label>

            <label class="field">
              <span>Primera respuesta (horas)</span>
              <input pInputText type="number" min="1" formControlName="firstResponseHours" />
            </label>

            <label class="field">
              <span>Resolucion (horas)</span>
              <input pInputText type="number" min="1" formControlName="resolutionHours" />
            </label>

            <label class="field">
              <span>Estado</span>
              <p-select
                formControlName="active"
                [options]="activeOptions"
                optionLabel="label"
                optionValue="value"
              ></p-select>
            </label>

            <div class="form-actions">
              <button pButton type="submit" label="Guardar SLA" [loading]="saving()"></button>
            </div>
          </form>
        </p-card>
      </div>
    </section>
  `,
  styles: [
    `
      .page {
        padding: 1.5rem;
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(320px, 420px);
        gap: 1rem;
        align-items: start;
      }

      .actions-cell,
      .form-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .actions-column {
        width: 8rem;
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .field span {
        color: var(--app-text-muted);
      }

      @media (max-width: 1080px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SlaPageComponent {
  private readonly administrationApiService = inject(AdministrationApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly policies = signal<SlaPolicy[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

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

  constructor() {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.administrationApiService.listSlaPolicies().subscribe({
      next: (policies) => {
        this.policies.set(policies);
        const activePolicy =
          policies.find((policy) => policy.priority === this.slaForm.controls.priority.value) ??
          policies[0];
        if (activePolicy) {
          this.patchForm(activePolicy);
        }
        this.loading.set(false);
      },
      error: (error: ProblemDetails) => {
        this.errorMessage.set(error?.detail ?? 'No fue posible cargar las politicas SLA.');
        this.loading.set(false);
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
    this.saving.set(true);
    this.errorMessage.set(null);

    this.administrationApiService
      .updateSlaPolicy(rawValue.priority, {
        firstResponseHours: Number(rawValue.firstResponseHours),
        resolutionHours: Number(rawValue.resolutionHours),
        active: rawValue.active,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.loadPolicies();
        },
        error: (error: ProblemDetails) => {
          this.errorMessage.set(error?.detail ?? 'No fue posible actualizar la politica SLA.');
          this.saving.set(false);
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
