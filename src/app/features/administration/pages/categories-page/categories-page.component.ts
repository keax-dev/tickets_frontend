import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Category, ProblemDetails } from '../../../../shared/models/api.models';
import { AdministrationApiService } from '../../services/administration-api.service';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    MessageModule,
    CommonModule,
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
  ],
  templateUrl: './categories-page.component.html',
  styleUrl: './categories-page.component.css',
})
export class CategoriesPageComponent implements OnInit {
  private readonly administrationApiService = inject(AdministrationApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly editingCategoryId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly isEditing = computed(() => this.editingCategoryId() !== null);
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly categoryForm = this.formBuilder.nonNullable.group({
    name: this.formBuilder.nonNullable.control('', { validators: [Validators.required] }),
    description: this.formBuilder.nonNullable.control(''),
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.administrationApiService
      .listCategories()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
        },
        error: (error: ProblemDetails) => {
          this.errorMessage.set(error?.detail ?? 'No fue posible cargar las categorias.');
        },
      });
  }

  startCreate(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({
      name: '',
      description: '',
    });
  }

  editCategory(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.categoryForm.reset({
      name: category.name,
      description: category.description ?? '',
    });
  }

  submit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const rawValue = this.categoryForm.getRawValue();
    const payload = {
      name: rawValue.name.trim(),
      description: rawValue.description.trim() || null,
    };

    this.saving.set(true);
    this.errorMessage.set(null);

    if (this.isEditing()) {
      this.updateCategory(payload);
      return;
    }

    this.createCategory(payload);
  }

  toggleStatus(category: Category): void {
    this.errorMessage.set(null);
    this.administrationApiService.updateCategoryStatus(category.id, !category.active).subscribe({
      next: () => this.loadCategories(),
      error: (error: ProblemDetails) => {
        this.errorMessage.set(
          error?.detail ?? 'No fue posible actualizar el estado de la categoria.',
        );
      },
    });
  }

  private createCategory(payload: { name: string; description: string | null }): void {
    this.administrationApiService
      .createCategory(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.startCreate();
          this.loadCategories();
        },
        error: (error: ProblemDetails) => {
          this.errorMessage.set(error?.detail ?? 'No fue posible crear la categoria.');
        },
      });
  }

  private updateCategory(payload: { name: string; description: string | null }): void {
    this.administrationApiService
      .updateCategory(this.editingCategoryId()!, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.startCreate();
          this.loadCategories();
        },
        error: (error: ProblemDetails) => {
          this.errorMessage.set(error?.detail ?? 'No fue posible actualizar la categoria.');
        },
      });
  }
}
