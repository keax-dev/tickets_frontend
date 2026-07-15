import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
  ],
  template: `
    <div class="login-page">
      <div class="hero">
        <p class="eyebrow">Sistema senior de soporte</p>
        <h1>Gestiona tickets con foco en operacion, SLA y trazabilidad.</h1>
        <p>
          La sesion usa access token en memoria y refresh token seguro en cookie HttpOnly, alineado
          con el backend que acabamos de montar.
        </p>
      </div>

      <p-card class="login-card">
        <ng-template pTemplate="title">Ingresar</ng-template>
        <ng-template pTemplate="subtitle"
          >Usa una cuenta local de demostracion o tus credenciales.</ng-template
        >

        <form [formGroup]="loginForm" (ngSubmit)="submit()">
          <label class="field">
            <span>Correo</span>
            <input
              pInputText
              type="email"
              formControlName="email"
              placeholder="admin@tickets.local"
            />
          </label>

          <label class="field">
            <span>Contrasena</span>
            <p-password
              formControlName="password"
              [feedback]="false"
              [toggleMask]="true"
              inputStyleClass="w-full"
              placeholder="Password123!"
            />
          </label>

          @if (showValidationError()) {
            <p-message severity="warn" text="Completa correo y contrasena para continuar." />
          }

          @if (authStore.errorMessage()) {
            <p-message severity="error" [text]="authStore.errorMessage() ?? ''" />
          }

          <button
            pButton
            type="submit"
            label="Ingresar"
            [loading]="authStore.loading()"
            class="submit-button"
          ></button>
        </form>

        <div class="helper">
          <strong>Credenciales locales:</strong>
          <span
            ><code>admin@tickets.local</code>, <code>manager@tickets.local</code>,
            <code>agent@tickets.local</code>, <code>customer@tickets.local</code></span
          >
          <span>Contrasena: <code>Password123!</code></span>
        </div>
      </p-card>
    </div>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1.2fr minmax(320px, 420px);
        gap: 2rem;
        padding: 2rem;
        align-items: center;
      }

      .hero {
        padding: 2rem;
      }

      .hero h1 {
        margin: 0 0 1rem;
        font-size: clamp(2.4rem, 5vw, 4.6rem);
        line-height: 0.92;
      }

      .hero p:last-child {
        color: var(--app-text-muted);
        max-width: 50ch;
      }

      .login-card {
        border-radius: 28px;
        overflow: hidden;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .field span {
        font-weight: 600;
      }

      .submit-button {
        margin-top: 0.5rem;
      }

      .helper {
        margin-top: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        color: var(--app-text-muted);
        font-size: 0.9rem;
      }

      @media (max-width: 920px) {
        .login-page {
          grid-template-columns: 1fr;
        }

        .hero {
          padding: 0;
        }
      }
    `,
  ],
})
export class LoginPageComponent {
  readonly authStore = inject(AuthStore);

  private readonly formBuilder = inject(FormBuilder);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: this.formBuilder.nonNullable.control('admin@tickets.local', {
      validators: [Validators.required, Validators.email],
    }),
    password: this.formBuilder.nonNullable.control('Password123!', {
      validators: [Validators.required],
    }),
  });

  readonly showValidationError = () => this.loginForm.invalid && this.loginForm.touched;

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authStore.login(this.loginForm.getRawValue());
  }
}
