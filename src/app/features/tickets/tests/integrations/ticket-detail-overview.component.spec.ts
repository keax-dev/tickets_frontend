// Exercises the ticket overview actions for requesting information and resolving a ticket.
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { TicketDetail } from '../../../../shared/models/api.models';
import { TicketDetailStore } from '../../stores/ticket-detail.store';
import { TicketDetailOverviewComponent } from '../../components/ticket-detail-overview/ticket-detail-overview.component';

describe('TicketDetailOverviewComponent', () => {
  // Ticket fixture that exposes both overview actions rendered by the component.
  const ticket: TicketDetail = {
    id: 'ticket-1',
    code: 'MT-1',
    title: 'Printer issue',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    requesterId: 'user-requester',
    requesterName: 'Customer',
    assignedAgentId: 'user-agent',
    assignedAgentName: 'Grace Agent',
    categoryId: 'category-1',
    categoryName: 'Support',
    resolutionDueAt: '2026-01-01T00:00:00.000Z',
    slaFirstResponseBreached: false,
    slaResolutionBreached: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    version: 2,
    description: 'Printer not working',
    firstResponseDueAt: '2026-01-01T00:00:00.000Z',
    firstRespondedAt: '2026-01-01T00:05:00.000Z',
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    slaPausedAt: null,
    accumulatedPausedSeconds: 0,
    resolutionSummary: null,
    availableActions: ['request-information', 'resolve'],
  };

  // Creates the component with mocked store actions and a stable ticket input.
  async function setup() {
    const storeMock = {
      requestInformation: vi.fn(() => of(true)),
      resolveTicket: vi.fn(() => of(true)),
    };

    await TestBed.configureTestingModule({
      imports: [TicketDetailOverviewComponent],
      providers: [
        {
          provide: TicketDetailStore,
          useValue: storeMock,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TicketDetailOverviewComponent);
    fixture.componentRef.setInput('ticket', ticket);
    fixture.detectChanges();
    await Promise.resolve();

    return { fixture, storeMock };
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('submits the request information form and clears it on success', async () => {
    const { fixture, storeMock } = await setup();
    const component = fixture.componentInstance;

    component.requestInformationForm.setValue({
      content: 'Necesitamos el serial del equipo.',
    });

    component.requestInformation();

    expect(storeMock.requestInformation).toHaveBeenCalledWith('Necesitamos el serial del equipo.');
    expect(component.requestInformationForm.getRawValue().content).toBe('');
  });

  it('submits the resolution form and clears it on success', async () => {
    const { fixture, storeMock } = await setup();
    const component = fixture.componentInstance;

    component.resolveForm.setValue({
      resolutionSummary: 'Se reinició el servicio de impresión.',
    });

    component.resolve();

    expect(storeMock.resolveTicket).toHaveBeenCalledWith('Se reinició el servicio de impresión.');
    expect(component.resolveForm.getRawValue().resolutionSummary).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Resolver ticket');
  });
});
