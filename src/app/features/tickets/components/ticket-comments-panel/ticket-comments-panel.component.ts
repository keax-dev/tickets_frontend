import { Component, DestroyRef, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketCommentVisibility } from '../../../../shared/models/api.models';
import { TicketDetailStore } from '../../stores/ticket-detail.store';
import { AuthStore } from '../../../../core/auth/stores/auth.store';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticket-comments-panel',
  standalone: true,
  imports: [ReactiveFormsModule, TextareaModule, ButtonModule, SelectModule, CommonModule],
  templateUrl: './ticket-comments-panel.component.html',
  styleUrl: './ticket-comments-panel.component.css',
})
export class TicketCommentsPanelComponent {
  private readonly authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  readonly ticketDetailStore = inject(TicketDetailStore);
  readonly comments = this.ticketDetailStore.comments;

  readonly canCreateInternalComments = computed(() =>
    this.authStore.hasPermission('COMMENT_CREATE_INTERNAL'),
  );

  readonly canReadInternalComments = computed(() =>
    this.authStore.hasPermission('COMMENT_READ_INTERNAL'),
  );

  readonly visibleComments = computed(() =>
    this.canReadInternalComments()
      ? this.comments()
      : this.comments().filter((comment) => comment.visibility === 'PUBLIC'),
  );

  readonly commentForm = this.formBuilder.nonNullable.group({
    content: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required],
    }),
    visibility: this.formBuilder.nonNullable.control<TicketCommentVisibility>('PUBLIC'),
  });

  readonly visibilityOptions = computed(() => {
    const options: Array<{ label: string; value: TicketCommentVisibility }> = [
      { label: 'Publico', value: 'PUBLIC' },
    ];

    if (this.canCreateInternalComments()) {
      options.push({ label: 'Interno', value: 'INTERNAL' });
    }

    return options;
  });

  addComment(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const rawValue = this.commentForm.getRawValue();

    this.ticketDetailStore
      .addComment(rawValue.content, rawValue.visibility)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((succeeded) => {
        if (succeeded) {
          this.commentForm.reset({ content: '', visibility: 'PUBLIC' });
        }
      });
  }
}
