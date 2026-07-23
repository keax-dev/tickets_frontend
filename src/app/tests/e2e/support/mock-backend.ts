// Provides an in-memory HTTP backend so Playwright scenarios can exercise the full UI without a real API server.
import type {
  Category,
  CurrentUser,
  DashboardSummary,
  NotificationItem,
  PageResponse,
  RecentActivity,
  TicketComment,
  TicketDetail,
  TicketHistory,
  TicketPriority,
  UserRecord,
} from '../../../shared/models/api.models';
import type { Page, Route } from '@playwright/test';

// Shared constants keep the fake API responses deterministic across every e2e scenario.
const API_BASE_PATH = '/api/v1';
const NOW_ISO = '2026-07-23T12:00:00.000Z';

// Describes every dataset the mocked backend can expose to a given test scenario.
type MockBackendOptions = {
  sessionUser?: CurrentUser | null;
  loginUser?: CurrentUser | null;
  categories?: Category[];
  dashboardSummary?: DashboardSummary;
  recentActivity?: RecentActivity[];
  notifications?: NotificationItem[];
  tickets?: TicketDetail[];
  commentsByTicketId?: Record<string, TicketComment[]>;
  historyByTicketId?: Record<string, TicketHistory[]>;
  users?: UserRecord[];
};

// Builds a session user with sensible defaults so each spec only overrides the fields it really cares about.
export function createUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    id: overrides.id ?? 'user-1',
    firstName: overrides.firstName ?? 'Juan',
    lastName: overrides.lastName ?? 'Cliente',
    email: overrides.email ?? 'cliente@tickets.local',
    role: overrides.role ?? 'CUSTOMER',
    permissions: overrides.permissions ?? [],
  };
}

// Builds a user row shaped like the administration listing returned by the backend.
export function createUserRecord(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: overrides.id ?? 'user-record-1',
    firstName: overrides.firstName ?? 'Ada',
    lastName: overrides.lastName ?? 'Admin',
    email: overrides.email ?? 'ada@tickets.local',
    role: overrides.role ?? 'ADMIN',
    active: overrides.active ?? true,
    lastLoginAt: overrides.lastLoginAt ?? NOW_ISO,
    version: overrides.version ?? 1,
  };
}

// Builds a category option used by ticket forms and category administration scenarios.
export function createCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: overrides.id ?? 'category-1',
    name: overrides.name ?? 'Hardware',
    description: overrides.description ?? 'Hardware issues',
    active: overrides.active ?? true,
    version: overrides.version ?? 1,
    createdAt: overrides.createdAt ?? NOW_ISO,
    updatedAt: overrides.updatedAt ?? NOW_ISO,
  };
}

// Builds a notification row with defaults suitable for unread notification tests.
export function createNotification(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: overrides.id ?? 'notification-1',
    type: overrides.type ?? 'TICKET_ASSIGNED',
    title: overrides.title ?? 'Ticket asignado',
    message: overrides.message ?? 'Se te asignÃ³ un nuevo ticket.',
    relatedTicketId: overrides.relatedTicketId ?? 'ticket-1',
    read: overrides.read ?? false,
    createdAt: overrides.createdAt ?? NOW_ISO,
    readAt: overrides.readAt ?? null,
  };
}

