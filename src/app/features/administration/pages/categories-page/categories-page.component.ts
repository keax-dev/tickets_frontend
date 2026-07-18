import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, computed, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { Category } from '../../../../shared/models/api.models';
import {
  getActivationActionLabel,
  getActiveStateLabel,
} from '../../../../shared/constants/ui.constants';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { CategoriesPageStore } from '../../stores/categories-page.store';

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
  providers: [CategoriesPageStore],
  templateUrl: './categories-page.component.html',
  styleUrl: './categories-page.component.css',
})
export class CategoriesPageComponent implements OnInit {
  private readonly categoriesPageStore = inject(CategoriesPageStore);
  private readonly formBuilder = inject(FormBuilder);

  readonly editingCategoryId = signal<string | null>(null);
  readonly editingCategoryVersion = signal<number | null>(null);
  readonly isEditing = computed(() => this.editingCategoryId() !== null);
  readonly errorMessage = this.categoriesPageStore.errorMessage;
  readonly categories = this.categoriesPageStore.categories;
  readonly loading = this.categoriesPageStore.loading;
  readonly saving = this.categoriesPageStore.saving;

  readonly categoryForm = this.formBuilder.nonNullable.group({
    name: this.formBuilder.nonNullable.control('', { validators: [Validators.required] }),
    description: this.formBuilder.nonNullable.control(''),
  });

  constructor() {
    effect(() => {
      const saveCompleted = this.categoriesPageStore.saveCompleted();

      if (saveCompleted > 0) {
        untracked(() => this.startCreate());
      }
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriesPageStore.load();
  }

  startCreate(): void {
    this.editingCategoryId.set(null);
    this.editingCategoryVersion.set(null);
    this.categoryForm.reset({
      name: '',
      description: '',
    });
  }

  editCategory(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.editingCategoryVersion.set(category.version);
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

    if (this.isEditing()) {
      this.updateCategory(payload);
      return;
    }

    this.createCategory(payload);
  }

  toggleStatus(category: Category): void {
    this.categoriesPageStore.toggleStatus(category);
  }

  private createCategory(payload: { name: string; description: string | null }): void {
    this.categoriesPageStore.create(payload);
  }

  private updateCategory(payload: { name: string; description: string | null }): void {
    this.categoriesPageStore.update(this.editingCategoryId()!, {
      version: this.editingCategoryVersion() ?? 0,
      ...payload,
    });
  }

  activeStateLabel(active: boolean): string {
    return getActiveStateLabel(active);
  }

  activationActionLabel(active: boolean): string {
    return getActivationActionLabel(active);
  }
}
