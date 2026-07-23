import { Injectable, inject, signal } from '@angular/core';
import { finalize, switchMap } from 'rxjs';
import { resolveProblemDetailsMessage } from '../../../shared/utils/resolve-problem-details-message';
import {
  ProblemDetails,
  SlaPolicy,
  TicketPriority,
  UpdateSlaPolicyRequest,
} from '../../../shared/models/api.models';
import { SlaAdminApiService } from '../services/sla-admin-api.service';

@Injectable()
export class SlaPageStore {
  private readonly slaAdminApiService = inject(SlaAdminApiService);

  private readonly policiesState = signal<SlaPolicy[]>([]);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly policies = this.policiesState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.slaAdminApiService
      .listSlaPolicies()
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (policies) => {
          this.policiesState.set(policies);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(
            resolveProblemDetailsMessage(error, 'No se pudieron cargar las políticas SLA.'),
          );
        },
      });
  }

  update(priority: TicketPriority, payload: UpdateSlaPolicyRequest): void {
    this.savingState.set(true);
    this.errorState.set(null);

    this.slaAdminApiService
      .updateSlaPolicy(priority, payload)
      .pipe(
        switchMap(() => this.slaAdminApiService.listSlaPolicies()),
        finalize(() => this.savingState.set(false)),
      )
      .subscribe({
        next: (policies) => {
          this.policiesState.set(policies);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(
            resolveProblemDetailsMessage(error, 'No se pudo actualizar la política SLA.'),
          );
        },
      });
  }
}
