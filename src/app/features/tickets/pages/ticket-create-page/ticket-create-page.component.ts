import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketPriority } from '../../../../shared/models/api.models';
import { TICKET_PRIORITY_OPTIONS } from '../../../../shared/constants/ui.constants';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TicketCreateStore } from '../../stores/ticket-create.store';

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
  providers: [TicketCreateStore],
  templateUrl: './ticket-create-page.component.html',
  styleUrl: './ticket-create-page.component.css',
})
export class TicketCreatePageComponent implements OnInit {
  private readonly ticketCreateStore = inject(TicketCreateStore);
  private readonly formBuilder = inject(FormBuilder);

  readonly categoryErrorMessage = this.ticketCreateStore.categoryErrorMessage;
  readonly errorMessage = this.ticketCreateStore.errorMessage;
  readonly submitting = this.ticketCreateStore.submitting;
  readonly categories = this.ticketCreateStore.categories;

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

  readonly priorityOptions = TICKET_PRIORITY_OPTIONS;

  ngOnInit(): void {
    this.ticketCreateStore.loadCategories();
  }

  submit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.ticketCreateStore.create(this.ticketForm.getRawValue());
  }
}
