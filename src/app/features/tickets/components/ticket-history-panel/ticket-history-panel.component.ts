import { Component, inject } from '@angular/core';
import { TicketDetailStore } from '../../stores/ticket-detail.store';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticket-history-panel',
  standalone: true,
  imports: [MessageModule, CommonModule],
  templateUrl: './ticket-history-panel.component.html',
  styleUrl: './ticket-history-panel.component.css',
})
export class TicketHistoryPanelComponent {
  readonly ticketDetailStore = inject(TicketDetailStore);
  readonly historyError = this.ticketDetailStore.historyError;
  readonly history = this.ticketDetailStore.history;
}