// Builds a complete ticket detail payload so pages can render without depending on partial objects.
export function createTicketDetail(overrides: Partial<TicketDetail> = {}): TicketDetail {
  return {
    id: overrides.id ?? 'ticket-1',
    code: overrides.code ?? 'MT-1',
    title: overrides.title ?? 'Computadora sin memoria',
    description: overrides.description ?? 'El equipo no permite crear archivos.',
    status: overrides.status ?? 'CREATED',
    priority: overrides.priority ?? 'MEDIUM',
    requesterId: overrides.requesterId ?? 'customer-1',
    requesterName: overrides.requesterName ?? 'Juan Cliente',
    assignedAgentId: overrides.assignedAgentId ?? null,
    assignedAgentName: overrides.assignedAgentName ?? null,
    categoryId: overrides.categoryId ?? 'category-1',
    categoryName: overrides.categoryName ?? 'Hardware',
    firstResponseDueAt: overrides.firstResponseDueAt ?? NOW_ISO,
    firstRespondedAt: overrides.firstRespondedAt ?? null,
    resolutionDueAt: overrides.resolutionDueAt ?? NOW_ISO,
    resolvedAt: overrides.resolvedAt ?? null,
    closedAt: overrides.closedAt ?? null,
    cancelledAt: overrides.cancelledAt ?? null,
    slaPausedAt: overrides.slaPausedAt ?? null,
    accumulatedPausedSeconds: overrides.accumulatedPausedSeconds ?? 0,
    slaFirstResponseBreached: overrides.slaFirstResponseBreached ?? false,
    slaResolutionBreached: overrides.slaResolutionBreached ?? false,
    resolutionSummary: overrides.resolutionSummary ?? null,
    availableActions: overrides.availableActions ?? [],
    createdAt: overrides.createdAt ?? NOW_ISO,
    updatedAt: overrides.updatedAt ?? NOW_ISO,
    version: overrides.version ?? 1,
  };
}

// Deep-clones JSON-safe values so each browser page mutates its own isolated copy of the mock state.
function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Shapes the authentication contract returned by login and refresh endpoints.
function createAuthResponse(user: CurrentUser) {
  return {
    accessToken: 'e2e-access-token',
    expiresAt: '2026-07-23T14:00:00.000Z',
    user,
  };
}

// Builds a backend-style problem-details object for negative scenarios and missing routes.
function createProblemDetails(status: number, title: string, detail: string, code: string) {
  return {
    status,
    title,
    detail,
    code,
    correlationId: 'e2e-correlation-id',
    fieldErrors: [],
  };
}

// Provides a realistic dashboard summary used when a test does not care about custom dashboard data.
function createDashboardSummary(): DashboardSummary {
  return {
    activeTickets: 8,
    createdToday: 3,
    unassignedTickets: 2,
    breachedTickets: 1,
    dueSoonTickets: 4,
    assignedToCurrentUser: 5,
    ticketsByStatus: {
      CREATED: 2,
      ASSIGNED: 2,
      IN_PROGRESS: 2,
      WAITING_FOR_CUSTOMER: 1,
      RESOLVED: 1,
      CLOSED: 0,
      CANCELLED: 0,
    },
    ticketsByPriority: {
      LOW: 1,
      MEDIUM: 3,
      HIGH: 3,
      URGENT: 1,
    },
  };
}

// Provides a small activity feed so the dashboard can render its recent activity section.
function createRecentActivity(): RecentActivity[] {
  return [
    {
      id: 'activity-1',
      ticketId: 'ticket-1',
      action: 'ASSIGNED',
      performedByName: 'Ada Admin',
      createdAt: NOW_ISO,
    },
  ];
}

// Converts the in-memory ticket list into the paginated response contract expected by the frontend stores.
function toTicketPageResponse(
  tickets: TicketDetail[],
  page: number,
  size: number,
): PageResponse<TicketDetail> {
  const start = page * size;
  const end = start + size;

  return {
    content: tickets.slice(start, end),
    page,
    size,
    totalElements: tickets.length,
    totalPages: tickets.length === 0 ? 0 : Math.ceil(tickets.length / size),
    sort: ['createdAt,DESC'],
  };
}

// Converts the in-memory notification list into the same paginated shape used by the real backend.
function toNotificationPageResponse(
  notifications: NotificationItem[],
  page: number,
  size: number,
): PageResponse<NotificationItem> {
  const start = page * size;
  const end = start + size;

  return {
    content: notifications.slice(start, end),
    page,
    size,
    totalElements: notifications.length,
    totalPages: notifications.length === 0 ? 0 : Math.ceil(notifications.length / size),
    sort: ['createdAt,DESC'],
  };
}

