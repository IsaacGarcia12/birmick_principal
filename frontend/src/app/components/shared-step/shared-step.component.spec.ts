import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedStepComponent } from './shared-step.component';

describe('SharedStepComponent', () => {
  let component: SharedStepComponent;
  let fixture: ComponentFixture<SharedStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
