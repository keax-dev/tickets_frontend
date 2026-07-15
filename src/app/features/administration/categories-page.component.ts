import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { Category, ProblemDetails } from '../../shared/models/api.models';
import { AdministrationApiService } from './administration-api.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    TagModule,
    MessageModule,
  ],
  template: `
    <section class="page-card page">
      <div class="page-heading">
        <div>
          <h1>Categorias</h1>
          <p>Manten el catalogo que clasifica tickets y alimenta sus reglas SLA.</p>
        </div>
        <div class="heading-actions">
          <button
            pButton
            type="button"
            label="Nueva categoria"
            icon="pi pi-plus"
            (click)="startCreate()"
          ></button>
          <button
            pButton
            type="button"
            label="Recargar"
            icon="pi pi-refresh"
            severity="secondary"
            (click)="loadCategories()"
          ></button>
        </div>
      </div>

      @if (errorMessage()) {
        <p-message severity="error" [text]="errorMessage() ?? ''"></p-message>
      }

      <div class="layout">
        <p-card>
          <p-table [value]="categories()" [loading]="loading()">
            <ng-template pTemplate="header">
              <tr>
                <th>Nombre</th>
                <th>Descripcion</th>
                <th>Estado</th>
                <th class="actions-column">Acciones</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-category>
              <tr>
                <td>{{ category.name }}</td>
                <td>{{ category.description || 'Sin descripcion' }}</td>
                <td>
                  <p-tag
                    [value]="category.active ? 'Activa' : 'Inactiva'"
                    [severity]="category.active ? 'success' : 'secondary'"
                  ></p-tag>
                </td>
                <td class="actions-cell">
                  <button
                    pButton
                    type="button"
                    size="small"
                    label="Editar"
                    severity="secondary"
                    (click)="editCategory(category)"
                  ></button>
                  <button
                    pButton
                    type="button"
                    size="small"
                    [label]="category.active ? 'Desactivar' : 'Activar'"
                    [severity]="category.active ? 'danger' : 'success'"
                    (click)="toggleStatus(category)"
                  ></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <p-card [header]="isEditing() ? 'Editar categoria' : 'Crear categoria'">
          <form class="form" [formGroup]="categoryForm" (ngSubmit)="submit()">
            <label class="field">
              <span>Nombre</span>
              <input pInputText formControlName="name" />
            </label>

            <label class="field">
              <span>Descripcion</span>
              <textarea pTextarea formControlName="description" rows="5"></textarea>
            </label>

            <div class="form-actions">
              <button
                pButton
                type="submit"
                [label]="isEditing() ? 'Guardar cambios' : 'Crear categoria'"
                [loading]="saving()"
              ></button>
              <button
                pButton
                type="button"
                label="Limpiar"
                severity="secondary"
                (click)="startCreate()"
              ></button>
            </div>
          </form>
        </p-card>
      </div>
    </section>
  `,
  styles: [
    `
      .page {
        padding: 1.5rem;
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(320px, 420px);
        gap: 1rem;
        align-items: start;
      }

      .heading-actions,
      .actions-cell,
      .form-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .actions-column {
        width: 12rem;
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .field span {
        color: var(--app-text-muted);
      }

      @media (max-width: 1080px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CategoriesPageComponent {
  private readonly administrationApiService = inject(AdministrationApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly editingCategoryId = signal<string | null>(null);
  readonly isEditing = computed(() => this.editingCategoryId() !== null);

  readonly categoryForm = this.formBuilder.nonNullable.group({
    name: this.formBuilder.nonNullable.control('', { validators: [Validators.required] }),
    description: this.formBuilder.nonNullable.control(''),
  });

  constructor() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.administrationApiService.listCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (error: ProblemDetails) => {
        this.errorMessage.set(error?.detail ?? 'No fue posible cargar las categorias.');
        this.loading.set(false);
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
      this.administrationApiService.updateCategory(this.editingCategoryId()!, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.startCreate();
          this.loadCategories();
        },
        error: (error: ProblemDetails) => {
          this.errorMessage.set(error?.detail ?? 'No fue posible actualizar la categoria.');
          this.saving.set(false);
        },
      });
      return;
    }

    this.administrationApiService.createCategory(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.startCreate();
        this.loadCategories();
      },
      error: (error: ProblemDetails) => {
        this.errorMessage.set(error?.detail ?? 'No fue posible crear la categoria.');
        this.saving.set(false);
      },
    });
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
}
