import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrySimulatorComponent } from './entry-simulator.component';

describe('EntrySimulatorComponent', () => {
  let component: EntrySimulatorComponent;
  let fixture: ComponentFixture<EntrySimulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrySimulatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EntrySimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
