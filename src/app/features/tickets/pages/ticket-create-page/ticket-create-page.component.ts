import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TicketApiService } from '../../services/ticket-api.service';
import { InputTextModule } from 'primeng/inputtext';
import { TicketPriority } from '../../../../shared/models/api.models';
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
    TextareaModule,
    MessageModule,
    ButtonModule,
    SelectModule,
    CommonModule,
    CardModule,
    InputTextModule,
  ],
  templateUrl: './ticket-create-page.component.html',
  styleUrl: './ticket-create-page.component.css',
})
export class TicketCreatePageComponent implements OnInit {
  private readonly ticketApiService = inject(TicketApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly errorMessage = signal<string | null>(null);
  readonly submitting = signal(false);

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

  ngOnInit(): void {
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
    this.ticketApiService
      .createTicket(this.ticketForm.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (ticket) => {
          void this.router.navigate(['/tickets', ticket.id]);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.detail ?? 'No fue posible crear el ticket.');
        },
      });
  }
}
