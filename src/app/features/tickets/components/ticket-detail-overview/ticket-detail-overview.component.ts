import { Component, DestroyRef, computed, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketDetail } from '../../../../shared/models/api.models';
import { TicketDetailStore } from '../../stores/ticket-detail.store';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-ticket-detail-overview',
  standalone: true,
  imports: [ReactiveFormsModule, TextareaModule, ButtonModule],
  templateUrl: './ticket-detail-overview.component.html',
  styleUrl: './ticket-detail-overview.component.css',
})
export class TicketDetailOverviewComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  readonly ticketDetailStore = inject(TicketDetailStore);
  readonly ticket = input.required<TicketDetail>();

  readonly canRequestInformation = computed(() =>
    this.ticket().availableActions.includes('request-information'),
  );

  readonly canResolve = computed(() => this.ticket().availableActions.includes('resolve'));

  readonly requestInformationForm = this.formBuilder.nonNullable.group({
    content: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required],
    }),
  });

  readonly resolveForm = this.formBuilder.nonNullable.group({
    resolutionSummary: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required],
    }),
  });

  requestInformation(): void {
    if (this.requestInformationForm.invalid) {
      this.requestInformationForm.markAllAsTouched();
      return;
    }

    this.ticketDetailStore
      .requestInformation(this.requestInformationForm.getRawValue().content)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((succeeded) => {
        if (succeeded) {
          this.requestInformationForm.reset({ content: '' });
        }
      });
  }

  resolve(): void {
    if (this.resolveForm.invalid) {
      this.resolveForm.markAllAsTouched();
      return;
    }

    this.ticketDetailStore
      .resolveTicket(this.resolveForm.getRawValue().resolutionSummary)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((succeeded) => {
        if (succeeded) {
          this.resolveForm.reset({ resolutionSummary: '' });
        }
      });
  }
}
