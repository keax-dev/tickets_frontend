import { Component, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TicketDetailStore } from '../../stores/ticket-detail.store';
import { TicketDetailOverviewComponent } from '../../components/ticket-detail-overview/ticket-detail-overview.component';
import { TicketDetailHeaderComponent } from '../../components/ticket-detail-header/ticket-detail-header.component';
import { TicketHistoryPanelComponent } from '../../components/ticket-history-panel/ticket-history-panel.component';
import { TicketSummaryCardsComponent } from '../../components/ticket-summary-cards/ticket-summary-cards.component';
import { TicketCommentsPanelComponent } from '../../components/ticket-comments-panel/ticket-comments-panel.component';
import { ActivatedRoute } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { AuthStore } from '../../../../core/auth/stores/auth.store';
import { map } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    MessageModule,
    TabsModule,
    TicketDetailHeaderComponent,
    TicketSummaryCardsComponent,
    TicketCommentsPanelComponent,
    TicketHistoryPanelComponent,
    TicketDetailOverviewComponent,
  ],
  providers: [TicketDetailStore],
  templateUrl: './ticket-detail-page.component.html',
  styleUrl: './ticket-detail-page.component.css',
})
export class TicketDetailPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);

  readonly ticketDetailStore = inject(TicketDetailStore);
  readonly ticketId = toSignal(
    this.route.paramMap.pipe(map((paramMap) => paramMap.get('ticketId'))),
    {
      initialValue: null,
    },
  );
  readonly errorMessage = this.ticketDetailStore.errorMessage;
  readonly ticket = this.ticketDetailStore.ticket;
  readonly canReadHistory = computed(() => this.authStore.hasPermission('AUDIT_READ'));

  readonly currentTicket = computed(() => {
    const ticket = this.ticket();
    const ticketId = this.ticketId();

    return ticket && ticket.id === ticketId ? ticket : null;
  });

  readonly loading = this.ticketDetailStore.loading;

  constructor() {
    effect(() => {
      const ticketId = this.ticketId();

      if (ticketId) {
        untracked(() => {
          this.ticketDetailStore.initialize(ticketId);
        });
      }
    });
  }
}
