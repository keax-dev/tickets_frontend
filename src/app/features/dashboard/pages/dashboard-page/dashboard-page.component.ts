import { Component, inject, OnInit } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardStore } from '../../stores/dashboard.store';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  imports: [CommonModule, CardModule, SkeletonModule, TagModule, ButtonModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent implements OnInit{
  readonly dashboardStore = inject(DashboardStore);
  readonly skeletonCards = Array.from({ length: 4 });
  readonly objectEntries = Object.entries;
  readonly statusLabels: Record<string, string> = {
    CREATED: 'Creado',
    ASSIGNED: 'Asignado',
    IN_PROGRESS: 'En progreso',
    WAITING_FOR_CUSTOMER: 'Esperando al cliente',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado',
    CANCELLED: 'Cancelado',
  };

  ngOnInit(): void {
    this.dashboardStore.load();
  }
}
