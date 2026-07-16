import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AppRole, ProblemDetails, UserRecord } from '../../../../shared/models/api.models';
import { AdministrationApiService } from '../../services/administration-api.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';
import { resolveProblemDetailsMessage } from '../../../../shared/utils/resolve-problem-details-message';

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
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.css',
})
export class UsersPageComponent implements OnInit {
  private readonly administrationApiService = inject(AdministrationApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly editingUserId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isEditing = computed(() => this.editingUserId() !== null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly users = signal<UserRecord[]>([]);

  readonly roleOptions = [
    { label: 'Administrador', value: 'ADMIN' as const },
    { label: 'Manager de soporte', value: 'SUPPORT_MANAGER' as const },
    { label: 'Agente de soporte', value: 'SUPPORT_AGENT' as const },
    { label: 'Cliente', value: 'CUSTOMER' as const },
  ];

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

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.administrationApiService
      .listUsers()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (users) => {
          this.users.set(users);
        },
        error: (error: ProblemDetails) => {
          this.errorMessage.set(
            resolveProblemDetailsMessage(error, 'No fue posible cargar los usuarios.'),
          );
        },
      });
  }

  startCreate(): void {
    this.editingUserId.set(null);
    this.userForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'SUPPORT_AGENT',
    });
    this.userForm.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.controls.password.updateValueAndValidity();
  }

  editUser(user: UserRecord): void {
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
    this.saving.set(true);
    this.errorMessage.set(null);

    if (this.isEditing()) {
      this.updateUser(rawValue);
      return;
    }

    this.createUser(rawValue);
  }

  toggleStatus(user: UserRecord): void {
    this.errorMessage.set(null);
    this.administrationApiService.updateUserStatus(user.id, !user.active).subscribe({
      next: () => this.loadUsers(),
      error: (error: ProblemDetails) => {
        this.errorMessage.set(
          resolveProblemDetailsMessage(error, 'No fue posible actualizar el estado del usuario.'),
        );
      },
    });
  }

  private createUser(rawValue: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: AppRole;
  }): void {
    this.administrationApiService
      .createUser({
        firstName: rawValue.firstName.trim(),
        lastName: rawValue.lastName.trim(),
        email: rawValue.email.trim(),
        password: rawValue.password,
        role: rawValue.role,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.startCreate();
          this.loadUsers();
        },
        error: (error: ProblemDetails) => {
          this.errorMessage.set(
            resolveProblemDetailsMessage(error, 'No fue posible crear el usuario.'),
          );
        },
      });
  }

  private updateUser(rawValue: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: AppRole;
  }): void {
    this.administrationApiService
      .updateUser(this.editingUserId()!, {
        firstName: rawValue.firstName.trim(),
        lastName: rawValue.lastName.trim(),
        email: rawValue.email.trim(),
        role: rawValue.role,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.startCreate();
          this.loadUsers();
        },
        error: (error: ProblemDetails) => {
          this.errorMessage.set(
            resolveProblemDetailsMessage(error, 'No fue posible actualizar el usuario.'),
          );
        },
      });
  }

  roleLabel(role: AppRole): string {
    return this.roleOptions.find((option) => option.value === role)?.label ?? role;
  }
}
