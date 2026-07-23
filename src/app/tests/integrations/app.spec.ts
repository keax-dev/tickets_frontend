// Confirms the root standalone app can be compiled and instantiated by Angular.
import { TestBed } from '@angular/core/testing';
import { App } from '../../app';

describe('App', () => {
  // Compile the root component once per test to mirror the real bootstrap path.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    // Step 1: ask Angular to instantiate the real root component exactly as the app would do at runtime.
    const fixture = TestBed.createComponent(App);
    // Step 2: grab the component class instance from the fixture so we can assert it exists.
    const app = fixture.componentInstance;
    // Step 3: the most basic integration assertion is that Angular was able to build the app without crashing.
    expect(app).toBeTruthy();
  });
});
