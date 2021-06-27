import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedStudioComponent } from './shared-studio.component';

describe('SharedStudioComponent', () => {
  let component: SharedStudioComponent;
  let fixture: ComponentFixture<SharedStudioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedStudioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedStudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
