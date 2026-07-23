// Covers the ticket detail page orchestration, route reinitialization, and permission-based visibility.
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';
import { AuthStore } from '../../../../core/auth/stores/auth.store';
import {
  TicketComment,
  TicketDetail,
  TicketHistory,
  UserRecord,
} from '../../../../shared/models/api.models';
import { TicketDetailStore } from '../../stores/ticket-detail.store';
import { TicketDetailPageComponent } from '../../pages/ticket-detail-page/ticket-detail-page.component';

describe('TicketDetailPageComponent', () => {
  // Ticket, comments, history, and support-user fixtures that drive the page states below.
  const supportUsers: UserRecord[] = [
    {
      id: 'user-agent',
      firstName: 'Grace',
      lastName: 'Agent',
      email: 'grace@example.com',
      role: 'SUPPORT_AGENT',
      active: true,
      lastLoginAt: null,
      version: 1,
    },
  ];
  const ticket: TicketDetail = {
    id: 'ticket-1',
    code: 'MT-1',
    title: 'Printer issue',
    status: 'ASSIGNED',
    priority: 'MEDIUM',
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
  const comments: TicketComment[] = [
    {
      id: 'comment-public',
      ticketId: 'ticket-1',
      authorId: 'user-requester',
      authorName: 'Customer',
      content: 'Public comment',
      visibility: 'PUBLIC',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'comment-internal',
      ticketId: 'ticket-1',
      authorId: 'user-agent',
      authorName: 'Grace Agent',
      content: 'Internal note',
      visibility: 'INTERNAL',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  const history: TicketHistory[] = [];

  // PrimeNG internals require ResizeObserver, so the browser API is stubbed once for the suite.
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

  // Creates the page with mocked route params, permission checks, and store signals for each scenario.
  async function setup(options?: {
    canCreateInternalComments?: boolean;
    canReadInternalComments?: boolean;
    canReadHistory?: boolean;
    trackStoreSignalsInsideInitialize?: boolean;
  }) {
    // Step 1: the BehaviorSubject acts like a controllable ActivatedRoute so tests can simulate route changes on demand.
    const paramMapSubject = new BehaviorSubject(convertToParamMap({ ticketId: 'ticket-1' }));
    // Step 2: create a fake detail store with enough state for the entire page to render.
    const storeMock = {
      supportUsers: signal(supportUsers),
      supportUsersLoading: signal(false),
      supportUsersError: signal<string | null>(null),
      historyError: signal<string | null>(null),
      errorMessage: signal<string | null>(null),
      comments: signal(comments),
      history: signal(history),
      ticket: signal<TicketDetail | null>(ticket),
      loading: signal(false),
      initialize: vi.fn(() => {
        if (options?.trackStoreSignalsInsideInitialize) {
          storeMock.supportUsers();
          storeMock.supportUsersLoading();
          storeMock.supportUsersError();
        }
      }),
      addComment: vi.fn(() => of(true)),
      assignTicket: vi.fn(() => of(true)),
      startTicket: vi.fn(() => of(true)),
      requestInformation: vi.fn(() => of(true)),
      resolveTicket: vi.fn(() => of(true)),
      closeTicket: vi.fn(() => of(true)),
      reloadSupportUsers: vi.fn(),
    };
    // Step 3: emulate permission checks so each test can decide which sections should or should not be visible.
    const authStoreMock = {
      hasPermission: vi.fn((permission: string) => {
        if (permission === 'COMMENT_CREATE_INTERNAL') {
          return options?.canCreateInternalComments ?? true;
        }

        if (permission === 'COMMENT_READ_INTERNAL') {
          return options?.canReadInternalComments ?? true;
        }

        if (permission === 'AUDIT_READ') {
          return options?.canReadHistory ?? true;
        }

        return true;
      }),
    };

    // Step 4: compile the real page while replacing route, auth, and store dependencies with test doubles.
    await TestBed.configureTestingModule({
      imports: [TicketDetailPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
      ],
    })
      .overrideComponent(TicketDetailPageComponent, {
        set: {
          providers: [
            {
              provide: TicketDetailStore,
              useValue: storeMock,
            },
          ],
        },
      })
      .compileComponents();

    // Step 5: create the page and trigger the first render, which should also trigger initialization effects.
    const fixture = TestBed.createComponent(TicketDetailPageComponent);

    fixture.detectChanges();

    // Step 6: return all control handles needed by the individual tests.
    return {
      fixture,
      paramMapSubject,
      storeMock,
    };
  }

  it('reinitializes when the route ticket changes and hides stale ticket details', async () => {
    // Step 1: render the page with the initial route param ticket-1.
    const { fixture, paramMapSubject, storeMock } = await setup();

    // Step 2: prove the page is currently showing the first ticket's code.
    expect(fixture.nativeElement.textContent).toContain('MT-1');

    // Step 3: simulate navigation to a different ticket without recreating the page component.
    paramMapSubject.next(convertToParamMap({ ticketId: 'ticket-2' }));
    fixture.detectChanges();
    // Step 4: wait a microtask because route-driven effects can run asynchronously.
    await Promise.resolve();

    // Step 5: the store should have been initialized once for the first id and once again for the new route id.
    expect(storeMock.initialize).toHaveBeenNthCalledWith(1, 'ticket-1');
    expect(storeMock.initialize).toHaveBeenNthCalledWith(2, 'ticket-2');
    // Step 6: the old ticket code should disappear so the UI never shows stale data from the previous route.
    expect(fixture.nativeElement.textContent).not.toContain('MT-1');
  }, 15000);

  it('hides internal comment affordances without the required permissions', async () => {
    const { fixture } = await setup({
      canCreateInternalComments: false,
      canReadInternalComments: false,
    });

    expect(fixture.nativeElement.textContent).toContain('Public comment');
    expect(fixture.nativeElement.textContent).not.toContain('Internal note');
  }, 15000);

  it('hides history access without audit permission', async () => {
    const { fixture } = await setup({
      canReadHistory: false,
    });

    expect(fixture.nativeElement.textContent).not.toContain('Historial');
  }, 15000);

  it('does not reinitialize when store signals touched inside initialize change', async () => {
    // Step 1: render the page with an initialize mock that intentionally reads extra store signals.
    const { fixture, storeMock } = await setup({
      trackStoreSignalsInsideInitialize: true,
    });

    // Step 2: the page should initialize exactly once on first render.
    expect(storeMock.initialize).toHaveBeenCalledTimes(1);

    // Step 3: mutate signals that initialize touched. If dependencies are wired correctly, this must not retrigger initialize.
    storeMock.supportUsersLoading.set(true);
    fixture.detectChanges();
    await Promise.resolve();

    storeMock.supportUsersError.set('Unable to load agents.');
    fixture.detectChanges();
    await Promise.resolve();

    // Step 4: verify the page still initialized only once, protecting us from reactive infinite loops.
    expect(storeMock.initialize).toHaveBeenCalledTimes(1);
  }, 15000);
});
