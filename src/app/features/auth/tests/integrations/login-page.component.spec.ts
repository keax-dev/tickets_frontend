// Covers the login page form by asserting valid submissions and invalid-form feedback.
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AuthStore } from '../../../../core/auth/stores/auth.store';
import { LoginPageComponent } from '../../pages/login-page/login-page.component';

describe('LoginPageComponent', () => {
  // Minimal auth store facade used to drive the component without real HTTP calls.
  const authStoreMock = {
    errorMessage: signal<string | null>(null),
    loading: signal(false),
    login: vi.fn(),
  };

  // Compiles the page once per test with fresh auth spies.
  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('submits valid credentials through AuthStore', () => {
    // Step 1: create the page component so the test can interact with the same form used by the UI.
    const fixture = TestBed.createComponent(LoginPageComponent);
    // Step 2: extract the component instance because the submit logic lives in the class, not in the template.
    const component = fixture.componentInstance;

    // Step 3: fill the reactive form with a valid email/password pair, just as a real user would do from the screen.
    component.loginForm.setValue({
      email: 'agent@tickets.local',
      password: 'SecurePass!234',
    });

    // Step 4: execute the submit handler. This is the action under test.
    component.submit();

    // Step 5: verify that the component delegated the login to AuthStore with the exact same payload.
    expect(authStoreMock.login).toHaveBeenCalledWith({
      email: 'agent@tickets.local',
      password: 'SecurePass!234',
    });
  });

  it('shows validation feedback and skips submit when the form is invalid', () => {
    // Step 1: create the page without populating the form so it remains invalid on purpose.
    const fixture = TestBed.createComponent(LoginPageComponent);
    // Step 2: get the component instance to call the submit method directly.
    const component = fixture.componentInstance;

    // Step 3: run the first change detection so bindings and the initial template state are ready.
    fixture.detectChanges();
    // Step 4: submit the empty form. The component should stop before calling the store.
    component.submit();
    // Step 5: run change detection again so the validation message becomes visible in the DOM.
    fixture.detectChanges();

    // Step 6: the auth store must not be called because invalid data should never trigger a backend request.
    expect(authStoreMock.login).not.toHaveBeenCalled();
    // Step 7: the component exposes a dedicated signal/helper that should now indicate validation errors are visible.
    expect(component.showValidationError()).toBe(true);
    // Step 8: finally verify that the user-facing validation text is actually rendered on screen.
    expect(fixture.nativeElement.textContent).toContain('Ingresa correo');
  });
});
