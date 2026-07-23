import {
  AppRole,
  TicketCommentVisibility,
  TicketPriority,
  TicketStatus,
} from '../models/api.models';

type SelectOption<T> = Readonly<{
  label: string;
  value: T;
}>;

export type TicketPriorityTagSeverity = 'secondary' | 'info' | 'warn' | 'danger';

function createOptions<T extends string>(
  labels: Readonly<Record<T, string>>,
): Array<SelectOption<T>> {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }));
}

export const ROUTE_TITLES = {
  login: 'Iniciar sesión',
  dashboard: 'Panel',
  tickets: 'Tickets',
  ticketCreate: 'Nuevo ticket',
  ticketDetail: 'Detalle del ticket',
  notifications: 'Notificaciones',
  profile: 'Perfil',
  users: 'Usuarios',
  categories: 'Categorías',
  sla: 'Políticas SLA',
  forbidden: 'Acceso denegado',
  notFound: 'Página no encontrada',
} as const;

export const APP_ROLE_LABELS: Readonly<Record<AppRole, string>> = {
  ADMIN: 'Administrador',
  SUPPORT_MANAGER: 'Gestor de soporte',
  SUPPORT_AGENT: 'Agente de soporte',
  CUSTOMER: 'Cliente',
};

export const APP_ROLE_OPTIONS = createOptions(APP_ROLE_LABELS);

export function getAppRoleLabel(role: AppRole): string {
  return APP_ROLE_LABELS[role];
}

export const TICKET_PRIORITY_LABELS: Readonly<Record<TicketPriority, string>> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const TICKET_PRIORITY_OPTIONS = createOptions(TICKET_PRIORITY_LABELS);

export const TICKET_PRIORITY_TAG_SEVERITIES: Readonly<
  Record<TicketPriority, TicketPriorityTagSeverity>
> = {
  LOW: 'secondary',
  MEDIUM: 'info',
  HIGH: 'warn',
  URGENT: 'danger',
};

export function getTicketPriorityLabel(priority: TicketPriority): string {
  return TICKET_PRIORITY_LABELS[priority];
}

export function getTicketPriorityTagSeverity(priority: TicketPriority): TicketPriorityTagSeverity {
  return TICKET_PRIORITY_TAG_SEVERITIES[priority];
}

export const TICKET_STATUS_LABELS: Readonly<Record<TicketStatus, string>> = {
  CREATED: 'Creado',
  ASSIGNED: 'Asignado',
  IN_PROGRESS: 'En progreso',
  WAITING_FOR_CUSTOMER: 'Esperando al cliente',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
  CANCELLED: 'Cancelado',
};

export const TICKET_STATUS_OPTIONS = createOptions(TICKET_STATUS_LABELS);

export function getTicketStatusLabel(status: TicketStatus): string {
  return TICKET_STATUS_LABELS[status];
}

export const TICKET_HISTORY_ACTION_LABELS: Readonly<Record<string, string>> = {
  CREATED: 'Creado',
  UPDATED: 'Actualizado',
  ASSIGNED: 'Asignado',
  REASSIGNED: 'Reasignado',
  STARTED: 'Iniciado',
  REQUESTED_INFORMATION: 'Información solicitada',
  COMMENT_ADDED_PUBLIC: 'Comentario público agregado',
  COMMENT_ADDED_INTERNAL: 'Comentario interno agregado',
  RESOLVED: 'Resuelto',
  REOPENED: 'Reabierto',
  CLOSED: 'Cerrado',
  CANCELLED: 'Cancelado',
  PRIORITY_CHANGED: 'Prioridad cambiada',
  CATEGORY_CHANGED: 'Categoría cambiada',
  SLA_BREACHED: 'SLA vencido',
};

export function getTicketHistoryActionLabel(action: string): string {
  return TICKET_HISTORY_ACTION_LABELS[action] ?? action;
}

export const ACTIVE_STATE_OPTIONS: Array<SelectOption<boolean>> = [
  { label: 'Activo', value: true },
  { label: 'Inactivo', value: false },
];

export function getActiveStateLabel(active: boolean): string {
  return active ? 'Activo' : 'Inactivo';
}

export function getActivationActionLabel(active: boolean): string {
  return active ? 'Desactivar' : 'Activar';
}

export const COMMENT_VISIBILITY_LABELS: Readonly<Record<TicketCommentVisibility, string>> = {
  PUBLIC: 'Público',
  INTERNAL: 'Interno',
};

export function getTicketCommentVisibilityOptions(
  includeInternal: boolean,
): Array<SelectOption<TicketCommentVisibility>> {
  if (includeInternal) {
    return [
      { label: COMMENT_VISIBILITY_LABELS.PUBLIC, value: 'PUBLIC' },
      { label: COMMENT_VISIBILITY_LABELS.INTERNAL, value: 'INTERNAL' },
    ];
  }

  return [{ label: COMMENT_VISIBILITY_LABELS.PUBLIC, value: 'PUBLIC' }];
}
