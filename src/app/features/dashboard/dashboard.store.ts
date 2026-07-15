import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DashboardSummary, RecentActivity, ProblemDetails } from '../../shared/models/api.models';
import { DashboardApiService } from './dashboard-api.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardStore {
  private readonly dashboardApiService = inject(DashboardApiService);

  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly summaryState = signal<DashboardSummary | null>(null);
  private readonly recentActivityState = signal<RecentActivity[]>([]);

  readonly loading = this.loadingState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();
  readonly summary = this.summaryState.asReadonly();
  readonly recentActivity = this.recentActivityState.asReadonly();

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    forkJoin({
      summary: this.dashboardApiService.getSummary(),
      recentActivity: this.dashboardApiService.getRecentActivity(),
    }).subscribe({
      next: ({ summary, recentActivity }) => {
        this.summaryState.set(summary);
        this.recentActivityState.set(recentActivity);
        this.loadingState.set(false);
      },
      error: (error: ProblemDetails) => {
        this.errorState.set(error?.detail ?? 'No fue posible cargar el dashboard.');
        this.loadingState.set(false);
      },
    });
  }
}
