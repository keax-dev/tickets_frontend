import { Component, OnInit, computed, inject } from '@angular/core';
import { NotificationStore } from '../../stores/notification.store';
import { PaginatorState } from 'primeng/types/paginator';
import { PaginatorModule } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  imports: [CommonModule, ButtonModule, MessageModule, PaginatorModule, TagModule],
  providers: [NotificationStore],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.css',
})
export class NotificationsPageComponent implements OnInit {
  readonly notificationStore = inject(NotificationStore);
  readonly defaultRows = 10;

  readonly currentFirst = computed(
    () => this.notificationStore.currentPage() * this.notificationStore.pageSize(),
  );

  ngOnInit(): void {
    this.notificationStore.load(0, this.defaultRows);
  }

  onPageChange(event: PaginatorState): void {
    const rows = event.rows ?? this.defaultRows;
    const page = event.page ?? Math.floor((event.first ?? 0) / rows);

    this.notificationStore.load(page, rows);
  }
}
