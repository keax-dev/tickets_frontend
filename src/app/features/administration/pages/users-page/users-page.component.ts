import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, computed, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { AppRole, UserRecord } from '../../../../shared/models/api.models';
import {
  APP_ROLE_OPTIONS,
  getActivationActionLabel,
  getActiveStateLabel,
  getAppRoleLabel,
} from '../../../../shared/constants/ui.constants';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { UsersPageStore } from '../../stores/users-page.store';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    SelectModule,
    CommonModule,
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
  ],
  providers: [UsersPageStore],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.css',
})
export class UsersPageComponent implements OnInit {
  private readonly usersPageStore = inject(UsersPageStore);
  private readonly formBuilder = inject(FormBuilder);

  readonly editingUserVersion = signal<number | null>(null);
  readonly editingUserId = signal<string | null>(null);
  readonly isEditing = computed(() => this.editingUserId() !== null);
  readonly errorMessage = this.usersPageStore.errorMessage;
  readonly loading = this.usersPageStore.loading;
  readonly saving = this.usersPageStore.saving;
  readonly users = this.usersPageStore.users;

  readonly roleOptions = APP_ROLE_OPTIONS;

  readonly userForm = this.formBuilder.nonNullable.group({
    firstName: this.formBuilder.nonNullable.control('', { validators: [Validators.required] }),
    lastName: this.formBuilder.nonNullable.control('', { validators: [Validators.required] }),
    email: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required, Validators.email],
    }),
    password: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(8)],
    }),
    role: this.formBuilder.nonNullable.control<AppRole>('SUPPORT_AGENT', {
      validators: [Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      const saveCompleted = this.usersPageStore.saveCompleted();

      if (saveCompleted > 0) {
        untracked(() => this.startCreate());
      }
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersPageStore.load();
  }

  startCreate(): void {
    this.editingUserVersion.set(null);
    this.editingUserId.set(null);
    this.userForm.reset({
      firstName: '',
      lastName: '',
      password: '',
      email: '',
      role: 'SUPPORT_AGENT',
    });
    this.userForm.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.controls.password.updateValueAndValidity();
  }

  editUser(user: UserRecord): void {
    this.editingUserVersion.set(user.version);
    this.editingUserId.set(user.id);
    this.userForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
    });
    this.userForm.controls.password.clearValidators();
    this.userForm.controls.password.updateValueAndValidity();
  }

  submit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const rawValue = this.userForm.getRawValue();

    if (this.isEditing()) {
      this.updateUser(rawValue);
      return;
    }

    this.createUser(rawValue);
  }

  toggleStatus(user: UserRecord): void {
    this.usersPageStore.toggleStatus(user);
  }

  private createUser(rawValue: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: AppRole;
  }): void {
    this.usersPageStore.create({
      firstName: rawValue.firstName.trim(),
      lastName: rawValue.lastName.trim(),
      email: rawValue.email.trim(),
      password: rawValue.password,
      role: rawValue.role,
    });
  }

  private updateUser(rawValue: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: AppRole;
  }): void {
    this.usersPageStore.update(this.editingUserId()!, {
      version: this.editingUserVersion() ?? 0,
      firstName: rawValue.firstName.trim(),
      lastName: rawValue.lastName.trim(),
      email: rawValue.email.trim(),
      role: rawValue.role,
    });
  }

  roleLabel(role: AppRole): string {
    return getAppRoleLabel(role);
  }

  activeStateLabel(active: boolean): string {
    return getActiveStateLabel(active);
  }

  activationActionLabel(active: boolean): string {
    return getActivationActionLabel(active);
  }
}
