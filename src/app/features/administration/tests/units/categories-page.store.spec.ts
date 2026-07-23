// Verifies the categories store loads data, refreshes after mutations, and exposes user-facing errors.
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../../shared/models/api.models';
import { CategoriesAdminApiService } from '../../services/categories-admin-api.service';
import { CategoriesPageStore } from '../../stores/categories-page.store';

describe('CategoriesPageStore', () => {
  // Stable category fixtures used to assert list, create, update, and status toggle behavior.
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

  // Service spy references and store instance prepared by the testing module.
  let categoriesAdminApiServiceMock: {
    listCategories: ReturnType<typeof vi.fn>;
    createCategory: ReturnType<typeof vi.fn>;
    updateCategory: ReturnType<typeof vi.fn>;
    updateCategoryStatus: ReturnType<typeof vi.fn>;
  };
  let categoriesPageStore: CategoriesPageStore;

  // Recreates the store with isolated API spies before each test.
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
    // Step 1: execute the store use case responsible for retrieving the category catalog.
    categoriesPageStore.load();

    // Step 2: confirm the store contacted the API exactly once.
    expect(categoriesAdminApiServiceMock.listCategories).toHaveBeenCalledTimes(1);
    // Step 3: confirm the successful backend response was copied into the public state exposed by the store.
    expect(categoriesPageStore.categories()).toEqual(categories);
    // Step 4: after a successful load, the loading flag should be turned off.
    expect(categoriesPageStore.loading()).toBe(false);
    // Step 5: and there should be no user-facing error message left behind.
    expect(categoriesPageStore.errorMessage()).toBeNull();
  });

  it('refreshes the categories after creating one', () => {
    // Step 1: define the payload that the UI would send when a user creates a new category.
    const payload: CreateCategoryRequest = {
      name: 'Software',
      description: 'Applications and licenses',
    };

    // Step 2: execute the create flow. Internally this should call create and then reload the list.
    categoriesPageStore.create(payload);

    // Step 3: validate that the create call received the original form payload unchanged.
    expect(categoriesAdminApiServiceMock.createCategory).toHaveBeenCalledWith(payload);
    // Step 4: validate that the store refreshed the list afterwards so the UI stays synchronized with the backend.
    expect(categoriesAdminApiServiceMock.listCategories).toHaveBeenCalledTimes(1);
    // Step 5: the public categories state should now contain the refreshed server data.
    expect(categoriesPageStore.categories()).toEqual(categories);
    // Step 6: the saving flag must be reset because the mutation already finished.
    expect(categoriesPageStore.saving()).toBe(false);
    // Step 7: saveCompleted acts like a success tick for the component; it should increment after success.
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
    // Step 1: prepare the update payload the UI would normally submit.
    const payload: UpdateCategoryRequest = {
      version: 1,
      name: 'Hardware',
      description: 'Updated description',
    };

    // Step 2: force the update API to fail so the test can focus on the error branch.
    categoriesAdminApiServiceMock.updateCategory.mockReturnValueOnce(
      throwError(() => ({
        error: {
          detail: 'Unable to update the selected category.',
        },
      })),
    );

    // Step 3: execute the failing update operation.
    categoriesPageStore.update('category-1', payload);

    // Step 4: the store should expose the backend message in a user-friendly place for the component to display.
    expect(categoriesPageStore.errorMessage()).toBe('Unable to update the selected category.');
    // Step 5: even when there is an error, the saving flag must always go back to false.
    expect(categoriesPageStore.saving()).toBe(false);
    // Step 6: because the save failed, the success counter must not move.
    expect(categoriesPageStore.saveCompleted()).toBe(0);
  });
});