// Sends JSON responses with the correct content type so the Angular HTTP client parses them normally.
async function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

// Installs a per-page HTTP router that mimics the backend endpoints used by the e2e scenarios.
export async function installMockBackend(
  page: Page,
  options: MockBackendOptions = {},
): Promise<void> {
  // Materialize every dataset up front so route handlers can mutate local state during the scenario.
  const categories = cloneJson(options.categories ?? [createCategory()]);
  const dashboardSummary = cloneJson(options.dashboardSummary ?? createDashboardSummary());
  const recentActivity = cloneJson(options.recentActivity ?? createRecentActivity());
  const users = cloneJson(options.users ?? []);
  const sessionUser = options.sessionUser ?? null;
  const loginUser = options.loginUser ?? sessionUser;
  const notifications = cloneJson(options.notifications ?? []);
  const ticketsById = new Map(
    cloneJson(options.tickets ?? []).map((ticket) => [ticket.id, ticket] as const),
  );
  const commentsByTicketId = new Map(Object.entries(cloneJson(options.commentsByTicketId ?? {})));
  const historyByTicketId = new Map(Object.entries(cloneJson(options.historyByTicketId ?? {})));

  await page.route(`**${API_BASE_PATH}/**`, async (route) => {
    // Extract the request metadata once so every branch can match on a clean method/path pair.
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname.startsWith(API_BASE_PATH)
      ? url.pathname.slice(API_BASE_PATH.length)
      : url.pathname;

    // Simulate refresh token recovery used during app bootstrap and expired-session recovery.
    if (method === 'POST' && path === '/auth/refresh') {
      if (!sessionUser) {
        await fulfillJson(
          route,
          401,
          createProblemDetails(401, 'Unauthorized', 'No active session.', 'UNAUTHENTICATED'),
        );
        return;
      }

      await fulfillJson(route, 200, createAuthResponse(sessionUser));
      return;
    }

    // Simulate the login endpoint used by the authentication page.
    if (method === 'POST' && path === '/auth/login') {
      if (!loginUser) {
        await fulfillJson(
          route,
          401,
          createProblemDetails(
            401,
            'Unauthorized',
            'Credenciales invalidas.',
            'INVALID_CREDENTIALS',
          ),
        );
        return;
      }

      await fulfillJson(route, 200, createAuthResponse(loginUser));
      return;
    }

    // Simulate a successful logout with an empty body because the frontend only cares about the status.
    if (method === 'POST' && path === '/auth/logout') {
      await route.fulfill({ status: 200, body: '{}' });
      return;
    }

    // Serve the dashboard summary cards.
    if (method === 'GET' && path === '/dashboard/summary') {
      await fulfillJson(route, 200, dashboardSummary);
      return;
    }

    // Serve the dashboard recent-activity stream.
    if (method === 'GET' && path === '/dashboard/recent-activity') {
      await fulfillJson(route, 200, recentActivity);
      return;
    }

    // Return a paginated notification response based on the page/size query parameters.
    if (method === 'GET' && path === '/notifications') {
      const currentPage = Number(url.searchParams.get('page') ?? '0');
      const currentSize = Number(url.searchParams.get('size') ?? '10');

      await fulfillJson(
        route,
        200,
        toNotificationPageResponse(notifications, currentPage, currentSize),
      );
      return;
    }

    // Mark every notification as read, mutating the in-memory state so the UI reacts on the next render.
    if (method === 'PATCH' && path === '/notifications/read-all') {
      notifications.forEach((notification) => {
        notification.read = true;
        notification.readAt = NOW_ISO;
      });

      await route.fulfill({ status: 204 });
      return;
    }

    // Mark a single notification as read when the row action is used.
    const notificationMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
    if (method === 'PATCH' && notificationMatch) {
      const notification = notifications.find((item) => item.id === notificationMatch[1]);

      if (!notification) {
        await fulfillJson(
          route,
          404,
          createProblemDetails(
            404,
            'Not Found',
            'Notification was not found.',
            'NOTIFICATION_NOT_FOUND',
          ),
        );
        return;
      }

      notification.read = true;
      notification.readAt = NOW_ISO;

      await fulfillJson(route, 200, notification);
      return;
    }

    // Return the categories used by ticket forms and category administration pages.
    if (method === 'GET' && path === '/categories') {
      await fulfillJson(route, 200, categories);
      return;
    }

    // Return the users used by administration pages.
    if (method === 'GET' && path === '/users') {
      await fulfillJson(route, 200, users);
      return;
    }

    // Return the paginated tickets listing.
    if (method === 'GET' && path === '/tickets') {
      const currentPage = Number(url.searchParams.get('page') ?? '0');
      const currentSize = Number(url.searchParams.get('size') ?? '10');
      const tickets = Array.from(ticketsById.values());

      await fulfillJson(route, 200, toTicketPageResponse(tickets, currentPage, currentSize));
      return;
    }

    // Create a new ticket in memory and immediately return the created resource like the real API would.
    if (method === 'POST' && path === '/tickets') {
      const payload = request.postDataJSON() as {
        title: string;
        description: string;
        categoryId: string;
        priority: TicketPriority;
      };
      const nextId = `ticket-${ticketsById.size + 1}`;
      const nextCode = `MT-${ticketsById.size + 1}`;
      const category = categories.find((item) => item.id === payload.categoryId) ?? categories[0];
      const currentUser = loginUser ?? sessionUser;

      const createdTicket = createTicketDetail({
        id: nextId,
        code: nextCode,
        title: payload.title,
        description: payload.description,
        categoryId: payload.categoryId,
        categoryName: category?.name ?? null,
        priority: payload.priority,
        requesterId: currentUser?.id ?? 'customer-1',
        requesterName: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : 'Usuario demo',
        status: 'CREATED',
        availableActions: [],
      });

      ticketsById.set(createdTicket.id, createdTicket);
      commentsByTicketId.set(createdTicket.id, []);
      historyByTicketId.set(createdTicket.id, []);

      await fulfillJson(route, 201, createdTicket);
      return;
    }

    // Return the comment timeline for a specific ticket detail page.
    const ticketCommentsMatch = path.match(/^\/tickets\/([^/]+)\/comments$/);
    if (method === 'GET' && ticketCommentsMatch) {
      await fulfillJson(route, 200, commentsByTicketId.get(ticketCommentsMatch[1]) ?? []);
      return;
    }

    // Return the history timeline for a specific ticket detail page.
    const ticketHistoryMatch = path.match(/^\/tickets\/([^/]+)\/history$/);
    if (method === 'GET' && ticketHistoryMatch) {
      await fulfillJson(route, 200, historyByTicketId.get(ticketHistoryMatch[1]) ?? []);
      return;
    }

    // Return a single ticket detail by id.
    const ticketMatch = path.match(/^\/tickets\/([^/]+)$/);
    if (method === 'GET' && ticketMatch) {
      const ticket = ticketsById.get(ticketMatch[1]);

      if (!ticket) {
        await fulfillJson(
          route,
          404,
          createProblemDetails(404, 'Not Found', 'Ticket was not found.', 'TICKET_NOT_FOUND'),
        );
        return;
      }

      await fulfillJson(route, 200, ticket);
      return;
    }

    // Fail loudly for any unhandled request so missing mock coverage is obvious during test development.
    await fulfillJson(
      route,
      404,
      createProblemDetails(
        404,
        'Not Found',
        `No mock handler configured for ${method} ${path}.`,
        'UNHANDLED_MOCK_ROUTE',
      ),
    );
  });
}
