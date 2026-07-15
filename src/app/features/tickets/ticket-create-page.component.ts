import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TicketPriority } from '../../shared/models/api.models';
import { TicketApiService } from './ticket-api.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    MessageModule,
    SelectModule,
    TextareaModule,
  ],
  template: `
    <section class="page-card page">
      <div class="page-heading">
        <div>
          <h1>Nuevo ticket</h1>
          <p>Crea una solicitud con idempotencia para evitar tickets duplicados por reintentos.</p>
        </div>
      </div>

      <form class="stack" [formGroup]="ticketForm" (ngSubmit)="submit()">
        <label class="field">
          <span>Título</span>
          <input pInputText formControlName="title" />
        </label>

        <label class="field">
          <span>Descripción</span>
          <textarea pTextarea formControlName="description" rows="7"></textarea>
        </label>

        <div class="grid">
          <label class="field">
            <span>Categoría</span>
            <p-select
              formControlName="categoryId"
              [options]="categories"
              optionLabel="name"
              optionValue="id"
            ></p-select>
          </label>

          <label class="field">
            <span>Prioridad</span>
            <p-select
              formControlName="priority"
              [options]="priorityOptions"
              optionLabel="label"
              optionValue="value"
            ></p-select>
          </label>
        </div>

        @if (errorMessage()) {
          <p-message severity="error" [text]="errorMessage() ?? ''"></p-message>
        }

        <div class="actions">
          <button pButton type="submit" label="Crear ticket" [loading]="submitting()"></button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .page {
        padding: 1.5rem;
      }

      .stack {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
      }
    `,
  ],
})
export class TicketCreatePageComponent {
  private readonly ticketApiService = inject(TicketApiService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly ticketForm = this.formBuilder.nonNullable.group({
    title: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    description: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required, Validators.maxLength(5000)],
    }),
    categoryId: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required],
    }),
    priority: this.formBuilder.nonNullable.control<TicketPriority>('MEDIUM'),
  });

  readonly priorityOptions = [
    { label: 'Baja', value: 'LOW' as TicketPriority },
    { label: 'Media', value: 'MEDIUM' as TicketPriority },
    { label: 'Alta', value: 'HIGH' as TicketPriority },
    { label: 'Urgente', value: 'URGENT' as TicketPriority },
  ];

  categories: { id: string; name: string }[] = [];

  constructor() {
    this.ticketApiService.getCategories().subscribe((categories) => {
      this.categories = categories.filter((category) => category.active);
    });
  }

  submit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.ticketApiService.createTicket(this.ticketForm.getRawValue()).subscribe({
      next: (ticket) => {
        this.submitting.set(false);
        void this.router.navigate(['/tickets', ticket.id]);
      },
      error: (error) => {
        this.submitting.set(false);
        this.errorMessage.set(error?.error?.detail ?? 'No fue posible crear el ticket.');
      },
    });
  }
}
