import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AuthStore } from '../../../../core/auth/stores/auth.store';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    CommonModule,
    ButtonModule,
    CardModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
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
