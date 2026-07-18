import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, switchMap } from 'rxjs';
import { resolveProblemDetailsMessage } from '../../../shared/utils/resolve-problem-details-message';
import {
  Category,
  CreateCategoryRequest,
  ProblemDetails,
  UpdateCategoryRequest,
} from '../../../shared/models/api.models';
import { CategoriesAdminApiService } from '../services/categories-admin-api.service';

@Injectable()
export class CategoriesPageStore {
  private readonly categoriesAdminApiService = inject(CategoriesAdminApiService);

  private readonly categoriesState = signal<Category[]>([]);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly saveCompletedState = signal(0);

  readonly categories = this.categoriesState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();
  readonly saveCompleted = this.saveCompletedState.asReadonly();

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.categoriesAdminApiService
      .listCategories()
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (categories) => {
          this.categoriesState.set(categories);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(resolveProblemDetailsMessage(error, 'Unable to load categories.'));
        },
      });
  }

  create(payload: CreateCategoryRequest): void {
    this.runSave(
      this.categoriesAdminApiService.createCategory(payload),
      'Unable to create the category.',
    );
  }

  update(categoryId: string, payload: UpdateCategoryRequest): void {
    this.runSave(
      this.categoriesAdminApiService.updateCategory(categoryId, payload),
      'Unable to update the category.',
    );
  }

  toggleStatus(category: Category): void {
    this.errorState.set(null);

    this.categoriesAdminApiService
      .updateCategoryStatus(category.id, {
        version: category.version,
        active: !category.active,
      })
      .pipe(switchMap(() => this.categoriesAdminApiService.listCategories()))
      .subscribe({
        next: (categories) => {
          this.categoriesState.set(categories);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(
            resolveProblemDetailsMessage(error, 'Unable to update the category status.'),
          );
        },
      });
  }

  private runSave(request$: Observable<unknown>, fallbackMessage: string): void {
    this.savingState.set(true);
    this.errorState.set(null);

    request$
      .pipe(
        switchMap(() => this.categoriesAdminApiService.listCategories()),
        finalize(() => this.savingState.set(false)),
      )
      .subscribe({
        next: (categories) => {
          this.categoriesState.set(categories);
          this.saveCompletedState.update((value) => value + 1);
        },
        error: (error: ProblemDetails) => {
          this.errorState.set(resolveProblemDetailsMessage(error, fallbackMessage));
        },
      });
  }
}
