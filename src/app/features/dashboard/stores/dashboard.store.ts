import { resolveProblemDetailsMessage } from '../../../shared/utils/resolve-problem-details-message';
import { Injectable, inject, signal } from '@angular/core';
import { DashboardApiService } from '../services/dashboard-api.service';
import { finalize, forkJoin } from 'rxjs';
import {
  DashboardSummary,
  RecentActivity,
  ProblemDetails,
} from '../../../shared/models/api.models';

@Injectable()
export class DashboardStore {
  private readonly dashboardApiService = inject(DashboardApiService);

  private readonly recentActivityState = signal<RecentActivity[]>([]);
  private readonly loadingState = signal(false);
  private readonly summaryState = signal<DashboardSummary | null>(null);
  private readonly errorState = signal<string | null>(null);

  readonly recentActivity = this.recentActivityState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly summary = this.summaryState.asReadonly();

  load(): void {
    this.recentActivityState.set([]);
    this.loadingState.set(true);
    this.summaryState.set(null);
    this.errorState.set(null);

    forkJoin({
      recentActivity: this.dashboardApiService.getRecentActivity(),
      summary: this.dashboardApiService.getSummary(),
    })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: ({ recentActivity, summary }) => {
          this.recentActivityState.set(recentActivity);
          this.summaryState.set(summary);
        },
        error: (error: ProblemDetails) => {
          this.recentActivityState.set([]);
          this.summaryState.set(null);
          this.errorState.set(
            resolveProblemDetailsMessage(error, 'No fue posible cargar el dashboard.')
          );
        },
      });
  }
}
