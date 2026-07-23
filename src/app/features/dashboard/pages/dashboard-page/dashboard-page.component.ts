import { Component, inject, OnInit } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import {
  TICKET_STATUS_LABELS,
  getTicketHistoryActionLabel,
} from '../../../../shared/constants/ui.constants';
import { DashboardSummary, TicketStatus } from '../../../../shared/models/api.models';
import { DashboardStore } from '../../stores/dashboard.store';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  imports: [CommonModule, CardModule, SkeletonModule, TagModule, ButtonModule, MessageModule],
  providers: [DashboardStore],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent implements OnInit {
  readonly dashboardStore = inject(DashboardStore);
  readonly skeletonCards = Array.from({ length: 6 });
  readonly statusLabels = TICKET_STATUS_LABELS;

  ngOnInit(): void {
    this.dashboardStore.load();
  }

  statusEntries(ticketsByStatus: DashboardSummary['ticketsByStatus']): Array<{
    status: TicketStatus;
    total: number;
  }> {
    return (Object.entries(ticketsByStatus) as Array<[TicketStatus, number]>).map(
      ([status, total]) => ({
        status,
        total,
      }),
    );
  }

  actionLabel(action: string): string {
    return getTicketHistoryActionLabel(action);
  }
}
