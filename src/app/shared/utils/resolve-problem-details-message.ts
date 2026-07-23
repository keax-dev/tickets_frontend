import { HttpErrorResponse } from '@angular/common/http';
import { FieldErrorResponse, ProblemDetails } from '../models/api.models';

const NETWORK_ERROR_MESSAGE =
  'No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.';
const UNAUTHORIZED_MESSAGE = 'Tu sesión expiró. Inicia sesión nuevamente.';
const FORBIDDEN_MESSAGE = 'No tienes permiso para realizar esta acción.';
const SERVER_ERROR_MESSAGE =
  'El servidor devolvió un error inesperado. Intenta nuevamente en unos minutos.';
const UNEXPECTED_ERROR_MESSAGE = 'Ocurrió un error inesperado.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function toFieldErrors(value: unknown): FieldErrorResponse[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }

    const field = toOptionalString(entry['field']);
    const message = toOptionalString(entry['message']);

    if (!field || !message) {
      return [];
    }

    return [{ field, message }];
  });
}

function inferProblemTitle(status: number): string {
  switch (status) {
    case 0:
      return 'Error de red';
    case 400:
      return 'Solicitud incorrecta';
    case 401:
      return 'No autorizado';
    case 403:
      return 'Prohibido';
    case 404:
      return 'No encontrado';
    default:
      return status >= 500 ? 'Error del servidor' : 'Error inesperado';
  }
}

function inferProblemCode(status: number): string {
  switch (status) {
    case 0:
      return 'NETWORK_ERROR';
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    default:
      return status >= 500 ? 'SERVER_ERROR' : 'UNEXPECTED_ERROR';
  }
}

function inferProblemDetail(status: number): string {
  switch (status) {
    case 0:
      return NETWORK_ERROR_MESSAGE;
    case 401:
      return UNAUTHORIZED_MESSAGE;
    case 403:
      return FORBIDDEN_MESSAGE;
    default:
      return status >= 500 ? SERVER_ERROR_MESSAGE : UNEXPECTED_ERROR_MESSAGE;
  }
}

function normalizeProblemRecord(
  source: Record<string, unknown>,
  defaults?: Partial<ProblemDetails>,
): ProblemDetails | null {
  const fieldErrors = toFieldErrors(source['fieldErrors']);
  const status =
    typeof source['status'] === 'number'
      ? source['status']
      : typeof defaults?.status === 'number'
        ? defaults.status
        : 500;
  const detail =
    toOptionalString(source['detail']) ?? defaults?.detail ?? inferProblemDetail(status);
  const title = toOptionalString(source['title']) ?? defaults?.title ?? inferProblemTitle(status);
  const code = toOptionalString(source['code']) ?? defaults?.code ?? inferProblemCode(status);
  const correlationId =
    toOptionalString(source['correlationId']) ?? toOptionalString(defaults?.correlationId);

  const hasProblemShape =
    'detail' in source ||
    'title' in source ||
    'code' in source ||
    'status' in source ||
    'fieldErrors' in source ||
    fieldErrors.length > 0;

  if (!hasProblemShape && !defaults) {
    return null;
  }

  return {
    status,
    title,
    detail,
    code,
    correlationId,
    fieldErrors,
  };
}

function normalizeHttpErrorResponse(error: HttpErrorResponse): ProblemDetails {
  const correlationId =
    error.headers.get('X-Correlation-Id') ?? error.headers.get('x-correlation-id') ?? undefined;
  const defaults: Partial<ProblemDetails> = {
    status: error.status,
    title: error.statusText || undefined,
    correlationId,
  };

  if (isRecord(error.error)) {
    const normalized = normalizeProblemRecord(error.error, defaults);

    if (normalized) {
      return normalized;
    }
  }

  if (typeof error.error === 'string' && error.error.trim().length > 0) {
    return {
      status: error.status,
      title: error.statusText || inferProblemTitle(error.status),
      detail: error.error.trim(),
      code: inferProblemCode(error.status),
      correlationId,
      fieldErrors: [],
    };
  }

  return {
    status: error.status,
    title: error.statusText || inferProblemTitle(error.status),
    detail: inferProblemDetail(error.status),
    code: inferProblemCode(error.status),
    correlationId,
    fieldErrors: [],
  };
}

export function normalizeProblemDetails(error: unknown): ProblemDetails | null {
  if (error instanceof HttpErrorResponse) {
    return normalizeHttpErrorResponse(error);
  }

  if (!isRecord(error)) {
    return null;
  }

  if ('error' in error) {
    const nestedError = normalizeProblemDetails(error['error']);

    if (nestedError) {
      return nestedError;
    }
  }

  return normalizeProblemRecord(error);
}

export function resolveProblemDetailsFieldErrors(error: unknown): FieldErrorResponse[] {
  return normalizeProblemDetails(error)?.fieldErrors ?? [];
}

function resolveFieldErrorsMessage(fieldErrors: FieldErrorResponse[]): string | null {
  const uniqueMessages = Array.from(
    new Set(
      fieldErrors
        .map((fieldError) => fieldError.message.trim())
        .filter((message) => message.length > 0),
    ),
  );

  if (uniqueMessages.length === 0) {
    return null;
  }

  return uniqueMessages.join(' ');
}

export function resolveProblemDetailsMessage(error: unknown, fallbackMessage: string): string {
  const normalized = normalizeProblemDetails(error);

  if (!normalized) {
    return fallbackMessage;
  }

  const fieldErrorsMessage = resolveFieldErrorsMessage(normalized.fieldErrors ?? []);

  if (fieldErrorsMessage) {
    return fieldErrorsMessage;
  }

  return normalized.detail || normalized.title || fallbackMessage;
}
