import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { TicketDetail, UserRecord } from '../../../../shared/models/api.models';
import { TicketDetailStore } from '../../stores/ticket-detail.store';
import { TicketDetailHeaderComponent } from './ticket-detail-header.component';

describe('TicketDetailHeaderComponent', () => {
  const supportUsers: UserRecord[] = [
    {
      id: 'user-agent-1',
      firstName: 'Grace',
      lastName: 'Agent',
      email: 'grace@example.com',
      role: 'SUPPORT_AGENT',
      active: true,
      lastLoginAt: null,
      version: 1,
    },
    {
      id: 'user-agent-2',
      firstName: 'Linus',
      lastName: 'Manager',
      email: 'linus@example.com',
      role: 'SUPPORT_MANAGER',
      active: true,
      lastLoginAt: null,
      version: 1,
    },
  ];

  const baseTicket: TicketDetail = {
    id: 'ticket-1',
    code: 'MT-1',
    title: 'Printer issue',
    status: 'ASSIGNED',
    priority: 'MEDIUM',
    requesterId: 'user-requester',
    requesterName: 'Customer',
    assignedAgentId: 'user-agent-1',
    assignedAgentName: 'Grace Agent',
    categoryId: 'category-1',
    categoryName: 'Support',
    resolutionDueAt: '2026-01-01T00:00:00.000Z',
    slaFirstResponseBreached: false,
    slaResolutionBreached: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    version: 1,
    description: 'Printer not working',
    firstResponseDueAt: '2026-01-01T00:00:00.000Z',
    firstRespondedAt: null,
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    slaPausedAt: null,
    accumulatedPausedSeconds: 0,
    resolutionSummary: null,
    availableActions: ['assign', 'start'],
  };

  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  async function setup() {
    vi.clearAllMocks();

    const storeMock = {
      supportUsers: signal(supportUsers),
      supportUsersLoading: signal(false),
      supportUsersError: signal<string | null>(null),
      assignTicket: vi.fn(() => of(true)),
      startTicket: vi.fn(() => of(true)),
      closeTicket: vi.fn(() => of(true)),
      reloadSupportUsers: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TicketDetailHeaderComponent],
      providers: [
        {
          provide: TicketDetailStore,
          useValue: storeMock,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TicketDetailHeaderComponent);
    fixture.componentRef.setInput('ticket', baseTicket);
    fixture.detectChanges();

    return { fixture, storeMock };
  }

  it('keeps the selected agent when the same backend assignee is pushed again', async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;

    component.assignmentForm.controls.agentId.setValue('user-agent-2');
    fixture.detectChanges();

    fixture.componentRef.setInput('ticket', {
      ...baseTicket,
      title: 'Printer issue updated',
      assignedAgentId: 'user-agent-1',
      assignedAgentName: 'Grace Agent',
    });
    fixture.detectChanges();
    await Promise.resolve();

    expect(component.assignmentForm.controls.agentId.value).toBe('user-agent-2');
  });

  it('resyncs the selector when the backend assignee actually changes', async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;

    component.assignmentForm.controls.agentId.setValue('user-agent-2');
    fixture.detectChanges();

    fixture.componentRef.setInput('ticket', {
      ...baseTicket,
      assignedAgentId: 'user-agent-2',
      assignedAgentName: 'Linus Manager',
      version: 2,
    });
    fixture.detectChanges();
    await Promise.resolve();

    expect(component.assignmentForm.controls.agentId.value).toBe('user-agent-2');
  });
});
