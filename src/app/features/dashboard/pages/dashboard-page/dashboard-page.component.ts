import { Component, inject, OnInit } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
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
  readonly objectEntries = Object.entries;

  readonly statusLabels: Record<string, string> = {
    CREATED: 'Created',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In progress',
    WAITING_FOR_CUSTOMER: 'Waiting for customer',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    CANCELLED: 'Cancelled',
  };

  ngOnInit(): void {
    this.dashboardStore.load();
  }
}
