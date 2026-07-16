import { Injectable, inject, signal } from '@angular/core';
import { DashboardApiService } from '../services/dashboard-api.service';
import { finalize, forkJoin } from 'rxjs';
import {
  DashboardSummary,
  RecentActivity,
  ProblemDetails,
} from '../../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
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
    this.loadingState.set(true);
    this.errorState.set(null);

    forkJoin({
      summary: this.dashboardApiService.getSummary(),
      recentActivity: this.dashboardApiService.getRecentActivity(),
    })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: ({ summary, recentActivity }) => {
          this.summaryState.set(summary);
          this.recentActivityState.set(recentActivity);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(error?.detail ?? 'No fue posible cargar el dashboard.');
        },
      });
  }
}
