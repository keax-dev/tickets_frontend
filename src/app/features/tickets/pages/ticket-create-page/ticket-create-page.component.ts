import { DestroyRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { resolveProblemDetailsMessage } from '../../../../shared/utils/resolve-problem-details-message';
import { Category, TicketPriority } from '../../../../shared/models/api.models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketApiService } from '../../services/ticket-api.service';
import { InputTextModule } from 'primeng/inputtext';
import { ProblemDetails } from '../../../../shared/models/api.models';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    MessageModule,
    ButtonModule,
    SelectModule,
    CommonModule,
    CardModule,
  ],
  templateUrl: './ticket-create-page.component.html',
  styleUrl: './ticket-create-page.component.css',
})
export class TicketCreatePageComponent implements OnInit {
  private readonly ticketApiService = inject(TicketApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly categoryErrorMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly categories = signal<Category[]>([]);

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

  ngOnInit(): void {
    this.categoryErrorMessage.set(null);
    this.ticketApiService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories.filter((category) => category.active));
        },
        error: (error: ProblemDetails) => {
          this.categories.set([]);
          this.categoryErrorMessage.set(
            resolveProblemDetailsMessage(error, 'No fue posible cargar las categorias.'),
          );
        },
      });
  }

  submit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);
    this.ticketApiService
      .createTicket(this.ticketForm.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (ticket) => {
          void this.router.navigate(['/tickets', ticket.id]);
        },
        error: (error) => {
          this.errorMessage.set(
            resolveProblemDetailsMessage(error, 'No fue posible crear el ticket.'),
          );
        },
      });
  }
}
