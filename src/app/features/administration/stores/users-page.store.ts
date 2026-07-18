import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, switchMap } from 'rxjs';
import { resolveProblemDetailsMessage } from '../../../shared/utils/resolve-problem-details-message';
import {
  CreateUserRequest,
  ProblemDetails,
  UpdateUserRequest,
  UserRecord,
} from '../../../shared/models/api.models';
import { UsersAdminApiService } from '../services/users-admin-api.service';

@Injectable()
export class UsersPageStore {
  private readonly usersAdminApiService = inject(UsersAdminApiService);

  private readonly usersState = signal<UserRecord[]>([]);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly saveCompletedState = signal(0);

  readonly users = this.usersState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();
  readonly saveCompleted = this.saveCompletedState.asReadonly();

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.usersAdminApiService
      .listUsers()
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (users) => {
          this.usersState.set(users);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(resolveProblemDetailsMessage(error, 'Unable to load users.'));
        },
      });
  }

  create(payload: CreateUserRequest): void {
    this.runSave(this.usersAdminApiService.createUser(payload), 'Unable to create the user.');
  }

  update(userId: string, payload: UpdateUserRequest): void {
    this.runSave(
      this.usersAdminApiService.updateUser(userId, payload),
      'Unable to update the user.',
    );
  }

  toggleStatus(user: UserRecord): void {
    this.errorState.set(null);

    this.usersAdminApiService
      .updateUserStatus(user.id, { version: user.version, active: !user.active })
      .pipe(switchMap(() => this.usersAdminApiService.listUsers()))
      .subscribe({
        next: (users) => {
          this.usersState.set(users);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(
            resolveProblemDetailsMessage(error, 'Unable to update the user status.'),
          );
        },
      });
  }

  private runSave(request$: Observable<unknown>, fallbackMessage: string): void {
    this.savingState.set(true);
    this.errorState.set(null);

    request$
      .pipe(
        switchMap(() => this.usersAdminApiService.listUsers()),
        finalize(() => this.savingState.set(false)),
      )
      .subscribe({
        next: (users) => {
          this.usersState.set(users);
          this.saveCompletedState.update((value) => value + 1);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(resolveProblemDetailsMessage(error, fallbackMessage));
        },
      });
  }
}
