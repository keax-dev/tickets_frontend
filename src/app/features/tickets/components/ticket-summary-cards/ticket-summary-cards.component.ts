import { Component, input } from '@angular/core';
import { TicketDetail } from '../../../../shared/models/api.models';
import {
  getTicketPriorityLabel,
  getTicketStatusLabel,
} from '../../../../shared/constants/ui.constants';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-ticket-summary-cards',
  standalone: true,
  imports: [CardModule, TagModule],
  templateUrl: './ticket-summary-cards.component.html',
  styleUrl: './ticket-summary-cards.component.css',
})
export class TicketSummaryCardsComponent {
  readonly ticket = input.required<TicketDetail>();

  statusLabel(status: TicketDetail['status']): string {
    return getTicketStatusLabel(status);
  }

  priorityLabel(priority: TicketDetail['priority']): string {
    return getTicketPriorityLabel(priority);
  }
}
