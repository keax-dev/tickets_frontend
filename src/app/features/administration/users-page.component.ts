import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AppRole, ProblemDetails, UserRecord } from '../../shared/models/api.models';
import { AdministrationApiService } from './administration-api.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    TagModule,
    MessageModule,
  ],
  template: `
    <section class="page-card page">
      <div class="page-heading">
        <div>
          <h1>Usuarios</h1>
          <p>Alta, edicion y desactivacion de cuentas operativas.</p>
        </div>
        <div class="heading-actions">
          <button
            pButton
            type="button"
            label="Nuevo usuario"
            icon="pi pi-plus"
            (click)="startCreate()"
          ></button>
          <button
            pButton
            type="button"
            label="Recargar"
            icon="pi pi-refresh"
            severity="secondary"
            (click)="loadUsers()"
          ></button>
        </div>
      </div>

      @if (errorMessage()) {
        <p-message severity="error" [text]="errorMessage() ?? ''"></p-message>
      }

      <div class="layout">
        <p-card>
          <p-table [value]="users()" [loading]="loading()">
            <ng-template pTemplate="header">
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th class="actions-column">Acciones</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-user>
              <tr>
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.email }}</td>
                <td><p-tag [value]="roleLabel(user.role)" severity="info"></p-tag></td>
                <td>
                  <p-tag
                    [value]="user.active ? 'Activo' : 'Inactivo'"
                    [severity]="user.active ? 'success' : 'secondary'"
                  ></p-tag>
                </td>
                <td class="actions-cell">
                  <button
                    pButton
                    type="button"
                    size="small"
                    label="Editar"
                    severity="secondary"
                    (click)="editUser(user)"
                  ></button>
                  <button
                    pButton
                    type="button"
                    size="small"
                    [label]="user.active ? 'Desactivar' : 'Activar'"
                    [severity]="user.active ? 'danger' : 'success'"
                    (click)="toggleStatus(user)"
                  ></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <p-card [header]="isEditing() ? 'Editar usuario' : 'Crear usuario'">
          <form class="form" [formGroup]="userForm" (ngSubmit)="submit()">
            <label class="field">
              <span>Nombre</span>
              <input pInputText formControlName="firstName" />
            </label>

            <label class="field">
              <span>Apellido</span>
              <input pInputText formControlName="lastName" />
            </label>

            <label class="field">
              <span>Correo</span>
              <input pInputText type="email" formControlName="email" />
            </label>

            <label class="field">
              <span>Rol</span>
              <p-select
                formControlName="role"
                [options]="roleOptions"
                optionLabel="label"
                optionValue="value"
              ></p-select>
            </label>

            @if (!isEditing()) {
              <label class="field">
                <span>Contrasena inicial</span>
                <p-password
                  formControlName="password"
                  [feedback]="false"
                  [toggleMask]="true"
                ></p-password>
              </label>
            } @else {
              <p class="helper">La edicion conserva la contrasena actual del usuario.</p>
            }

            <div class="form-actions">
              <button
                pButton
                type="submit"
                [label]="isEditing() ? 'Guardar cambios' : 'Crear usuario'"
                [loading]="saving()"
              ></button>
              <button
                pButton
                type="button"
                label="Limpiar"
                severity="secondary"
                (click)="startCreate()"
              ></button>
            </div>
          </form>
        </p-card>
      </div>
    </section>
  `,
  styles: [
    `
      .page {
        padding: 1.5rem;
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(320px, 420px);
        gap: 1rem;
        align-items: start;
      }

      .heading-actions,
      .actions-cell,
      .form-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .actions-column {
        width: 12rem;
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .field span,
      .helper {
        color: var(--app-text-muted);
      }

      @media (max-width: 1080px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class UsersPageComponent {
  private readonly administrationApiService = inject(AdministrationApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly users = signal<UserRecord[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly editingUserId = signal<string | null>(null);
  readonly isEditing = computed(() => this.editingUserId() !== null);

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

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.administrationApiService.listUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error: ProblemDetails) => {
        this.errorMessage.set(error?.detail ?? 'No fue posible cargar los usuarios.');
        this.loading.set(false);
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
      this.administrationApiService
        .updateUser(this.editingUserId()!, {
          firstName: rawValue.firstName.trim(),
          lastName: rawValue.lastName.trim(),
          email: rawValue.email.trim(),
          role: rawValue.role,
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.startCreate();
            this.loadUsers();
          },
          error: (error: ProblemDetails) => {
            this.errorMessage.set(error?.detail ?? 'No fue posible actualizar el usuario.');
            this.saving.set(false);
          },
        });
      return;
    }

    this.administrationApiService
      .createUser({
        firstName: rawValue.firstName.trim(),
        lastName: rawValue.lastName.trim(),
        email: rawValue.email.trim(),
        password: rawValue.password,
        role: rawValue.role,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.startCreate();
          this.loadUsers();
        },
        error: (error: ProblemDetails) => {
          this.errorMessage.set(error?.detail ?? 'No fue posible crear el usuario.');
          this.saving.set(false);
        },
      });
  }

  toggleStatus(user: UserRecord): void {
    this.errorMessage.set(null);
    this.administrationApiService.updateUserStatus(user.id, !user.active).subscribe({
      next: () => this.loadUsers(),
      error: (error: ProblemDetails) => {
        this.errorMessage.set(error?.detail ?? 'No fue posible actualizar el estado del usuario.');
      },
    });
  }

  roleLabel(role: AppRole): string {
    return this.roleOptions.find((option) => option.value === role)?.label ?? role;
  }
}
