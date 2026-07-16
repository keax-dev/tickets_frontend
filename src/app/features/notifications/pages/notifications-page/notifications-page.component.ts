import { NotificationStore } from '../../stores/notification.store';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  imports: [CommonModule, ButtonModule, MessageModule, TagModule],
  providers: [NotificationStore],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.css',
})
export class NotificationsPageComponent implements OnInit {
  readonly notificationStore = inject(NotificationStore);

  ngOnInit(): void {
    this.notificationStore.load();
  }
}
