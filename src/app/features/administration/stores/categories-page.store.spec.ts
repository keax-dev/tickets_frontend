import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../shared/models/api.models';
import { CategoriesAdminApiService } from '../services/categories-admin-api.service';
import { CategoriesPageStore } from './categories-page.store';

describe('CategoriesPageStore', () => {
  const categories: Category[] = [
    {
      id: 'category-1',
      name: 'Hardware',
      description: 'Physical devices',
      active: true,
      version: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'category-2',
      name: 'Network',
      description: 'Connectivity incidents',
      active: false,
      version: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  let categoriesAdminApiServiceMock: {
    listCategories: ReturnType<typeof vi.fn>;
    createCategory: ReturnType<typeof vi.fn>;
    updateCategory: ReturnType<typeof vi.fn>;
    updateCategoryStatus: ReturnType<typeof vi.fn>;
  };
  let categoriesPageStore: CategoriesPageStore;

  beforeEach(() => {
    categoriesAdminApiServiceMock = {
      listCategories: vi.fn(() => of(categories)),
      createCategory: vi.fn(() => of(categories[0])),
      updateCategory: vi.fn(() => of(categories[0])),
      updateCategoryStatus: vi.fn(() => of(categories[1])),
    };

    TestBed.configureTestingModule({
      providers: [
        CategoriesPageStore,
        {
          provide: CategoriesAdminApiService,
          useValue: categoriesAdminApiServiceMock,
        },
      ],
    });

    categoriesPageStore = TestBed.inject(CategoriesPageStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads the categories list', () => {
    categoriesPageStore.load();

    expect(categoriesAdminApiServiceMock.listCategories).toHaveBeenCalledTimes(1);
    expect(categoriesPageStore.categories()).toEqual(categories);
    expect(categoriesPageStore.loading()).toBe(false);
    expect(categoriesPageStore.errorMessage()).toBeNull();
  });

  it('refreshes the categories after creating one', () => {
    const payload: CreateCategoryRequest = {
      name: 'Software',
      description: 'Applications and licenses',
    };

    categoriesPageStore.create(payload);

    expect(categoriesAdminApiServiceMock.createCategory).toHaveBeenCalledWith(payload);
    expect(categoriesAdminApiServiceMock.listCategories).toHaveBeenCalledTimes(1);
    expect(categoriesPageStore.categories()).toEqual(categories);
    expect(categoriesPageStore.saving()).toBe(false);
    expect(categoriesPageStore.saveCompleted()).toBe(1);
  });

  it('sends the inverted active flag when toggling a category status', () => {
    categoriesPageStore.toggleStatus(categories[1]);

    expect(categoriesAdminApiServiceMock.updateCategoryStatus).toHaveBeenCalledWith('category-2', {
      version: 2,
      active: true,
    });
    expect(categoriesAdminApiServiceMock.listCategories).toHaveBeenCalledTimes(1);
    expect(categoriesPageStore.categories()).toEqual(categories);
  });

  it('stores an actionable error when updating a category fails', () => {
    const payload: UpdateCategoryRequest = {
      version: 1,
      name: 'Hardware',
      description: 'Updated description',
    };

    categoriesAdminApiServiceMock.updateCategory.mockReturnValueOnce(
      throwError(() => ({
        error: {
          detail: 'Unable to update the selected category.',
        },
      })),
    );

    categoriesPageStore.update('category-1', payload);

    expect(categoriesPageStore.errorMessage()).toBe('Unable to update the selected category.');
    expect(categoriesPageStore.saving()).toBe(false);
    expect(categoriesPageStore.saveCompleted()).toBe(0);
  });
});
